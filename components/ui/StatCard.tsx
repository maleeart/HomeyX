"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  accentColor?: "terracotta" | "amber" | "sage" | "charcoal";
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  accentColor = "terracotta",
  onClick,
}: StatCardProps) {
  const colorStyles = {
    terracotta: {
      bg: "bg-[#FDF4F0] dark:bg-[#2C1F1B]",
      text: "text-[#C25E40] dark:text-[#E0795A]",
      border: "border-[#F5D8CE] dark:border-[#4D2E25]",
      badge: "bg-[#C25E40] text-white",
    },
    amber: {
      bg: "bg-[#FEF7EC] dark:bg-[#2B2317]",
      text: "text-[#D97706] dark:text-[#FBBF24]",
      border: "border-[#FDE6BA] dark:border-[#4B391F]",
      badge: "bg-[#D97706] text-white",
    },
    sage: {
      bg: "bg-[#F2F7F3] dark:bg-[#1A261D]",
      text: "text-[#4E7D5B] dark:text-[#76A885]",
      border: "border-[#D6E6D9] dark:border-[#2D4533]",
      badge: "bg-[#4E7D5B] text-white",
    },
    charcoal: {
      bg: "bg-[#F7F4EE] dark:bg-[#22201D]",
      text: "text-[#6E675F] dark:text-[#A8A199]",
      border: "border-[#EADBCE] dark:border-[#38332E]",
      badge: "bg-[#6E675F] text-white",
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border transition-all duration-200",
        "bg-white dark:bg-[#1E1B18]",
        colorStyles.border,
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0" : "",
        "relative overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#78716A] dark:text-[#A8A199]">
          {label}
        </span>
        <div className={cn("p-2 rounded-xl", colorStyles.bg)}>
          <Icon className={cn("w-4 h-4", colorStyles.text)} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("text-2xl font-bold tracking-tight", colorStyles.text)}>
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-[#78716A] dark:text-[#9A938B]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
