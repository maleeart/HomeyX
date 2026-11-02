"use client";

import { useState, useMemo } from "react";
import {
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useHomeItems, useSaveHomeItem } from "@/hooks/useHomeInventory";
import { HOME_CATEGORIES } from "@/lib/constants";
import { RoomCategory, HomeItem } from "@/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AuditPage() {
  const { data: items = [], isLoading } = useHomeItems();
  const saveMut = useSaveHomeItem();
  const [selectedRoom, setSelectedRoom] = useState<RoomCategory>("kitchen");

  // Temporary local state for count adjustments
  const [countedQuantities, setCountedQuantities] = useState<Record<string, number>>({});

  const roomItems = useMemo(() => {
    return items.filter((i) => i.categoryId === selectedRoom);
  }, [items, selectedRoom]);

  function getCount(item: HomeItem): number {
    return countedQuantities[item.id] !== undefined
      ? countedQuantities[item.id]
      : item.quantity;
  }

  function handleCountChange(id: string, newCount: number) {
    setCountedQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, newCount),
    }));
  }

  async function handleConfirmItem(item: HomeItem) {
    const currentCount = getCount(item);
    if (currentCount === item.quantity) {
      toast.info(`ยอด "${item.name}" ตรงกับในระบบแล้ว (${currentCount} ${item.unit})`);
      return;
    }

    await saveMut.mutateAsync({
      ...item,
      quantity: currentCount,
      notes: item.notes,
    });
  }

  async function handleSaveAllInRoom() {
    let updatedCount = 0;
    for (const item of roomItems) {
      const count = getCount(item);
      if (count !== item.quantity) {
        await saveMut.mutateAsync({
          ...item,
          quantity: count,
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      toast.success(`อัปเดตยอดสต๊อกในหมวดนี้แล้ว ${updatedCount} รายการ!`);
    } else {
      toast.info("ทุกรายการมียอดตรงตามที่บันทึกไว้แล้ว");
    }
  }

  return (
    <AppShell title="เช็คสต๊อกของใช้ตามห้อง">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#4E7D5B]/10 text-[#4E7D5B] border border-[#4E7D5B]/20">
                  โหมดตรวจนับสต๊อก
                </span>
                <span className="text-xs text-[#78716A]">เดินตรวจนับตามห้อง</span>
              </div>
              <h2 className="text-xl font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                ตรวจเช็คยอดคงเหลือจริงในบ้าน
              </h2>
              <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-1">
                เดินเปิดตู้/ชั้นวางตามห้อง และกดยืนยันยอดคงเหลือจริง เพื่อให้ข้อมูลตรงกับชีวิตจริงเสมอ
              </p>
            </div>

            <button
              onClick={handleSaveAllInRoom}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#4E7D5B] hover:bg-[#3D6348] text-white rounded-xl shadow-sm active:scale-95 transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกยอดทั้งห้อง ({roomItems.length})</span>
            </button>
          </div>
        </div>

        {/* Room Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {HOME_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            const isSelected = selectedRoom === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedRoom(cat.id)}
                className={`px-3.5 py-2 text-xs rounded-xl font-medium shrink-0 transition-all ${
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

        {/* Room Items List */}
        {roomItems.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="ยังไม่มีของใช้ในห้องนี้"
            description="สามารถเพิ่มของใช้ใหม่ในห้องนี้ได้จากเมนูสต๊อกของใช้"
          />
        ) : (
          <div className="space-y-3">
            {roomItems.map((item) => {
              const currentCount = getCount(item);
              const isDiff = currentCount !== item.quantity;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDiff
                      ? "border-[#D97706] bg-[#FEF7EC]/50 dark:bg-[#2B2317]/20"
                      : "border-[#EADBCE] dark:border-[#38332E]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-[#78716A]">
                        ({item.brand ? `${item.brand} ` : ""}{item.size || item.code})
                      </span>
                    </div>
                    <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
                      ที่เก็บ: <strong>{item.locationName}</strong> · ยอดเดิมในระบบ:{" "}
                      <strong>{item.quantity}</strong> {item.unit}
                    </p>
                  </div>

                  {/* Quantity Stepper & Confirm Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#141210] p-1 rounded-xl border border-[#EADBCE] dark:border-[#38332E]">
                      <button
                        onClick={() => handleCountChange(item.id, currentCount - 1)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#24211E] border border-[#EADBCE] dark:border-[#38332E] flex items-center justify-center text-[#544E48] hover:bg-[#F2ECE1] active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-12 text-center font-black text-base text-[#2D2926] dark:text-[#FAF7F2]">
                        {currentCount}
                      </span>

                      <button
                        onClick={() => handleCountChange(item.id, currentCount + 1)}
                        className="w-8 h-8 rounded-lg bg-[#C25E40] text-white flex items-center justify-center hover:bg-[#D96E4C] active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleConfirmItem(item)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                        isDiff
                          ? "bg-[#D97706] text-white hover:bg-[#B45309]"
                          : "bg-[#FAF7F2] dark:bg-[#2A2622] text-[#4E7D5B] hover:bg-[#EADBCE]"
                      }`}
                    >
                      {isDiff ? "ปรับยอด" : "ถูกต้องแล้ว"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
