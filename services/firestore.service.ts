// ============================================================
// HOMEYX - Firebase Firestore Service (Per-User Isolation)
// Each Google user has their own private subcollection under `users/{uid}/items`
// ============================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HomeItem, StockMovement, MovementType } from "@/types";
import { INITIAL_ITEMS } from "@/lib/storage";

function userItemsCol(uid: string) {
  return collection(db, "users", uid, "items");
}

function userMovementsCol(uid: string) {
  return collection(db, "users", uid, "movements");
}

/**
 * Initialize default items for brand new user
 */
export async function seedNewUserIfEmpty(uid: string): Promise<HomeItem[]> {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  // If user metadata document exists and already marked as initialized, do NOT re-seed when empty!
  if (userDocSnap.exists() && userDocSnap.data()?.initialized) {
    return [];
  }

  const col = userItemsCol(uid);
  const snap = await getDocs(col);
  if (!snap.empty) {
    await setDoc(userDocRef, { initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as HomeItem));
  }

  // Populate initial starter items
  const batch = writeBatch(db);
  const seeded: HomeItem[] = [];

  for (const item of INITIAL_ITEMS) {
    const itemRef = doc(col, item.id);
    const itemData: HomeItem = {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(itemRef, itemData);
    seeded.push(itemData);
  }

  // Mark user as initialized so deleting items will never re-seed them!
  batch.set(userDocRef, { initialized: true, createdAt: new Date().toISOString() }, { merge: true });

  await batch.commit();
  return seeded;
}

/**
 * Fetch all items for specific user
 */
export async function getFirestoreItems(uid: string): Promise<HomeItem[]> {
  if (!uid) return [];
  const col = userItemsCol(uid);
  const snap = await getDocs(col);

  if (snap.empty) {
    return seedNewUserIfEmpty(uid);
  }

  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as HomeItem));
}

/**
 * Save / Create item for specific user
 */
export async function saveFirestoreItem(
  uid: string,
  itemData: Omit<HomeItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<HomeItem> {
  const now = new Date().toISOString();
  const col = userItemsCol(uid);

  if (itemData.id) {
    const ref = doc(db, "users", uid, "items", itemData.id);
    const prevSnap = await getDoc(ref);
    const prev = prevSnap.data() as HomeItem | undefined;

    const updated: HomeItem = {
      ...(prev || {}),
      ...itemData,
      id: itemData.id,
      updatedAt: now,
    } as HomeItem;

    await setDoc(ref, updated, { merge: true });
    return updated;
  }

  // Create new doc
  const newRef = doc(col);
  const newItem: HomeItem = {
    ...itemData,
    id: newRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newRef, newItem);

  // Log creation movement
  await recordFirestoreMovement(uid, {
    itemId: newItem.id,
    itemCode: newItem.code,
    itemName: newItem.name,
    type: "initial",
    quantityBefore: 0,
    quantityChange: newItem.quantity,
    quantityAfter: newItem.quantity,
    unit: newItem.unit,
    reason: "เพิ่มของใช้ใหม่เข้าระบบ",
  });

  return newItem;
}

/**
 * Delete item
 */
export async function deleteFirestoreItem(uid: string, itemId: string): Promise<boolean> {
  const ref = doc(db, "users", uid, "items", itemId);
  await deleteDoc(ref);
  // Ensure user doc records that this user has taken actions and is initialized
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, { initialized: true, updatedAt: new Date().toISOString() }, { merge: true });
  return true;
}

/**
 * Quick +/- Adjust quantity
 */
