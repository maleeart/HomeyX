"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { toggle, isDark } = useTheme();
  return (
    <button
      onClick={toggle}
      title={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95",
        "bg-[#F2ECE1] dark:bg-[#2A2622] hover:bg-[#EADBCE] dark:hover:bg-[#38332E]",
        className
      )}
    >
      <Sun className="w-4 h-4 text-[#C25E40] dark:hidden" />
      <Moon className="w-4 h-4 hidden dark:block text-[#D96E4C]" />
    </button>
  );
}
