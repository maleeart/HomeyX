"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHomeItems,
  saveHomeItem,
  deleteHomeItem,
  adjustItemStock,
  toggleShoppingList,
  togglePurchasedInShopping,
  checkoutShoppingList,
  getStockMovements,
  markLocalOutOfStock,
  quickRestockLocalItem,
} from "@/lib/storage";
import {
  getFirestoreItems,
  saveFirestoreItem,
  deleteFirestoreItem,
  adjustFirestoreStock,
  toggleFirestoreShopping,
  toggleFirestorePurchased,
  checkoutFirestoreShopping,
  getFirestoreMovements,
  markFirestoreOutOfStock,
  quickRestockFirestoreItem,
} from "@/services/firestore.service";
import { HomeItem, StockMovement } from "@/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const QUERY_KEYS = {
  items: "homeyx_items",
  movements: "homeyx_movements",
};

export function useHomeItems() {
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useQuery<HomeItem[]>({
    queryKey: [QUERY_KEYS.items, uid || "guest"],
    queryFn: async () => {
      if (isCloud && uid) {
        try {
          return await getFirestoreItems(uid);
        } catch (err) {
          console.warn("Firestore fetch error, fallback to local:", err);
          return getHomeItems();
        }
      }
      return getHomeItems();
    },
    enabled: Boolean(user),
    staleTime: 1000 * 20,
  });
}

export function useSaveHomeItem() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async (data: Omit<HomeItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
      if (isCloud && uid) {
        const saved = await saveFirestoreItem(uid, data);
        await saveHomeItem({ ...data, id: saved.id });
        return saved;
      }
      return saveHomeItem(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
      toast.success(`บันทึก "${saved.name}" สำเร็จ`);
    },
    onError: (err) => {
      console.error("Save error:", err);
      toast.error("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    },
  });
}

export function useDeleteHomeItem() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete online from Firestore if connected
      if (isCloud && uid) {
        await deleteFirestoreItem(uid, id);
      }
      // 2. Also delete from local storage cache
      await deleteHomeItem(id);
      return id;
    },
    // Optimistic Update: Instantly remove item from UI with 0 delay!
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.items] });
      const previousItems = queryClient.getQueryData<HomeItem[]>([QUERY_KEYS.items, uid || "guest"]);

      // Update all queries matching QUERY_KEYS.items
      queryClient.setQueriesData<HomeItem[]>({ queryKey: [QUERY_KEYS.items] }, (old) => {
        return old ? old.filter((item) => item.id !== deletedId) : [];
      });

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("ลบรายการของใช้แล้ว");
    },
    onError: (err, deletedId, context) => {
      console.error("Delete error:", err);
      if (context?.previousItems) {
        queryClient.setQueriesData({ queryKey: [QUERY_KEYS.items] }, context.previousItems);
      }
      toast.error("ไม่สามารถลบรายการได้ กรุณาลองใหม่");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async ({ id, delta, reason }: { id: string; delta: number; reason?: string }) => {
      if (isCloud && uid) {
        const updated = await adjustFirestoreStock(uid, id, delta, reason);
        await adjustItemStock(id, delta, reason);
        return updated;
      }
      return adjustItemStock(id, delta, reason);
    },
    onSuccess: (updated, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
      if (updated) {
        if (vars.delta > 0) {
          toast.success(`เติม "${updated.name}" +${vars.delta} ${updated.unit} (คงเหลือ ${updated.quantity})`);
        } else {
          toast.info(`ใช้ "${updated.name}" ${vars.delta} ${updated.unit} (คงเหลือ ${updated.quantity})`);
        }
      }
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการปรับสต๊อก");
    },
  });
}

export function useToggleShoppingList() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async ({ id, inList, quantity }: { id: string; inList: boolean; quantity?: number }) => {
      if (isCloud && uid) {
        const updated = await toggleFirestoreShopping(uid, id, inList, quantity);
        await toggleShoppingList(id, inList, quantity);
        return updated;
      }
      return toggleShoppingList(id, inList, quantity);
    },
    onSuccess: (updated, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      if (updated) {
        if (vars.inList) {
          toast.success(`เพิ่ม "${updated.name}" ลงในรายการต้องซื้อแล้ว`);
        } else {
          toast.info(`นำ "${updated.name}" ออกจากรายการต้องซื้อแล้ว`);
        }
      }
    },
  });
}

export function useTogglePurchased() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async ({ id, isPurchased }: { id: string; isPurchased: boolean }) => {
      if (isCloud && uid) {
        const updated = await toggleFirestorePurchased(uid, id, isPurchased);
        await togglePurchasedInShopping(id, isPurchased);
        return updated;
      }
      return togglePurchasedInShopping(id, isPurchased);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
    },
  });
}

export function useCheckoutShoppingList() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async () => {
      if (isCloud && uid) {
        const count = await checkoutFirestoreShopping(uid);
        await checkoutShoppingList();
        return count;
      }
      return checkoutShoppingList();
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
      toast.success(`เติมของเข้าบ้านแล้ว ${count} รายการ เรียบร้อย! 🎉`);
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการเติมของเข้าสต๊อก");
    },
  });
}

export function useStockMovements() {
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useQuery<StockMovement[]>({
    queryKey: [QUERY_KEYS.movements, uid || "guest"],
    queryFn: () => {
      if (isCloud && uid) {
        return getFirestoreMovements(uid);
      }
      return getStockMovements();
    },
    enabled: Boolean(user),
    staleTime: 1000 * 20,
  });
}

export function useMarkOutOfStock() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async (id: string) => {
      if (isCloud && uid) {
        const updated = await markFirestoreOutOfStock(uid, id);
        await markLocalOutOfStock(id);
        return updated;
      }
      return markLocalOutOfStock(id);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
      if (updated) {
        toast.warning(`แจ้ง "${updated.name}" หมดแล้ว! เพิ่มลงรายการต้องซื้อเรียบร้อย 🚨`);
      }
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการแจ้งของหมด");
    },
  });
}

export function useQuickRestockItem() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: async (id: string) => {
      if (isCloud && uid) {
        const updated = await quickRestockFirestoreItem(uid, id);
        await quickRestockLocalItem(id);
        return updated;
      }
      return quickRestockLocalItem(id);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements] });
      if (updated) {
        toast.success(`ซื้อเติม "${updated.name}" เข้าบ้านแล้ว (${updated.quantity} ${updated.unit}) 🎉`);
      }
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการเติมของเข้าสต๊อก");
    },
  });
}
