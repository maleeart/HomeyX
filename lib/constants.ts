import { CategoryInfo, RoomCategory } from "@/types";

export const HOME_CATEGORIES: CategoryInfo[] = [
  {
    id: "kitchen",
    name: "ห้องครัว & ของกิน",
    nameEn: "Kitchen & Pantry",
    icon: "UtensilsCrossed",
    color: "#C25E40",       // Terracotta
    bgLight: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50",
    prefix: "KIT",
  },
  {
    id: "bathroom",
    name: "ห้องน้ำ & ดูแลร่างกาย",
    nameEn: "Bathroom & Personal Care",
    icon: "Bath",
    color: "#2A7B88",       // Deep Teal / Water
    bgLight: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50",
    prefix: "BAT",
  },
  {
    id: "cleaning",
    name: "ซักล้าง & ทำความสะอาด",
    nameEn: "Cleaning & Laundry",
    icon: "Sparkles",
    color: "#5B7065",       // Sage Olive
    bgLight: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
    prefix: "CLN",
  },
  {
    id: "living",
    name: "ห้องนอน & นั่งเล่น",
    nameEn: "Living & Bedroom",
    icon: "Armchair",
    color: "#8C6A53",       // Warm Wood
    bgLight: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
    prefix: "LIV",
  },
  {
    id: "medicine",
    name: "ยา & ปฐมพยาบาล",
    nameEn: "Medicine & First Aid",
    icon: "Pill",
    color: "#A84B4B",       // Warm Red
    bgLight: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
    prefix: "MED",
  },
  {
    id: "general",
    name: "ของใช้ทั่วไป",
    nameEn: "General Supplies",
    icon: "Box",
    color: "#6E675F",       // Warm Charcoal
    bgLight: "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
    prefix: "GEN",
  },
];

export const CATEGORY_MAP: Record<RoomCategory, CategoryInfo> = HOME_CATEGORIES.reduce(
  (acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  },
  {} as Record<RoomCategory, CategoryInfo>
);

export const DEFAULT_UNITS = [
  "ขวด",
  "ถุง",
  "ซอง",
  "ก้อน",
  "กล่อง",
  "ม้วน",
  "หลอด",
  "ชิ้น",
  "คู่",
  "แพ็ค",
  "กระป๋อง",
  "ตลับ",
];

export const DEFAULT_LOCATIONS = [
  "ตู้กับข้าว",
  "ตู้เย็น / ช่องแช่แข็ง",
  "ใต้ซิงค์ครัว",
  "ลิ้นชักเครื่องปรุง",
  "ชั้นวางห้องน้ำ",
  "ใต้อ่างล้างหน้า",
  "มุมเครื่องซักผ้า",
  "ตู้เก็บอุปกรณ์ทำความสะอาด",
  "ตู้ยาประจำบ้าน",
  "โต๊ะเครื่องแป้ง",
  "ตู้เก็บของใต้บันได",
  "ห้องเก็บของ",
];