export async function adjustFirestoreStock(
  uid: string,
  itemId: string,
  delta: number,
  reason?: string
): Promise<HomeItem | undefined> {
  const ref = doc(db, "users", uid, "items", itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return undefined;

  const item = snap.data() as HomeItem;
  const oldQty = item.quantity;
  const newQty = Math.max(0, oldQty + delta);
  if (oldQty === newQty) return item;

  const now = new Date().toISOString();
  const type: MovementType = delta > 0 ? "restock" : "consume";
  const shouldFlagShopping = newQty <= item.minStockLevel;

  const updated: HomeItem = {
    ...item,
    quantity: newQty,
    isInShoppingList: item.isInShoppingList || shouldFlagShopping,
    shoppingQuantity: item.shoppingQuantity || (item.targetStockLevel ? Math.max(1, item.targetStockLevel - newQty) : 1),
    lastRestockedAt: delta > 0 ? now : item.lastRestockedAt,
    lastUsedAt: delta < 0 ? now : item.lastUsedAt,
    updatedAt: now,
  };

  await setDoc(ref, updated, { merge: true });

  await recordFirestoreMovement(uid, {
    itemId: item.id,
    itemCode: item.code,
    itemName: item.name,
    type,
    quantityBefore: oldQty,
    quantityChange: delta,
    quantityAfter: newQty,
    unit: item.unit,
    reason: reason || (delta > 0 ? "เติมสต๊อก" : "หยิบไปใช้งาน"),
  });

  return updated;
}

/**
 * Toggle shopping list
 */
export async function toggleFirestoreShopping(
  uid: string,
  itemId: string,
  inList: boolean,
  quantityToBuy?: number
): Promise<HomeItem | undefined> {
  const ref = doc(db, "users", uid, "items", itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return undefined;

  const item = snap.data() as HomeItem;
  const updated: HomeItem = {
    ...item,
    isInShoppingList: inList,
    shoppingQuantity: quantityToBuy ?? item.shoppingQuantity ?? 1,
    isPurchased: false,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(ref, updated, { merge: true });
  return updated;
}

/**
 * Toggle purchased in shopping mode
 */
export async function toggleFirestorePurchased(
  uid: string,
  itemId: string,
  isPurchased: boolean
): Promise<HomeItem | undefined> {
  const ref = doc(db, "users", uid, "items", itemId);
  await updateDoc(ref, { isPurchased, updatedAt: new Date().toISOString() });
  return { ...(await getDoc(ref)).data(), id: itemId } as HomeItem;
}

/**
 * Mark item as out of stock (quantity = 0, added to shopping list)
 */
export async function markFirestoreOutOfStock(
  uid: string,
  itemId: string
): Promise<HomeItem | undefined> {
  const ref = doc(db, "users", uid, "items", itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return undefined;

  const item = snap.data() as HomeItem;
  const oldQty = item.quantity;
  const now = new Date().toISOString();
  const buyQty = item.targetStockLevel || (item.minStockLevel > 0 ? item.minStockLevel + 1 : 1);

  const updated: HomeItem = {
    ...item,
    quantity: 0,
    isInShoppingList: true,
    shoppingQuantity: buyQty,
    isPurchased: false,
    lastUsedAt: now,
    updatedAt: now,
  };

  await setDoc(ref, updated, { merge: true });

  await recordFirestoreMovement(uid, {
    itemId: item.id,
    itemCode: item.code,
    itemName: item.name,
    type: "consume",
    quantityBefore: oldQty,
    quantityChange: -oldQty,
    quantityAfter: 0,
    unit: item.unit,
    reason: "แจ้งของหมดสต๊อก (พร้อมซื้อเพิ่ม)",
  });

  return updated;
}

/**
 * Quick restock single item to target quantity
 */
export async function quickRestockFirestoreItem(
  uid: string,
  itemId: string
): Promise<HomeItem | undefined> {
  const ref = doc(db, "users", uid, "items", itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return undefined;

  const item = snap.data() as HomeItem;
  const oldQty = item.quantity;
  const target = item.targetStockLevel || Math.max(1, item.minStockLevel + 1);
  const now = new Date().toISOString();

  const updated: HomeItem = {
    ...item,
    quantity: target,
    isInShoppingList: false,
    shoppingQuantity: 1,
    isPurchased: false,
    lastRestockedAt: now,
    updatedAt: now,
  };

  await setDoc(ref, updated, { merge: true });

  await recordFirestoreMovement(uid, {
    itemId: item.id,
    itemCode: item.code,
    itemName: item.name,
    type: "restock",
    quantityBefore: oldQty,
    quantityChange: target - oldQty,
    quantityAfter: target,
    unit: item.unit,
    reason: "ซื้อเติมเข้าบ้านเสร็จสมบูรณ์",
  });

  return updated;
}

/**
 * Checkout shopping list: Restock all purchased items
 */
export async function checkoutFirestoreShopping(uid: string): Promise<number> {
  const col = userItemsCol(uid);
  const snap = await getDocs(col);
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let count = 0;

  for (const d of snap.docs) {
    const item = d.data() as HomeItem;
    if (item.isInShoppingList && item.isPurchased) {
      const buyQty = item.shoppingQuantity || 1;
      const oldQty = item.quantity;
      const newQty = oldQty + buyQty;

      batch.update(d.ref, {
        quantity: newQty,
        isInShoppingList: false,
        shoppingQuantity: 1,
        isPurchased: false,
        lastRestockedAt: now,
        updatedAt: now,
      });

      await recordFirestoreMovement(uid, {
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        type: "restock",
        quantityBefore: oldQty,
        quantityChange: buyQty,
        quantityAfter: newQty,
        unit: item.unit,
        reason: "ช้อปปิ้งเสร็จสมบูรณ์ เติมเข้าบ้าน",
      });

      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
  return count;
}

/**
 * Movements
 */
export async function recordFirestoreMovement(
  uid: string,
  movement: Omit<StockMovement, "id" | "createdAt">
): Promise<StockMovement> {
  const col = userMovementsCol(uid);
  const newRef = doc(col);
  const data: StockMovement = {
    ...movement,
    id: newRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newRef, data);
  return data;
}

export async function getFirestoreMovements(uid: string): Promise<StockMovement[]> {
  if (!uid) return [];
  const col = userMovementsCol(uid);
  const snap = await getDocs(col);
  const list = snap.docs.map((d) => ({ ...d.data(), id: d.id } as StockMovement));
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}
