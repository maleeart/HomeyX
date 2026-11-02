"use client";

import { Menu, ScanLine, Plus, RefreshCw, Home, Search, Heart, User } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QUERY_KEYS } from "@/hooks/useHomeInventory";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onOpenAddItem?: () => void;
}

export function Header({ title, onMenuClick, onOpenAddItem }: HeaderProps) {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard";
  const qc = useQueryClient();

  function handleRefresh() {
    setSpinning(true);
    qc.invalidateQueries({ queryKey: QUERY_KEYS.items });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.movements });
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <header className="h-16 bg-[#FCFAF7]/90 dark:bg-[#1A1816]/90 backdrop-blur-md border-b border-[#EADBCE] dark:border-[#332E2A] flex items-center px-4 gap-3 shrink-0 z-20 sticky top-0">
      {/* Mobile drawer toggle button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl bg-[#F2ECE1] dark:bg-[#2A2622] text-[#2D2926] dark:text-[#FAF7F2] hover:bg-[#EADBCE] active:scale-95 transition-all"
        aria-label="เปิดเมนู"
      >
        <Menu className="w-5 h-5 text-[#C25E40]" />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-lg font-bold text-[#2D2926] dark:text-[#FAF7F2] hidden sm:block">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Quick Add Item Button */}
        {onOpenAddItem && (
          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#C25E40] text-white rounded-xl shadow-sm hover:bg-[#D96E4C] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">เพิ่มของใช้</span>
          </button>
        )}

        {/* Scan Barcode Shortcut */}
        <button
          onClick={() => router.push("/scan")}
          title="สแกนบาร์โค้ด"
          className="p-2 rounded-xl bg-[#F2ECE1] dark:bg-[#2A2622] hover:bg-[#EADBCE] dark:hover:bg-[#38332E] text-[#544E48] dark:text-[#C5BFB8] transition-colors active:scale-95"
        >
          <ScanLine className="w-4 h-4 text-[#C25E40]" />
        </button>

        {/* Home shortcut */}
        {!onDashboard && (
          <button
            onClick={() => router.push("/dashboard")}
            title="หน้าหลัก"
            className="p-2 rounded-xl bg-[#F2ECE1] dark:bg-[#2A2622] hover:bg-[#EADBCE] dark:hover:bg-[#38332E] text-[#544E48] dark:text-[#C5BFB8] transition-colors active:scale-95 hidden sm:flex"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          title="รีเฟรชข้อมูล"
          className="p-2 rounded-xl bg-[#F2ECE1] dark:bg-[#2A2622] hover:bg-[#EADBCE] dark:hover:bg-[#38332E] text-[#544E48] dark:text-[#C5BFB8] transition-colors active:scale-95"
        >
          <RefreshCw className={cn("w-4 h-4", spinning && "animate-spin text-[#C25E40]")} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Avatar / Settings Link */}
        <Link
          href="/settings"
          title={user?.displayName ? `${user.displayName} (${user.householdName})` : "การตั้งค่าบ้าน"}
          className="flex items-center gap-2 pl-2 border-l border-[#EADBCE] dark:border-[#38332E]"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-[#EADBCE] hover:scale-105 transition-transform shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FDF4F0] dark:bg-[#2C1F1B] border border-[#F5D8CE] dark:border-[#4D2E25] flex items-center justify-center text-xs font-bold text-[#C25E40] hover:scale-105 transition-transform shrink-0">
              {user?.displayName?.charAt(0) || "H"}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
