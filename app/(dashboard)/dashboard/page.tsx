"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Share2,
  Copy,
  Plus,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  RotateCcw,
  Boxes,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Cloud,
} from "lucide-react";
import {
  useHomeItems,
  useTogglePurchased,
  useCheckoutShoppingList,
  useToggleShoppingList,
  useQuickRestockItem,
  useMarkOutOfStock,
} from "@/hooks/useHomeInventory";
import { useAuth } from "@/hooks/useAuth";
import { HOME_CATEGORIES } from "@/lib/constants";
import { getItemStatus, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { QuickOutOfStockModal } from "@/components/inventory/QuickOutOfStockModal";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const { data: items = [], isLoading } = useHomeItems();
  const togglePurchased = useTogglePurchased();
  const checkoutList = useCheckoutShoppingList();
  const toggleShopping = useToggleShoppingList();
  const quickRestock = useQuickRestockItem();
  const markOutOfStock = useMarkOutOfStock();

  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showInStockItems, setShowInStockItems] = useState(false);
  const [inStockSearch, setInStockSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // 1. Items completely OUT OF STOCK (quantity === 0 or marked in list with 0)
  const outOfStockItems = useMemo(() => {
    return items.filter((item) => item.quantity <= 0);
  }, [items]);

  // 2. Items RUNNING LOW (quantity > 0 and quantity <= minStockLevel) or manually added to shopping list
  const lowStockItems = useMemo(() => {
    return items.filter(
      (item) => item.quantity > 0 && (item.quantity <= item.minStockLevel || item.isInShoppingList)
    );
  }, [items]);

  // 3. All items that need to be bought (Out of stock + Low stock + Explicitly in shopping list)
  const allNeededItems = useMemo(() => {
    return items.filter(
      (item) => item.quantity <= 0 || item.quantity <= item.minStockLevel || item.isInShoppingList
    );
  }, [items]);

  // 4. Items marked as purchased in current shopping session
  const purchasedItems = useMemo(() => {
    return allNeededItems.filter((item) => item.isPurchased);
  }, [allNeededItems]);

  // 5. Items that are well-stocked (for quick lookup in store)
  const wellStockedItems = useMemo(() => {
    return items.filter(
      (item) => item.quantity > item.minStockLevel && !item.isInShoppingList
    );
  }, [items]);

  // Filtered well-stocked items
  const filteredWellStocked = useMemo(() => {
    let list = wellStockedItems;
    if (selectedCategoryFilter !== "all") {
      list = list.filter((i) => i.categoryId === selectedCategoryFilter);
    }
    if (inStockSearch.trim()) {
      const q = inStockSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q)) ||
          (i.locationName && i.locationName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [wellStockedItems, selectedCategoryFilter, inStockSearch]);

  // Estimated total shopping cost
  const estimatedCost = useMemo(() => {
    return allNeededItems.reduce((sum, item) => {
      const qty = item.shoppingQuantity || (item.targetStockLevel ? Math.max(1, item.targetStockLevel - item.quantity) : 1);
      const price = item.priceEstimate || 0;
      return sum + qty * price;
    }, 0);
  }, [allNeededItems]);

  // Copy list formatted for LINE
  function handleCopyForLine() {
    if (allNeededItems.length === 0) {
      toast.info("ไม่มีรายการของต้องซื้อในขณะนี้");
      return;
    }

    let text = `🛒 รายการของต้องซื้อเข้าบ้าน (HomeyX)\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n`;

    if (outOfStockItems.length > 0) {
      text += `🚨 หมดแล้ว (ต้องซื้อด่วน):\n`;
      outOfStockItems.forEach((item) => {
        const qty = item.shoppingQuantity || item.targetStockLevel || 1;
        text += `• ${item.name} (${qty} ${item.unit})\n`;
      });
      text += `\n`;
    }

    if (lowStockItems.length > 0) {
      text += `⚠️ ใกล้หมดแล้ว:\n`;
      lowStockItems.forEach((item) => {
        const qty = item.shoppingQuantity || (item.targetStockLevel ? Math.max(1, item.targetStockLevel - item.quantity) : 1);
        text += `• ${item.name} (เหลือ ${item.quantity} ${item.unit} / ซื้อเพิ่ม ${qty} ${item.unit})\n`;
      });
      text += `\n`;
    }

    if (estimatedCost > 0) {
      text += `💰 งบประมาณคร่าวๆ: ~${formatCurrency(estimatedCost)}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `เช็คจากแอป HomeyX`;

    navigator.clipboard.writeText(text);
    toast.success("คัดลอกรายการแล้ว! วางส่งใน LINE ได้เลย 📲");
  }

  return (
    <AppShell title="เรดาร์ของหมด & เตรียมซื้อของ">
      {/* Cloud Database Connected Status Header */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            ฐานข้อมูลออนไลน์บนเว็บ (Firebase Cloud Firestore)
          </span>
        </div>
        <span className="text-[11px] text-[#78716A] dark:text-[#A8A199] hidden sm:inline">
          {user?.householdName || "บ้านสุขสันต์"}
        </span>
      </div>

      {/* Main Alert Banner */}
      <div className="mb-6 p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-sm relative overflow-hidden">
        {/* Soft decorative gradient */}
        <div
          className={`absolute -right-20 -top-20 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 ${
            outOfStockItems.length > 0 ? "bg-rose-400" : "bg-emerald-400"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {outOfStockItems.length > 0 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>มีของหมดสต๊อก</span>
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ของในบ้านยังพร้อมใช้</span>
                </span>
              )}
              <span className="text-xs text-[#78716A] dark:text-[#A8A199]">
                เช็คก่อนออกไปซื้อของ
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#2D2926] dark:text-[#FAF7F2]">
              {allNeededItems.length > 0
                ? `ของที่ต้องซื้อเพิ่ม (${allNeededItems.length} รายการ)`
                : "ของใช้ในบ้านยังไม่มีอะไรหมด 🎉"}
            </h1>

            <p className="text-xs sm:text-sm text-[#78716A] dark:text-[#A8A199] mt-1.5 max-w-xl">
              {outOfStockItems.length > 0 ? (
                <>
                  หมดสต๊อก <strong className="text-rose-600 dark:text-rose-400 font-bold">{outOfStockItems.length} รายการ</strong>
                  {lowStockItems.length > 0 && ` และใกล้หมดอีก ${lowStockItems.length} รายการ`}
                  {estimatedCost > 0 && ` · ประมาณการ ${formatCurrency(estimatedCost)}`}
                </>
              ) : (
                "ยังไม่มีของที่ต้องซื้อด่วน หากชิ้นไหนเพิ่งหมด สามารถกดปุ่ม 'แจ้งของหมด' ได้ทันที"
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Quick Mark Out-of-Stock Button */}
            <button
              onClick={() => setShowQuickModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-sm shadow-rose-600/25 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>แจ้งของหมด</span>
            </button>

            {/* Copy for LINE */}
            {allNeededItems.length > 0 && (
              <button
                onClick={handleCopyForLine}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-2xl hover:bg-[#EADBCE] active:scale-95 transition-all"
                title="คัดลอกรายการเพื่อส่งให้แฟนหรือครอบครัวใน LINE"
              >
                <Share2 className="w-4 h-4 text-[#C25E40]" />
                <span className="hidden sm:inline">ส่งลิสต์เข้า LINE</span>
                <span className="sm:hidden">LINE</span>
              </button>
            )}

            {/* Shopping Mode Shortcut */}
            <button
              onClick={() => router.push("/shopping")}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-2xl hover:bg-[#EADBCE] active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-[#4E7D5B]" />
              <span>โหมดช้อปปิ้ง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Restock Checkout Bar when items are checked */}
      {purchasedItems.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-[#4E7D5B] text-white shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold">หยิบใส่รถเข็นแล้ว {purchasedItems.length} ชิ้น</p>
              <p className="text-[10px] text-white/80 truncate">
                กดปุ่มเพื่ออัปเดตสต๊อกเข้าบ้าน และนำออกจากลิสต์ต้องซื้อ
              </p>
            </div>
          </div>
          <button
            onClick={() => checkoutList.mutate()}
            disabled={checkoutList.isPending}
            className="px-4 py-2 text-xs font-black bg-white text-[#4E7D5B] rounded-xl shadow-xs hover:bg-[#FAF7F2] active:scale-95 transition-all shrink-0"
          >
            {checkoutList.isPending ? "กำลังบันทึก..." : "เติมของเข้าบ้านทันที 🎉"}
          </button>
        </div>
      )}

      {/* SECTION 1: 🚨 ของที่หมดแล้ว (0 ชิ้น) - ต้องซื้อทันที */}
      {outOfStockItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                หมดแล้ว! ต้องซื้อทันที ({outOfStockItems.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#78716A]">แตะที่การ์ดเพื่อติ๊กซื้อแล้ว</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outOfStockItems.map((item) => {
              const buyQty = item.shoppingQuantity || item.targetStockLevel || 1;
              const isChecked = Boolean(item.isPurchased);

              return (
                <div
                  key={item.id}
                  onClick={() => togglePurchased.mutate({ id: item.id, isPurchased: !isChecked })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-[#F7F5F0] dark:bg-[#181614] border-[#EADBCE] opacity-60 line-through"
                      : "bg-white dark:bg-[#1E1B18] border-rose-300 dark:border-rose-900/60 shadow-xs hover:border-rose-500"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Big Checkbox for Mobile */}
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-[#4E7D5B] border-[#4E7D5B] text-white"
                          : "border-rose-400 bg-rose-50/50 dark:bg-rose-950/30"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-600 text-white shrink-0">
                          0 {item.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716A] dark:text-[#A8A199] mt-0.5 truncate">
                        {item.brand && `${item.brand} · `}
                        {item.categoryName} · {item.locationName}
                      </p>
                    </div>
                  </div>

                  {/* Quantity to buy */}
                  <div className="text-right shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-[#78716A] block">ต้องซื้อ</span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">
                      {buyQty} {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ⚠️ ของที่ใกล้หมด (ควรซื้อตุน) */}
      {lowStockItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                ใกล้หมดแล้ว ควรซื้อตุน ({lowStockItems.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lowStockItems.map((item) => {
              const buyQty = item.shoppingQuantity || (item.targetStockLevel ? Math.max(1, item.targetStockLevel - item.quantity) : 1);
              const isChecked = Boolean(item.isPurchased);

              return (
                <div
                  key={item.id}
                  onClick={() => togglePurchased.mutate({ id: item.id, isPurchased: !isChecked })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-[#F7F5F0] dark:bg-[#181614] border-[#EADBCE] opacity-60 line-through"
                      : "bg-white dark:bg-[#1E1B18] border-amber-200 dark:border-amber-900/40 shadow-xs hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-[#4E7D5B] border-[#4E7D5B] text-white"
                          : "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                          เหลือ {item.quantity} {item.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716A] dark:text-[#A8A199] mt-0.5 truncate">
                        {item.brand && `${item.brand} · `}
                        {item.categoryName} · {item.locationName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-[#78716A] block">ต้องซื้อ</span>
                    <span className="text-base font-black text-amber-700 dark:text-amber-400">
                      {buyQty} {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: 📦 เช็คสต๊อกของอื่นในบ้าน (Accordion / Expandable) */}
      <div className="mt-8 pt-6 border-t border-[#EADBCE] dark:border-[#38332E]">
        <button
          onClick={() => setShowInStockItems((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] hover:border-[#C25E40]/40 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] dark:bg-[#2A2622] flex items-center justify-center text-[#78716A]">
              <Boxes className="w-5 h-5 text-[#C25E40]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                เช็คของชิ้นอื่นในบ้าน (มี {wellStockedItems.length} รายการที่ยังมีสต๊อก)
              </h3>
              <p className="text-[11px] text-[#78716A]">
                สงสัยว่าของชิ้นไหนที่บ้านยังมีอยู่ไหม? แตะเพื่อค้นหาได้เลย
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C25E40]">
            <span>{showInStockItems ? "ซ่อน" : "เปิดดู"}</span>
            {showInStockItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Content */}
        {showInStockItems && (
          <div className="mt-4 p-4 rounded-3xl bg-[#FAF7F2] dark:bg-[#171513] border border-[#EADBCE] dark:border-[#332E2A] space-y-3">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#78716A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inStockSearch}
                  onChange={(e) => setInStockSearch(e.target.value)}
                  placeholder="ค้นหาชื่อของใช้ในบ้าน..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#23201D] border border-[#EADBCE] dark:border-[#38332E] rounded-xl text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C25E40]"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#23201D] border border-[#EADBCE] dark:border-[#38332E] rounded-xl text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {HOME_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In-Stock Items List */}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredWellStocked.length > 0 ? (
                filteredWellStocked.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 shrink-0">
                          มี {item.quantity} {item.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#78716A] dark:text-[#A8A199] mt-0.5 truncate">
                        {item.categoryName} · เก็บที่: {item.locationName}
                      </p>
                    </div>

                    {/* Quick Button to mark as out of stock right here */}
                    <button
                      onClick={() => markOutOfStock.mutate(item.id)}
                      className="px-2.5 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-900/40 transition-colors shrink-0"
                      title="กดถ้าของชิ้นนี้เพิ่งหมด"
                    >
                      แจ้งว่าหมด
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#78716A]">
                  ไม่พบรายการของใช้ที่ค้นหา
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Out-of-Stock Modal */}
      <QuickOutOfStockModal
        open={showQuickModal}
        onClose={() => setShowQuickModal(false)}
      />
    </AppShell>
  );
}
