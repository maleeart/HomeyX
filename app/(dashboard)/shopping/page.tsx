"use client";

import { useMemo, useState } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  Copy,
  Download,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  useHomeItems,
  useTogglePurchased,
  useCheckoutShoppingList,
  useToggleShoppingList,
} from "@/hooks/useHomeInventory";
import { getItemStatus, formatCurrency } from "@/lib/utils";
import { exportShoppingListExcel, copyShoppingListText } from "@/lib/export";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { HOME_CATEGORIES } from "@/lib/constants";

export default function ShoppingPage() {
  const { data: items = [], isLoading } = useHomeItems();
  const togglePurchased = useTogglePurchased();
  const checkoutList = useCheckoutShoppingList();
  const toggleShopping = useToggleShoppingList();

  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  // Items in shopping list (sorted: unpurchased first, out-of-stock 0 qty first)
  const shoppingItems = useMemo(() => {
    const list = items.filter(
      (item) => item.quantity <= 0 || item.isInShoppingList || item.quantity <= item.minStockLevel
    );
    return [...list].sort((a, b) => {
      if (Boolean(a.isPurchased) !== Boolean(b.isPurchased)) {
        return a.isPurchased ? 1 : -1;
      }
      if (a.quantity <= 0 && b.quantity > 0) return -1;
      if (b.quantity <= 0 && a.quantity > 0) return 1;
      return 0;
    });
  }, [items]);

  // Filtered by room
  const filteredList = useMemo(() => {
    if (selectedRoom === "all") return shoppingItems;
    return shoppingItems.filter((i) => i.categoryId === selectedRoom);
  }, [shoppingItems, selectedRoom]);

  // Calculation of purchased vs remaining
  const purchasedCount = shoppingItems.filter((i) => i.isPurchased).length;
  const totalCount = shoppingItems.length;
  const progressPercent = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  // Total estimated price
  const totalCost = useMemo(() => {
    return shoppingItems.reduce((sum, item) => {
      const qty = item.shoppingQuantity || 1;
      const price = item.priceEstimate || 0;
      return sum + qty * price;
    }, 0);
  }, [shoppingItems]);

  function handleCopyForLine() {
    if (shoppingItems.length === 0) {
      toast.info("ไม่มีรายการให้คัดลอก");
      return;
    }
    const text = copyShoppingListText(shoppingItems);
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกรายการแล้ว! นำไปวางใน LINE ครอบครัวได้เลย");
  }

  return (
    <AppShell title="รายการต้องซื้อ (Shopping List)">
      {/* Top Banner & Progress */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20">
                โหมดเดินช้อปปิ้ง
              </span>
              <span className="text-xs text-[#78716A] dark:text-[#A8A199]">
                ติ๊กถูกเมื่อหยิบลงรถเข็น
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2D2926] dark:text-[#FAF7F2]">
              ของที่ต้องซื้อเข้าบ้าน ({shoppingItems.length} รายการ)
            </h2>
            <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-1">
              หยิบใส่ตะกร้าแล้ว {purchasedCount} จาก {totalCount} รายการ · งบประมาณคร่าวๆ {formatCurrency(totalCost)}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Copy for LINE */}
            <button
              onClick={handleCopyForLine}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#EADBCE] active:scale-95 transition-all"
            >
              <Copy className="w-4 h-4 text-[#C25E40]" />
              <span>ก๊อปปี้ส่ง LINE</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportShoppingListExcel(shoppingItems)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#EADBCE] active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 text-[#4E7D5B]" />
              <span>Excel</span>
            </button>

            {/* Finish Shopping Button */}
            {purchasedCount > 0 && (
              <button
                onClick={() => checkoutList.mutate()}
                disabled={checkoutList.isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#4E7D5B] hover:bg-[#3D6348] text-white rounded-xl shadow-sm active:scale-95 transition-all animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>เติมเข้าสต๊อกบ้าน ({purchasedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Shopping Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-4 pt-4 border-t border-[#EADBCE] dark:border-[#2D2926]">
            <div className="flex items-center justify-between text-xs text-[#78716A] mb-1.5 font-medium">
              <span>ความคืบหน้าการช้อป</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#FAF7F2] dark:bg-[#2A2622] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4E7D5B] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Room Category Tabs */}
      {shoppingItems.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedRoom("all")}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium shrink-0 transition-all ${
              selectedRoom === "all"
                ? "bg-[#C25E40] text-white font-bold shadow-xs"
                : "bg-white dark:bg-[#1E1B18] text-[#544E48] dark:text-[#B5AFA8] border border-[#EADBCE] dark:border-[#38332E] hover:bg-[#F2ECE1]"
            }`}
          >
            ทั้งหมด ({shoppingItems.length})
          </button>
          {HOME_CATEGORIES.map((cat) => {
            const count = shoppingItems.filter((i) => i.categoryId === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedRoom(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium shrink-0 transition-all ${
                  selectedRoom === cat.id
                    ? "bg-[#C25E40] text-white font-bold shadow-xs"
                    : "bg-white dark:bg-[#1E1B18] text-[#544E48] dark:text-[#B5AFA8] border border-[#EADBCE] dark:border-[#38332E] hover:bg-[#F2ECE1]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Shopping List Items */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={shoppingItems.length === 0 ? "ไม่มีของต้องซื้อในขณะนี้ 🎉" : "ไม่มีรายการในหมวดที่เลือก"}
          description={
            shoppingItems.length === 0
              ? "ของใช้ทุกชิ้นในบ้านยังมีสต๊อกเพียงพอ ไม่ต้องซื้ออะไรเพิ่มในตอนนี้"
              : "ลองเลือกหมวดหมู่อื่นเพื่อดูรายการต้องซื้อ"
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const status = getItemStatus(item);
            const isZero = item.quantity <= 0;
            const buyQty = item.shoppingQuantity || (item.targetStockLevel ? Math.max(1, item.targetStockLevel - item.quantity) : 1);

            return (
              <div
                key={item.id}
                onClick={() => togglePurchased.mutate({ id: item.id, isPurchased: !item.isPurchased })}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  item.isPurchased
                    ? "bg-[#F7F5F0] dark:bg-[#181614] border-[#EADBCE] opacity-60 line-through"
                    : isZero
                    ? "bg-white dark:bg-[#1E1B18] border-rose-300 dark:border-rose-900/60 shadow-xs"
                    : "bg-white dark:bg-[#1E1B18] border-[#EADBCE] dark:border-[#38332E] hover:border-[#C25E40]/50 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Large Checkbox for Mobile Touch */}
                  <div
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      item.isPurchased
                        ? "bg-[#4E7D5B] border-[#4E7D5B] text-white"
                        : "border-[#C25E40] bg-[#FAF7F2] dark:bg-[#2A2622]"
                    }`}
                  >
                    {item.isPurchased && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                        {item.name}
                      </span>
                      {isZero && !item.isPurchased && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
                          หมด
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5 truncate">
                      {item.brand && `${item.brand} · `}
                      {item.categoryName} · เก็บที่: {item.locationName}
                    </p>

                    <div className="flex items-center gap-3 text-xs mt-1 text-[#78716A]">
                      <span>
                        สต๊อกปัจจุบัน: <strong className={isZero ? "text-rose-600" : ""}>{item.quantity}</strong> {item.unit}
                      </span>
                      {item.priceEstimate && (
                        <span>
                          ประมาณ {formatCurrency(item.priceEstimate * buyQty)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Quantity badge & Remove button */}
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="text-right">
                    <span className="text-xs text-[#78716A] block">ต้องซื้อ</span>
                    <span className="text-lg font-black text-[#C25E40]">
                      {buyQty} {item.unit}
                    </span>
                  </div>

                  {/* Remove from shopping list */}
                  <button
                    onClick={() => toggleShopping.mutate({ id: item.id, inList: false })}
                    title="นำออกจากลิสต์ซื้อ"
                    className="p-2 rounded-xl text-[#A8A199] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
