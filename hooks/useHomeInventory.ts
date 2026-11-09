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
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: (data: Omit<HomeItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
      if (isCloud && uid) {
        return saveFirestoreItem(uid, data);
      }
      return saveHomeItem(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements, uid || "guest"] });
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
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: (id: string) => {
      if (isCloud && uid) {
        return deleteFirestoreItem(uid, id);
      }
      return deleteHomeItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
      toast.success("ลบรายการของใช้แล้ว");
    },
    onError: () => {
      toast.error("ไม่สามารถลบรายการได้");
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: ({ id, delta, reason }: { id: string; delta: number; reason?: string }) => {
      if (isCloud && uid) {
        return adjustFirestoreStock(uid, id, delta, reason);
      }
      return adjustItemStock(id, delta, reason);
    },
    onSuccess: (updated, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements, uid || "guest"] });
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
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: ({ id, inList, quantity }: { id: string; inList: boolean; quantity?: number }) => {
      if (isCloud && uid) {
        return toggleFirestoreShopping(uid, id, inList, quantity);
      }
      return toggleShoppingList(id, inList, quantity);
    },
    onSuccess: (updated, vars) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
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
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) => {
      if (isCloud && uid) {
        return toggleFirestorePurchased(uid, id, isPurchased);
      }
      return togglePurchasedInShopping(id, isPurchased);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
    },
  });
}

export function useCheckoutShoppingList() {
  const queryClient = useQueryClient();
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useMutation({
    mutationFn: () => {
      if (isCloud && uid) {
        return checkoutFirestoreShopping(uid);
      }
      return checkoutShoppingList();
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.items, uid || "guest"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movements, uid || "guest"] });
      toast.success(`เติมของเข้าบ้านแล้ว ${count} รายการ เรียบร้อย! 🎉`);
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการเติมของเข้าสต๊อก");
    },
  });
}

export function useStockMovements() {
  const { user, isGuest, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && !isGuest && isConfigured);

  return useQuery<StockMovement[]>({
    queryKey: [QUERY_KEYS.movements, uid || "guest"],
    queryFn: () => {
      if (isCloud && uid) {
        return getFirestoreMovements(uid);
      }
      return getStockMovements();
    },
    enabled: Boolean(user),
    staleTime: 1000 * 30,
  });
}

export function useMarkOutOfStock() {
  const queryClient = useQueryClient();
  const { user, isConfigured } = useAuth();
  const uid = user?.uid;
  const isCloud = Boolean(uid && isConfigured);

  return useMutation({
    mutationFn: (id: string) => {
      if (isCloud && uid) {
        return markFirestoreOutOfStock(uid, id);
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
    mutationFn: (id: string) => {
      if (isCloud && uid) {
        return quickRestockFirestoreItem(uid, id);
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
