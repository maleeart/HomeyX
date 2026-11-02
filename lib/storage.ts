// ============================================================
// HOMEYX - Smart Offline-First Storage Service
// Works seamlessly in browser LocalStorage and ready for Firestore sync
// ============================================================

import { HomeItem, StockMovement, MovementType, RoomCategory } from "@/types";
import { getItemStatus } from "./utils";

const ITEMS_STORAGE_KEY = "homeyx_items_v1";
const MOVEMENTS_STORAGE_KEY = "homeyx_movements_v1";

// ── Realistic Initial Seed Data ───────────────────────────────
export const INITIAL_ITEMS: HomeItem[] = [
  // 1. Kitchen & Pantry
  {
    id: "item-k1",
    code: "KIT-0001",
    barcode: "8850002011234",
    name: "น้ำยาล้างจาน ซันไลต์ เลมอน เทอร์โบ",
    brand: "Sunlight",
    size: "750 ml",
    categoryId: "kitchen",
    categoryName: "ห้องครัว & ของกิน",
    locationId: "ใต้ซิงค์ครัว",
    locationName: "ใต้ซิงค์ครัว",
    unit: "ถุง",
    quantity: 1,
    minStockLevel: 2,
    targetStockLevel: 3,
    priceEstimate: 45,
    images: ["https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=400&q=80"],
    notes: "ซื้อแบบถุงเติมประหยัดกว่า",
    isInShoppingList: true,
    shoppingQuantity: 2,
    isPurchased: false,
    lastRestockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-k2",
    code: "KIT-0002",
    barcode: "8850123456789",
    name: "น้ำมันพืช มรกต ปาล์ม",
    brand: "มรกต",
    size: "1 ลิตร",
    categoryId: "kitchen",
    categoryName: "ห้องครัว & ของกิน",
    locationId: "ตู้กับข้าว",
    locationName: "ตู้กับข้าว",
    unit: "ขวด",
    quantity: 3,
    minStockLevel: 1,
    targetStockLevel: 3,
    priceEstimate: 52,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-k3",
    code: "KIT-0003",
    name: "ข้าวหอมมะลิ ตราฉัตรทอง",
    brand: "ตราฉัตร",
    size: "5 กก.",
    categoryId: "kitchen",
    categoryName: "ห้องครัว & ของกิน",
    locationId: "ตู้กับข้าว",
    locationName: "ตู้กับข้าว",
    unit: "ถุง",
    quantity: 0,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 215,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"],
    notes: "หมดเกลี้ยง ต้องรีบซื้อ",
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 2. Bathroom & Personal Care
  {
    id: "item-b1",
    code: "BAT-0001",
    barcode: "8851959132014",
    name: "ยาสีฟัน คอลเกต โททอล คลีนมินต์",
    brand: "Colgate",
    size: "150 กรัม (แพ็คคู่)",
    categoryId: "bathroom",
    categoryName: "ห้องน้ำ & ดูแลร่างกาย",
    locationId: "ชั้นวางห้องน้ำ",
    locationName: "ชั้นวางห้องน้ำ",
    unit: "กล่อง",
    quantity: 1,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 129,
    images: ["https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-b2",
    code: "BAT-0002",
    name: "สบู่ก้อน โพรเทคส์ ไอซ์ซี่ คูล",
    brand: "Protex",
    size: "65 กรัม (แพ็ค 4)",
    categoryId: "bathroom",
    categoryName: "ห้องน้ำ & ดูแลร่างกาย",
    locationId: "ใต้อ่างล้างหน้า",
    locationName: "ใต้อ่างล้างหน้า",
    unit: "แพ็ค",
    quantity: 2,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 59,
    images: ["https://images.unsplash.com/photo-1607006314180-305f884a415a?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-b3",
    code: "BAT-0003",
    name: "แชมพู แพนทีน แฮร์ฟอล คอนโทรล",
    brand: "Pantene",
    size: "410 ml",
    categoryId: "bathroom",
    categoryName: "ห้องน้ำ & ดูแลร่างกาย",
    locationId: "ชั้นวางห้องน้ำ",
    locationName: "ชั้นวางห้องน้ำ",
    unit: "ขวด",
    quantity: 1,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 149,
    images: ["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 3. Cleaning & Laundry
  {
    id: "item-c1",
    code: "CLN-0001",
    name: "ผงซักฟอก บรีสเอกเซล คอมฟอร์ท",
    brand: "Breeze",
    size: "2,400 กรัม",
    categoryId: "cleaning",
    categoryName: "ซักล้าง & ทำความสะอาด",
    locationId: "มุมเครื่องซักผ้า",
    locationName: "มุมเครื่องซักผ้า",
    unit: "ถุง",
    quantity: 0,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 189,
    images: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-c2",
    code: "CLN-0002",
    name: "น้ำยาปรับผ้านุ่ม ไฮยีน มอร์นิ่งบลูม",
    brand: "Hygiene",
    size: "1,150 ml (ถุงเติม)",
    categoryId: "cleaning",
    categoryName: "ซักล้าง & ทำความสะอาด",
    locationId: "มุมเครื่องซักผ้า",
    locationName: "มุมเครื่องซักผ้า",
    unit: "ถุง",
    quantity: 3,
    minStockLevel: 1,
    targetStockLevel: 3,
    priceEstimate: 65,
    images: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-c3",
    code: "CLN-0003",
    name: "ถุงขยะดำ แชมเปี้ยน แบบหนา 24x28 นิ้ว",
    brand: "Champion",
    size: "24x28 นิ้ว (แพ็ค 30 ใบ)",
    categoryId: "cleaning",
    categoryName: "ซักล้าง & ทำความสะอาด",
    locationId: "ตู้เก็บอุปกรณ์ทำความสะอาด",
    locationName: "ตู้เก็บอุปกรณ์ทำความสะอาด",
    unit: "แพ็ค",
    quantity: 1,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 42,
    images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 4. Living & Bedroom
  {
    id: "item-l1",
    code: "LIV-0001",
    name: "กระดาษทิชชู่ม้วน สก๊อตต์ เอ็กซ์ตร้า",
    brand: "Scott",
    size: "แพ็ค 24 ม้วน",
    categoryId: "living",
    categoryName: "ห้องนอน & นั่งเล่น",
    locationId: "ตู้เก็บของใต้บันได",
    locationName: "ตู้เก็บของใต้บันได",
    unit: "แพ็ค",
    quantity: 1,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 195,
    images: ["https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-l2",
    code: "LIV-0002",
    name: "ถ่านไฟฉาย Panasonic Eneloop AA",
    brand: "Panasonic",
    size: "แพ็ค 4 ก้อน",
    categoryId: "living",
    categoryName: "ห้องนอน & นั่งเล่น",
    locationId: "ตู้เก็บของใต้บันได",
    locationName: "ตู้เก็บของใต้บันได",
    unit: "แพ็ค",
    quantity: 2,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 450,
    images: ["https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 5. Medicine & First Aid
  {
    id: "item-m1",
    code: "MED-0001",
    name: "ยาพาราเซตามอล ซาร่า 500 มก.",
    brand: "Sara",
    size: "แผง 10 เม็ด (กล่อง 10 แผง)",
    categoryId: "medicine",
    categoryName: "ยา & ปฐมพยาบาล",
    locationId: "ตู้ยาประจำบ้าน",
    locationName: "ตู้ยาประจำบ้าน",
    unit: "แผง",
    quantity: 4,
    minStockLevel: 2,
    targetStockLevel: 5,
    priceEstimate: 15,
    expiryDate: "2027-08-31",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-m2",
    code: "MED-0002",
    name: "แอลกอฮอล์ล้างแผล 70% ศิริบัญชา",
    brand: "ศิริบัญชา",
    size: "450 ml",
    categoryId: "medicine",
    categoryName: "ยา & ปฐมพยาบาล",
    locationId: "ตู้ยาประจำบ้าน",
    locationName: "ตู้ยาประจำบ้าน",
    unit: "ขวด",
    quantity: 1,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 55,
    expiryDate: "2028-01-15",
    images: ["https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: true,
    shoppingQuantity: 1,
    isPurchased: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 6. General
  {
    id: "item-g1",
    code: "GEN-0001",
    name: "ถุงซิปล็อคใส ขนาด 20x30 ซม.",
    brand: "Sunzip",
    size: "กล่อง 20 ใบ",
    categoryId: "general",
    categoryName: "ของใช้ทั่วไป",
    locationId: "ห้องเก็บของ",
    locationName: "ห้องเก็บของ",
    unit: "กล่อง",
    quantity: 2,
    minStockLevel: 1,
    targetStockLevel: 2,
    priceEstimate: 49,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"],
    isInShoppingList: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial stock movements log
const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    itemId: "item-k3",
    itemCode: "KIT-0003",
    itemName: "ข้าวหอมมะลิ ตราฉัตรทอง",
    type: "consume",
    quantityBefore: 1,
    quantityChange: -1,
    quantityAfter: 0,
    unit: "ถุง",
    reason: "หุงหมดถุงแล้ว",
    performedBy: "เจ้าของบ้าน",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "mov-2",
    itemId: "item-k1",
    itemCode: "KIT-0001",
    itemName: "น้ำยาล้างจาน ซันไลต์ เลมอน เทอร์โบ",
    type: "consume",
    quantityBefore: 2,
    quantityChange: -1,
    quantityAfter: 1,
    unit: "ถุง",
    reason: "เทใส่ขวดปั๊มที่ซิงค์",
    performedBy: "เจ้าของบ้าน",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "mov-3",
    itemId: "item-c2",
    itemCode: "CLN-0002",
    itemName: "น้ำยาปรับผ้านุ่ม ไฮยีน มอร์นิ่งบลูม",
    type: "restock",
    quantityBefore: 1,
    quantityChange: 2,
    quantityAfter: 3,
    unit: "ถุง",
    reason: "ซื้อตุนโปรโมชั่น 1 แถม 1",
    performedBy: "เจ้าของบ้าน",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// ── Storage Operations ────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadItems(): HomeItem[] {
  if (!isBrowser()) return INITIAL_ITEMS;
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load items from storage", e);
    return INITIAL_ITEMS;
  }
}

export function saveAllItems(items: HomeItem[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items to storage", e);
  }
}

export function loadMovements(): StockMovement[] {
  if (!isBrowser()) return INITIAL_MOVEMENTS;
  try {
    const raw = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load movements from storage", e);
    return INITIAL_MOVEMENTS;
  }
}

export function saveAllMovements(movements: StockMovement[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
  } catch (e) {
    console.error("Failed to save movements to storage", e);
  }
}

// ── High-Level Business Methods ───────────────────────────────

export async function getHomeItems(): Promise<HomeItem[]> {
  return loadItems();
}

export async function getHomeItemById(id: string): Promise<HomeItem | undefined> {
  const items = loadItems();
  return items.find((i) => i.id === id);
}

export async function findItemByBarcodeOrCode(codeOrBarcode: string): Promise<HomeItem | undefined> {
  const items = loadItems();
  const query = codeOrBarcode.trim().toLowerCase();
  return items.find(
    (i) => i.barcode?.toLowerCase() === query || i.code.toLowerCase() === query
  );
}

export async function saveHomeItem(itemData: Omit<HomeItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<HomeItem> {
  const items = loadItems();
  const now = new Date().toISOString();

  if (itemData.id) {
    // Update
    const idx = items.findIndex((i) => i.id === itemData.id);
    if (idx >= 0) {
      const prev = items[idx];
      const updated: HomeItem = {
        ...prev,
        ...itemData,
        id: itemData.id,
        updatedAt: now,
      };
      items[idx] = updated;
      saveAllItems(items);
      return updated;
    }
  }

  // Create
  const newItem: HomeItem = {
    ...itemData,
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(newItem);
  saveAllItems(items);

  // Record initial movement
  await recordMovement({
    itemId: newItem.id,
    itemCode: newItem.code,
    itemName: newItem.name,
    type: "initial",
    quantityBefore: 0,
    quantityChange: newItem.quantity,
    quantityAfter: newItem.quantity,
    unit: newItem.unit,
    reason: "เพิ่มรายการของใช้ใหม่เข้าระบบ",
  });

  return newItem;
}

export async function deleteHomeItem(id: string): Promise<boolean> {
  const items = loadItems();
  const filtered = items.filter((i) => i.id !== id);
  saveAllItems(filtered);
  return true;
}

/**
 * Quick +/- Adjust quantity with automated movement logging
 */
export async function adjustItemStock(
  id: string,
  delta: number,
  reason?: string
): Promise<HomeItem | undefined> {
  const items = loadItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;

  const item = items[idx];
  const oldQty = item.quantity;
  const newQty = Math.max(0, oldQty + delta);
  if (oldQty === newQty) return item;

  const type: MovementType = delta > 0 ? "restock" : "consume";
  const now = new Date().toISOString();

  // If stock dropped below minStockLevel, automatically flag for shopping list
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

  items[idx] = updated;
  saveAllItems(items);

  // Log movement
  await recordMovement({
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
 * Toggle or update shopping list status
 */
export async function toggleShoppingList(
  id: string,
  inList: boolean,
  quantityToBuy?: number
): Promise<HomeItem | undefined> {
  const items = loadItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;

  const item = items[idx];
  const updated: HomeItem = {
    ...item,
    isInShoppingList: inList,
    shoppingQuantity: quantityToBuy ?? item.shoppingQuantity ?? 1,
    isPurchased: false,
    updatedAt: new Date().toISOString(),
  };

  items[idx] = updated;
  saveAllItems(items);
  return updated;
}

/**
 * Mark item as purchased in shopping mode
 */
export async function togglePurchasedInShopping(id: string, isPurchased: boolean): Promise<HomeItem | undefined> {
  const items = loadItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return undefined;

  const item = items[idx];
  const updated: HomeItem = {
    ...item,
    isPurchased,
    updatedAt: new Date().toISOString(),
  };

  items[idx] = updated;
  saveAllItems(items);
  return updated;
}

/**
 * Batch restock all purchased items from shopping list and remove them from shopping list
 */
export async function checkoutShoppingList(): Promise<number> {
  const items = loadItems();
  let count = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.isInShoppingList && item.isPurchased) {
      const buyQty = item.shoppingQuantity ?? 1;
      const oldQty = item.quantity;
      const newQty = oldQty + buyQty;

      items[i] = {
        ...item,
        quantity: newQty,
        isInShoppingList: false,
        shoppingQuantity: 1,
        isPurchased: false,
        lastRestockedAt: now,
        updatedAt: now,
      };

      await recordMovement({
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

  saveAllItems(items);
  return count;
}

export async function recordMovement(movement: Omit<StockMovement, "id" | "createdAt">): Promise<StockMovement> {
  const movements = loadMovements();
  const newMovement: StockMovement = {
    ...movement,
    id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  movements.unshift(newMovement);
  saveAllMovements(movements.slice(0, 300)); // Keep latest 300
  return newMovement;
}

export async function getStockMovements(): Promise<StockMovement[]> {
  return loadMovements();
}
