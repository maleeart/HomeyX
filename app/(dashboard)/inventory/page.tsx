"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Barcode,
  Edit2,
  Trash2,
  Minus,
  MapPin,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useHomeItems, useAdjustStock, useToggleShoppingList, useDeleteHomeItem } from "@/hooks/useHomeInventory";
import { HOME_CATEGORIES } from "@/lib/constants";
import { getItemStatus, statusConfig, formatCurrency, formatDate, isExpiringSoon } from "@/lib/utils";
import { HomeItem, ItemStockStatus, RoomCategory } from "@/types";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { exportInventoryExcel } from "@/lib/export";
import { EmptyState } from "@/components/ui/EmptyState";
import { Boxes } from "lucide-react";

export default function InventoryPage() {
  const { data: items = [], isLoading } = useHomeItems();
  const adjustStock = useAdjustStock();
  const toggleShopping = useToggleShoppingList();
  const deleteItem = useDeleteHomeItem();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ItemStockStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editingItem, setEditingItem] = useState<HomeItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategory !== "all") {
      result = result.filter((i) => i.categoryId === selectedCategory);
    }
    if (statusFilter !== "all") {
      result = result.filter((i) => getItemStatus(i) === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.barcode?.toLowerCase().includes(q) ||
          i.locationName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, selectedCategory, statusFilter, search]);

  return (
    <AppShell title="สต๊อกของใช้ในบ้าน">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2D2926] dark:text-[#FAF7F2]">
            รายการของใช้ทั้งหมด
          </h2>
          <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
            พบ {filteredItems.length} จากทั้งหมด {items.length} รายการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#C25E40] text-white"
                  : "text-[#78716A] hover:text-[#2D2926]"
              }`}
              title="มุมมองการ์ด"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-[#C25E40] text-white"
                  : "text-[#78716A] hover:text-[#2D2926]"
              }`}
              title="มุมมองตาราง"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export Excel */}
          <button
            onClick={() => exportInventoryExcel(filteredItems)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#F2ECE1] transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#4E7D5B]" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Add New Item */}
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#C25E40] hover:bg-[#D96E4C] text-white rounded-xl shadow-sm shadow-[#C25E40]/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มของใช้</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 mb-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8A199] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อของใช้, ยี่ห้อ, รหัส, บาร์โค้ด หรือสถานที่เก็บ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-[#78716A] hover:text-[#2D2926]"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Room Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-[#C25E40] text-white font-bold shadow-xs"
                : "bg-white dark:bg-[#1E1B18] text-[#544E48] dark:text-[#B5AFA8] border border-[#EADBCE] dark:border-[#38332E] hover:bg-[#F2ECE1]"
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          {HOME_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium shrink-0 transition-all ${
                  isSelected
                    ? "bg-[#C25E40] text-white font-bold shadow-xs"
                    : "bg-white dark:bg-[#1E1B18] text-[#544E48] dark:text-[#B5AFA8] border border-[#EADBCE] dark:border-[#38332E] hover:bg-[#F2ECE1]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#78716A] dark:text-[#A8A199] font-medium hidden sm:inline">
            สถานะ:
          </span>
          {(
            [
              { id: "all", label: "ทั้งหมด" },
              { id: "in_stock", label: "🟢 พร้อมใช้" },
              { id: "low_stock", label: "🟡 ใกล้หมด" },
              { id: "out_of_stock", label: "🔴 หมดสต๊อก" },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === st.id
                  ? "bg-[#EADBCE] dark:bg-[#38332E] font-bold text-[#2D2926] dark:text-[#FAF7F2]"
                  : "text-[#78716A] hover:bg-[#F2ECE1] dark:hover:bg-[#262320]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="ไม่พบรายการของใช้ที่ตรงกับเงื่อนไข"
          description="ลองค้นหาด้วยคำอื่น หรือกดเพิ่มของใช้ชิ้นใหม่เข้าระบบ"
          action={
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setStatusFilter("all");
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#C25E40] text-white rounded-xl shadow-xs"
            >
              รีเซ็ตตัวกรอง
            </button>
          }
        />
      ) : viewMode === "grid" ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const status = getItemStatus(item);
            const cfg = statusConfig[status];
            const expiring = isExpiringSoon(item.expiryDate);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border transition-all duration-200 hover:shadow-md ${cfg.borderClass} flex flex-col justify-between`}
              >
                <div>
                  {/* Card Header: Category & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] text-[#78716A] dark:text-[#A8A199] border border-[#EADBCE] dark:border-[#38332E]">
                      {item.categoryName || item.categoryId}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Item Name & Details with optional thumbnail */}
                  <div className="flex items-start gap-3 mb-3">
                    {item.images?.[0] && (
                      <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-[#EADBCE] dark:border-[#38332E] bg-[#FAF7F2]">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-[#2D2926] dark:text-[#FAF7F2] line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
                        {item.brand && `${item.brand} · `}
                        {item.size || item.code}
                      </p>
                    </div>
                  </div>

                  {/* Location & Meta info */}
                  <div className="space-y-1 mb-4 text-xs text-[#78716A] dark:text-[#A8A199]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C25E40] shrink-0" />
                      <span className="truncate">{item.locationName || "ไม่ได้ระบุที่เก็บ"}</span>
                    </div>
                    {item.barcode && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Barcode className="w-3.5 h-3.5 text-[#A8A199] shrink-0" />
                        <span>{item.barcode}</span>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span className={expiring ? "text-[#D97706] font-bold" : ""}>
                          หมดอายุ: {formatDate(item.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quantity + Fast - / + buttons */}
                <div className="pt-3 border-t border-[#EADBCE] dark:border-[#2D2926]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-[#78716A] dark:text-[#A8A199]">คงเหลือ: </span>
                      <span className="text-xl font-black text-[#2D2926] dark:text-[#FAF7F2]">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-[#78716A] ml-1">{item.unit}</span>
                      <span className="text-[10px] text-[#A8A199] block">
                        (เตือนเมื่อ ≤ {item.minStockLevel})
                      </span>
                    </div>

                    {/* Quick Adjust Buttons */}
                    <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-[#141210] p-1 rounded-xl border border-[#EADBCE] dark:border-[#38332E]">
                      <button
                        onClick={() => adjustStock.mutate({ id: item.id, delta: -1, reason: "หยิบใช้" })}
                        disabled={item.quantity <= 0}
                        title="ใช้ไป 1 ชิ้น"
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#24211E] border border-[#EADBCE] dark:border-[#38332E] flex items-center justify-center text-[#544E48] dark:text-[#C5BFB8] hover:bg-[#F2ECE1] disabled:opacity-40 active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => adjustStock.mutate({ id: item.id, delta: 1, reason: "ซื้อมาเติม" })}
                        title="เติม 1 ชิ้น"
                        className="w-8 h-8 rounded-lg bg-[#C25E40] text-white flex items-center justify-center hover:bg-[#D96E4C] active:scale-95 transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() =>
                        toggleShopping.mutate({
                          id: item.id,
                          inList: !item.isInShoppingList,
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                        item.isInShoppingList
                          ? "bg-[#D97706] text-white"
                          : "bg-[#F2ECE1] dark:bg-[#2A2622] text-[#6E675F] dark:text-[#B5AFA8] hover:bg-[#EADBCE]"
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{item.isInShoppingList ? "ในลิสต์ซื้อ" : "+ ลิสต์ซื้อ"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowAddModal(true);
                        }}
                        className="p-1.5 rounded-lg text-[#78716A] hover:bg-[#F2ECE1] dark:hover:bg-[#2A2622] hover:text-[#2D2926]"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบ "${item.name}" ออกจากระบบใช่หรือไม่?`)) {
                            deleteItem.mutate(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#78716A] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600"
                        title="ลบของชิ้นนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EADBCE] dark:border-[#38332E] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-[#171513] border-b border-[#EADBCE] dark:border-[#38332E] text-[#6E675F] dark:text-[#A8A199] font-semibold">
              <tr>
                <th className="py-3 px-4">ชื่อของใช้</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3">ที่เก็บในบ้าน</th>
                <th className="py-3 px-3 text-center">คงเหลือ</th>
                <th className="py-3 px-3">สถานะ</th>
                <th className="py-3 px-3 text-right">ปรับสต๊อก</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] dark:divide-[#2D2926]">
              {filteredItems.map((item) => {
                const status = getItemStatus(item);
                const cfg = statusConfig[status];

                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2] dark:hover:bg-[#171513] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2D2926] dark:text-[#FAF7F2]">{item.name}</div>
                      <div className="text-[11px] text-[#78716A]">
                        {item.brand && `${item.brand} · `}
                        {item.size || item.code}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#544E48] dark:text-[#B5AFA8]">
                      {item.categoryName}
                    </td>
                    <td className="py-3 px-3 text-[#544E48] dark:text-[#B5AFA8]">
                      {item.locationName}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-sm text-[#2D2926] dark:text-[#FAF7F2]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => adjustStock.mutate({ id: item.id, delta: -1, reason: "หยิบใช้" })}
                          disabled={item.quantity <= 0}
                          className="w-6 h-6 rounded bg-[#F2ECE1] dark:bg-[#2A2622] flex items-center justify-center hover:bg-[#EADBCE] disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => adjustStock.mutate({ id: item.id, delta: 1, reason: "เติมของ" })}
                          className="w-6 h-6 rounded bg-[#C25E40] text-white flex items-center justify-center hover:bg-[#D96E4C]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowAddModal(true);
                          }}
                          className="p-1 rounded text-[#78716A] hover:text-[#2D2926]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ลบ "${item.name}"?`)) deleteItem.mutate(item.id);
                          }}
                          className="p-1 rounded text-[#78716A] hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <AddItemModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        initialItem={editingItem}
      />
    </AppShell>
  );
}
