"use client";

import { useState, useMemo } from "react";
import { History, ArrowDownRight, ArrowUpRight, Plus, RefreshCw, Calendar, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useStockMovements } from "@/hooks/useHomeInventory";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { MovementType } from "@/types";

export default function HistoryPage() {
  const { data: movements = [], isLoading } = useStockMovements();
  const [filterType, setFilterType] = useState<string>("all");

  const filteredMovements = useMemo(() => {
    if (filterType === "all") return movements;
    return movements.filter((m) => m.type === filterType);
  }, [movements, filterType]);

  const typeConfig: Record<
    MovementType,
    { label: string; bg: string; text: string; icon: any }
  > = {
    consume: {
      label: "ใช้ไป",
      bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/40",
      text: "text-orange-700 dark:text-orange-300",
      icon: ArrowDownRight,
    },
    restock: {
      label: "เติมของ",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: ArrowUpRight,
    },
    adjust: {
      label: "ปรับยอดนับ",
      bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
      icon: RefreshCw,
    },
    initial: {
      label: "เพิ่มของใหม่",
      bg: "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700",
      text: "text-stone-700 dark:text-stone-300",
      icon: Plus,
    },
  };

  return (
    <AppShell title="ประวัติการใช้ & เติมของใช้">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center text-[#C25E40]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                บันทึกความเคลื่อนไหวสต๊อก
              </h2>
              <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
                ติดตามย้อนหลังว่าของชิ้นไหนถูกหยิบใช้ หรือซื้อเข้ามาเติมเมื่อไหร่
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: `ทั้งหมด (${movements.length})` },
            { id: "consume", label: "🔻 ใช้ไป" },
            { id: "restock", label: "🟢 เติมของ" },
            { id: "initial", label: "📦 เพิ่มใหม่" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filterType === tab.id
                  ? "bg-[#C25E40] text-white shadow-xs"
                  : "bg-white dark:bg-[#1E1B18] text-[#544E48] dark:text-[#B5AFA8] border border-[#EADBCE] dark:border-[#38332E] hover:bg-[#F2ECE1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline list */}
        {filteredMovements.length === 0 ? (
          <EmptyState
            icon={History}
            title="ไม่มีประวัติการเคลื่อนไหว"
            description="เมื่อมีการหยิบของใช้หรือเติมของ ระบบจะบันทึกประวัติให้อัตโนมัติ"
          />
        ) : (
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EADBCE] dark:border-[#38332E] p-4 sm:p-6 divide-y divide-[#EADBCE] dark:divide-[#2D2926] shadow-xs">
            {filteredMovements.map((mov) => {
              const cfg = typeConfig[mov.type] || typeConfig.initial;
              const Icon = cfg.icon;

              return (
                <div
                  key={mov.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.text}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                          {mov.itemName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.text}`}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
                        {mov.reason || "ไม่มีบันทึกเหตุผล"}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-[#A8A199] mt-1">
                        <span>{formatDateTime(mov.createdAt)}</span>
                        <span>•</span>
                        <span>{formatRelative(mov.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity change details */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black ${
                        mov.quantityChange > 0 ? "text-emerald-600" : "text-[#C25E40]"
                      }`}
                    >
                      {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange} {mov.unit}
                    </span>
                    <span className="text-[10px] text-[#78716A] dark:text-[#A8A199] block">
                      ยอดคงเหลือ: {mov.quantityAfter} {mov.unit}
                    </span>
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
