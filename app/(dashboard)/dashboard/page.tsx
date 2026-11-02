"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import {
  Boxes,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  CheckSquare,
  History,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";
import { useHomeItems, useStockMovements, useAdjustStock } from "@/hooks/useHomeInventory";
import { HOME_CATEGORIES } from "@/lib/constants";
import { getItemStatus, formatRelative, isExpiringSoon, isExpired } from "@/lib/utils";
import { AddItemModal } from "@/components/inventory/AddItemModal";

export default function DashboardPage() {
  const router = useRouter();
  const { data: items = [], isLoading } = useHomeItems();
  const { data: movements = [] } = useStockMovements();
  const adjustStock = useAdjustStock();
  const [showAddModal, setShowAddModal] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;
    let inShoppingList = 0;
    let expiringSoon = 0;

    items.forEach((item) => {
      const status = getItemStatus(item);
      if (status === "out_of_stock") outOfStock++;
      else if (status === "low_stock") lowStock++;
      else inStock++;

      if (item.isInShoppingList || status !== "in_stock") inShoppingList++;
      if (isExpiringSoon(item.expiryDate) || isExpired(item.expiryDate)) expiringSoon++;
    });

    return { outOfStock, lowStock, inStock, inShoppingList, expiringSoon };
  }, [items]);

  // Urgent out of stock items
  const urgentItems = useMemo(
    () => items.filter((i) => i.quantity <= 0).slice(0, 4),
    [items]
  );

  // Category breakdown
  const categoryStats = useMemo(() => {
    return HOME_CATEGORIES.map((cat) => {
      const catItems = items.filter((i) => i.categoryId === cat.id);
      const total = catItems.length;
      const ok = catItems.filter((i) => getItemStatus(i) === "in_stock").length;
      const low = catItems.filter((i) => getItemStatus(i) !== "in_stock").length;
      const percent = total > 0 ? Math.round((ok / total) * 100) : 100;
      return {
        ...cat,
        total,
        ok,
        low,
        percent,
      };
    });
  }, [items]);

  return (
    <AppShell title="ภาพรวมสต๊อกในบ้าน">
      {/* Welcome Banner */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FDF4F0] via-[#FAF7F2] to-[#F2ECE1] dark:from-[#261E1A] dark:via-[#1E1B18] dark:to-[#171513] border border-[#EADBCE] dark:border-[#38332E] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C25E40]/10 text-[#C25E40] border border-[#C25E40]/20">
                Home Sweet Home
              </span>
              <span className="text-xs text-[#78716A] dark:text-[#A8A199]">
                เช็คสต๊อก & ช้อปปิ้ง
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2D2926] dark:text-[#FAF7F2]">
              ยินดีต้อนรับสู่ Homey<span className="text-[#C25E40]">X</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#78716A] dark:text-[#A8A199] mt-1">
              {stats.outOfStock > 0
                ? `มีของใช้หมดสต๊อก ${stats.outOfStock} รายการ และใกล้หมด ${stats.lowStock} รายการที่ต้องเตรียมซื้อ`
                : "ของใช้ในบ้านส่วนใหญ่อยู่ในระดับพร้อมใช้งาน สบายใจได้!"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => router.push("/shopping")}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#C25E40] hover:bg-[#D96E4C] text-white rounded-2xl shadow-sm shadow-[#C25E40]/30 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>รายการต้องซื้อ ({stats.inShoppingList})</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-2xl hover:bg-[#F2ECE1] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-[#C25E40]" />
              <span className="hidden sm:inline">เพิ่มของ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="หมดสต๊อก (ต้องซื้อด่วน)"
          value={stats.outOfStock}
          subtext="รายการ"
          icon={AlertTriangle}
          accentColor="terracotta"
          onClick={() => router.push("/shopping")}
        />
        <StatCard
          label="ใกล้หมดสต๊อก"
          value={stats.lowStock}
          subtext="รายการ"
          icon={ShoppingCart}
          accentColor="amber"
          onClick={() => router.push("/shopping")}
        />
        <StatCard
          label="พร้อมใช้งานปกติ"
          value={stats.inStock}
          subtext="รายการ"
          icon={CheckCircle2}
          accentColor="sage"
          onClick={() => router.push("/inventory")}
        />
        <StatCard
          label="ของใช้ทั้งหมดในบ้าน"
          value={items.length}
          subtext="รายการ"
          icon={Boxes}
          accentColor="charcoal"
          onClick={() => router.push("/inventory")}
        />
      </div>

      {/* Urgent Warning Section if items are 0 stock */}
      {urgentItems.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FFF5F2] dark:bg-[#291713] border border-[#FCD9D0] dark:border-[#52251D]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C25E40] animate-pulse" />
              <h3 className="text-sm font-bold text-[#8A2C14] dark:text-[#F7A691]">
                ของหมดสต๊อกแล้ว ({urgentItems.length} รายการ)
              </h3>
            </div>
            <Link
              href="/shopping"
              className="text-xs font-semibold text-[#C25E40] hover:underline flex items-center gap-1"
            >
              ดูในรายการต้องซื้อ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#FCD9D0] dark:border-[#3D2520] flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#78716A] dark:text-[#A8A199] truncate">
                    {item.locationName} · {item.categoryName}
                  </p>
                </div>
                <button
                  onClick={() => adjustStock.mutate({ id: item.id, delta: 1, reason: "ซื้อมาเติม" })}
                  className="px-2.5 py-1 text-[11px] font-bold bg-[#C25E40] text-white rounded-lg hover:bg-[#D96E4C] active:scale-95 transition-all shrink-0"
                >
                  + เติม 1
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Category Stock Status & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Health & Progress (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                  ความพร้อมของสต๊อกแยกตามห้อง / โซน
                </h3>
                <p className="text-xs text-[#78716A] dark:text-[#A8A199]">
                  ตรวจสอบสต๊อกของใช้ในแต่ละมุมของบ้าน
                </p>
              </div>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-[#C25E40] hover:underline flex items-center gap-1"
              >
                ดูทั้งหมด <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categoryStats.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => router.push(`/inventory?category=${cat.id}`)}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#171513] border border-[#EADBCE] dark:border-[#2D2926] hover:border-[#C25E40]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] group-hover:text-[#C25E40] transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#78716A] dark:text-[#A8A199]">
                      {cat.ok}/{cat.total} ชิ้น
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[#EADBCE] dark:bg-[#2A2622] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.percent >= 80
                          ? "bg-[#4E7D5B]"
                          : cat.percent >= 50
                          ? "bg-[#D97706]"
                          : "bg-[#C25E40]"
                      }`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#78716A] dark:text-[#A8A199]">
                    <span>{cat.nameEn}</span>
                    {cat.low > 0 ? (
                      <span className="text-[#C25E40] font-semibold">
                        ต้องซื้อ {cat.low} ชิ้น
                      </span>
                    ) : (
                      <span className="text-[#4E7D5B] font-semibold">สต๊อกครบถ้วน</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Stock Activity (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#C25E40]" />
                <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                  ประวัติการใช้ / เติมล่าสุด
                </h3>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-[#C25E40] hover:underline"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {movements.length === 0 ? (
              <p className="text-xs text-center py-8 text-[#78716A]">ยังไม่มีประวัติการเคลื่อนไหว</p>
            ) : (
              <div className="space-y-3">
                {movements.slice(0, 6).map((mov) => {
                  const isRestock = mov.type === "restock" || mov.quantityChange > 0;
                  return (
                    <div
                      key={mov.id}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#FAF7F2] dark:hover:bg-[#171513] transition-colors"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isRestock
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                        }`}
                      >
                        {isRestock ? "+" : "-"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                          {mov.itemName}
                        </p>
                        <p className="text-[11px] text-[#78716A] dark:text-[#A8A199] truncate">
                          {mov.reason || (isRestock ? "เติมของเข้าบ้าน" : "หยิบไปใช้")}
                        </p>
                        <p className="text-[10px] text-[#A8A199] mt-0.5">
                          {formatRelative(mov.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold shrink-0 ${
                          isRestock ? "text-emerald-600" : "text-[#C25E40]"
                        }`}
                      >
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange} {mov.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddItemModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </AppShell>
  );
}
