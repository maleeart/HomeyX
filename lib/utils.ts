import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { th } from "date-fns/locale";
import { HomeItem, ItemStockStatus, RoomCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Stock Status Helper ───────────────────────────────────────
export function getItemStatus(item: Pick<HomeItem, "quantity" | "minStockLevel">): ItemStockStatus {
  if (item.quantity <= 0) return "out_of_stock";
  if (item.quantity <= (item.minStockLevel ?? 1)) return "low_stock";
  return "in_stock";
}

export const statusConfig: Record<
  ItemStockStatus,
  { label: string; badgeClass: string; dotClass: string; borderClass: string }
> = {
  in_stock: {
    label: "พร้อมใช้",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-200 dark:border-emerald-900/40",
  },
  low_stock: {
    label: "ใกล้หมด",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-300 dark:border-amber-800",
  },
  out_of_stock: {
    label: "หมดสต๊อก",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dotClass: "bg-rose-500",
    borderClass: "border-rose-300 dark:border-rose-900",
  },
};

// ── Date Formatting ───────────────────────────────────────────
export function formatDate(dateStr?: string | Date, fmt = "dd/MM/yyyy"): string {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, fmt);
  } catch {
    return "-";
  }
}

export function formatDateTime(dateStr?: string | Date): string {
  return formatDate(dateStr, "dd/MM/yyyy HH:mm");
}

export function formatRelative(dateStr?: string | Date): string {
  if (!dateStr) return "-";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(d, { addSuffix: true, locale: th });
  } catch {
    return "-";
  }
}

export function isExpiringSoon(expiryDateStr?: string, days = 14): boolean {
  if (!expiryDateStr) return false;
  try {
    const d = parseISO(expiryDateStr);
    const now = new Date();
    const threshold = addDays(now, days);
    return isBefore(d, threshold) && isAfter(d, now);
  } catch {
    return false;
  }
}

export function isExpired(expiryDateStr?: string): boolean {
  if (!expiryDateStr) return false;
  try {
    const d = parseISO(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(d, today);
  } catch {
    return false;
  }
}

// ── Currency & Numbers ────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("th-TH").format(n);
}

// ── Code Generation ───────────────────────────────────────────
const CATEGORY_PREFIX: Record<RoomCategory, string> = {
  kitchen: "KIT",
  bathroom: "BAT",
  cleaning: "CLN",
  living: "LIV",
  medicine: "MED",
  general: "GEN",
};

export function generateItemCode(category: RoomCategory, existingCodes: string[]): string {
  const prefix = CATEGORY_PREFIX[category] ?? "ITM";
  const same = existingCodes.filter((c) => c.startsWith(`${prefix}-`));

  let maxNum = 0;
  same.forEach((code) => {
    const parts = code.split("-");
    const numPart = parts[parts.length - 1];
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed) && parsed > maxNum) {
      maxNum = parsed;
    }
  });

  const next = maxNum + 1;
  return `${prefix}-${next.toString().padStart(4, "0")}`;
}
