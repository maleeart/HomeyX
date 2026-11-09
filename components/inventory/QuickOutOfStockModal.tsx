"use client";

import { useState, useMemo } from "react";
import {
  X,
  AlertTriangle,
  Search,
  Plus,
  Check,
  Flame,
  Sparkles,
} from "lucide-react";
import { useHomeItems, useMarkOutOfStock, useSaveHomeItem } from "@/hooks/useHomeInventory";
import { HOME_CATEGORIES } from "@/lib/constants";
import { RoomCategory } from "@/types";
import { toast } from "sonner";

interface QuickOutOfStockModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickOutOfStockModal({ open, onClose }: QuickOutOfStockModalProps) {
  const { data: items = [] } = useHomeItems();
  const markOutOfStock = useMarkOutOfStock();
  const saveItem = useSaveHomeItem();

  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>("kitchen");

  // In-stock items that can be marked as out of stock
  const inStockItems = useMemo(() => {
    return items.filter((i) => i.quantity > 0 && !i.isInShoppingList);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return inStockItems.slice(0, 12);
    const q = query.toLowerCase();
    return inStockItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.categoryName && i.categoryName.toLowerCase().includes(q))
    );
  }, [inStockItems, query]);

  if (!open) return null;

  async function handleCreateNewAndMark() {
    if (!customName.trim()) return;
    try {
      const cat = HOME_CATEGORIES.find((c) => c.id === selectedCategory);
      await saveItem.mutateAsync({
        code: `${cat?.prefix || "GEN"}-${Date.now().toString().slice(-4)}`,
        name: customName.trim(),
        categoryId: selectedCategory,
        categoryName: cat?.name || "ของใช้ทั่วไป",
        locationId: "ห้องครัว",
        locationName: "ห้องครัว",
        unit: "ชิ้น",
        quantity: 0,
        minStockLevel: 1,
        targetStockLevel: 1,
        isInShoppingList: true,
        shoppingQuantity: 1,
        isPurchased: false,
      });
      toast.warning(`เพิ่ม "${customName}" และตั้งเป็นของหมดแล้ว! 🚨`);
      setCustomName("");
      onClose();
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EADBCE] dark:border-[#38332E] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#EADBCE] dark:border-[#38332E] flex items-center justify-between bg-gradient-to-r from-rose-50/60 to-transparent dark:from-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#2D2926] dark:text-[#FAF7F2]">
                แจ้งของหมดสต๊อก
              </h2>
              <p className="text-xs text-[#78716A] dark:text-[#A8A199]">
                แตะ 1 ครั้ง เพื่อใส่เข้าลิสต์ต้องซื้อทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#78716A] hover:bg-[#F2ECE1] dark:hover:bg-[#2A2622] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#EADBCE] dark:border-[#332E2A] bg-[#FAF7F2] dark:bg-[#171513]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#78716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อของใช้ที่เพิ่งหมด (เช่น น้ำยาล้างจาน, ทิชชู่)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#23201D] border border-[#EADBCE] dark:border-[#38332E] rounded-2xl focus:outline-none focus:border-[#C25E40] text-[#2D2926] dark:text-[#FAF7F2]"
              autoFocus
            />
          </div>
        </div>

        {/* Existing Items Selection */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={async () => {
                    await markOutOfStock.mutateAsync(item.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#EADBCE] dark:border-[#332E2A] bg-white dark:bg-[#23201D] hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-left transition-all group active:scale-98"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate group-hover:text-rose-600 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#78716A] dark:text-[#A8A199] truncate">
                      {item.categoryName} · คงเหลือ {item.quantity} {item.unit}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    หมดแล้ว!
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#78716A]">
              ไม่พบของใช้ที่ตรงกับคำค้นหา
            </div>
          )}

          {/* Quick Create if not found */}
          <div className="mt-4 pt-4 border-t border-[#EADBCE] dark:border-[#332E2A]">
            <p className="text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] mb-2">
              หรือเพิ่มของใช้ใหม่ที่ไม่มีในระบบ:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="พิมพ์ชื่อของที่หมด..."
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#23201D] border border-[#EADBCE] dark:border-[#38332E] rounded-xl text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none focus:border-[#C25E40]"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RoomCategory)}
                className="px-3 py-2 text-xs bg-white dark:bg-[#23201D] border border-[#EADBCE] dark:border-[#38332E] rounded-xl text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none"
              >
                {HOME_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateNewAndMark}
                disabled={!customName.trim()}
                className="px-4 py-2 text-xs font-bold bg-[#C25E40] hover:bg-[#D96E4C] text-white rounded-xl shadow-xs disabled:opacity-40 transition-all shrink-0"
              >
                แจ้งว่าหมด
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#EADBCE] dark:border-[#332E2A] bg-[#FAF7F2] dark:bg-[#171513] text-center text-[11px] text-[#78716A]">
          รายการที่แจ้งหมด จะถูกส่งไปยังหน้า{" "}
          <strong className="text-[#C25E40]">"เรดาร์ของหมด & เตรียมซื้อของ"</strong> ทันที
        </div>
      </div>
    </div>
  );
}
