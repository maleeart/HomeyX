"use client";

import { useState } from "react";
import {
  Settings,
  Home,
  MapPin,
  Package,
  Database,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  LogIn,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_LOCATIONS, DEFAULT_UNITS } from "@/lib/constants";
import { loadItems, saveAllItems, INITIAL_ITEMS } from "@/lib/storage";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/useHomeInventory";

export default function SettingsPage() {
  const { user, firebaseUser, signInWithGoogle, logout, updateHouseholdName } = useAuth();
  const [householdInput, setHouseholdInput] = useState(user?.householdName || "บ้านสุขสันต์");
  const qc = useQueryClient();

  function handleSaveHouseholdName(e: React.FormEvent) {
    e.preventDefault();
    if (householdInput.trim()) {
      updateHouseholdName(householdInput.trim());
      toast.success("บันทึกชื่อบ้านเรียบร้อย");
    }
  }

  function handleExportBackup() {
    const items = loadItems();
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HomeyX_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อย");
  }

  function handleResetDemo() {
    if (
      confirm(
        "คุณต้องการรีเซ็ตข้อมูลของใช้กลับเป็นค่าเริ่มต้นตัวอย่าง (Demo Data) ใช่หรือไม่?"
      )
    ) {
      saveAllItems(INITIAL_ITEMS);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.items });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.movements });
      toast.success("รีเซ็ตข้อมูลตัวอย่างเรียบร้อย");
    }
  }

  return (
    <AppShell title="ตั้งค่าระบบ & โซนในบ้าน">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Household Info */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center text-[#C25E40]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                ข้อมูลบ้าน & ครอบครัว
              </h2>
              <p className="text-xs text-[#78716A] dark:text-[#A8A199]">
                ตั้งชื่อบ้านเพื่อแสดงผลบนหัวกระดาษและรายการช้อปปิ้ง
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveHouseholdName} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                ชื่อบ้าน (Household Name)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={householdInput}
                  onChange={(e) => setHouseholdInput(e.target.value)}
                  className="input-field"
                  placeholder="เช่น บ้านสุขสันต์, Our Cozy Home"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#C25E40] text-white rounded-xl hover:bg-[#D96E4C] active:scale-95 transition-all shrink-0"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Google Login info box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                บัญชีผู้ใช้งาน & Google Login
              </h3>
              <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-0.5">
                {firebaseUser
                  ? `เข้าสู่ระบบด้วย Google: ${firebaseUser.email}`
                  : "ปัจจุบันทำงานในโหมด Local Offline (พร้อมเชื่อมต่อ Google Login ในขั้นตอนต่อไป)"}
              </p>
            </div>

            {firebaseUser ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#FAF7F2] shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#C25E40]" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Storage Locations */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#C25E40]" />
            <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
              สถานที่จัดเก็บของใช้ในบ้าน
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LOCATIONS.map((loc) => (
              <span
                key={loc}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262320] text-[#544E48] dark:text-[#C5BFB8] border border-[#EADBCE] dark:border-[#38332E]"
              >
                {loc}
              </span>
            ))}
          </div>
        </div>

        {/* Units */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#C25E40]" />
            <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
              หน่วยนับมาตรฐาน
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_UNITS.map((u) => (
              <span
                key={u}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262320] text-[#544E48] dark:text-[#C5BFB8] border border-[#EADBCE] dark:border-[#38332E]"
              >
                {u}
              </span>
            ))}
          </div>
        </div>

        {/* Data Backup & Reset */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-[#C25E40]" />
            <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
              สำรองข้อมูล & รีเซ็ต
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#EADBCE]"
            >
              <Download className="w-4 h-4 text-[#4E7D5B]" />
              <span>ส่งออกไฟล์สำรอง (JSON)</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเซ็ตข้อมูลตัวอย่าง (Reset Demo)</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
