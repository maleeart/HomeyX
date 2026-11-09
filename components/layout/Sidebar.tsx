"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  ScanLine,
  CheckSquare,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeItems } from "@/hooks/useHomeInventory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section: string;
  badge?: number;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: items = [] } = useHomeItems();

  const outOfStockCount = items.filter((i) => i.quantity <= 0).length;
  const toBuyCount = items.filter(
    (i) => i.quantity <= 0 || i.isInShoppingList || i.quantity <= i.minStockLevel
  ).length;

  const navItems: NavItem[] = [
    {
      label: "เรดาร์ของหมด & เตรียมซื้อ",
      href: "/dashboard",
      icon: LayoutDashboard,
      section: "หลัก",
      badge: outOfStockCount > 0 ? outOfStockCount : undefined,
    },
    {
      label: "โหมดเดินซื้อของ",
      href: "/shopping",
      icon: ShoppingCart,
      section: "หลัก",
      badge: toBuyCount > 0 ? toBuyCount : undefined,
    },
    { label: "ของทั้งหมดในบ้าน", href: "/inventory", icon: Boxes, section: "คลังของ" },
    { label: "สแกนบาร์โค้ด / QR", href: "/scan", icon: ScanLine, section: "คลังของ" },
    { label: "ประวัติการซื้อ & เติม", href: "/history", icon: History, section: "ระบบ" },
    { label: "ตั้งค่า & ฐานข้อมูล", href: "/settings", icon: Settings, section: "ระบบ" },
  ];

  const sections = ["หลัก", "คลังของ", "ระบบ"];

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#FCFAF7] dark:bg-[#1A1816] border-r border-[#EADBCE] dark:border-[#332E2A] transition-all duration-300 relative shrink-0 z-30",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-[#EADBCE] dark:border-[#332E2A] transition-all",
          collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"
        )}
      >
        <div className="relative w-10 h-10 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-[#EADBCE] dark:border-[#403A34]">
          <Image src="/logo.png" alt="HomeyX" width={40} height={40} className="object-cover" priority />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight leading-none text-[#2D2926] dark:text-[#FAF7F2]">
                Homey<span className="text-[#C25E40]">X</span>
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#78716A] dark:text-[#A8A199] tracking-wider mt-1 truncate">
              เรดาร์ของหมด &amp; เช็คก่อนซื้อ
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-none">
        {sections.map((section) => {
          const itemsInSection = navItems.filter((i) => i.section === section);
          return (
            <div key={section} className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-1 text-[11px] font-semibold text-[#8C847B] dark:text-[#7A736A] uppercase tracking-wider">
                  {section}
                </p>
              )}
              {itemsInSection.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative w-full",
                      isActive
                        ? "bg-[#C25E40] text-white shadow-sm shadow-[#C25E40]/25 font-semibold"
                        : "text-[#544E48] dark:text-[#C5BFB8] hover:bg-[#F2ECE1] dark:hover:bg-[#262320] hover:text-[#2D2926] dark:hover:text-[#FAF7F2]"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
                        isActive ? "text-white" : "text-[#78716A] dark:text-[#9A938B] group-hover:text-[#C25E40]"
                      )}
                    />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={cn(
                          "ml-auto text-xs px-2 py-0.5 rounded-full font-bold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#D97706] text-white"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-[#EADBCE] dark:border-[#332E2A] space-y-2">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#EADBCE]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FDF4F0] dark:bg-[#2C1F1B] border border-[#F5D8CE] dark:border-[#4D2E25] flex items-center justify-center text-xs font-bold text-[#C25E40] shrink-0">
              {user?.displayName?.charAt(0) || "H"}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] truncate">
                {user?.displayName || "สมาชิก"}
              </p>
              <p className="text-[10px] text-[#78716A] dark:text-[#A8A199] truncate">
                {user?.householdName || user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors",
            collapsed && "justify-center"
          )}
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>

        {/* Collapse Toggle Footer */}
        {onToggle && (
          <div className="hidden md:block pt-1 border-t border-[#EADBCE]/60 dark:border-[#332E2A]/60">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-1.5 rounded-xl text-xs text-[#78716A] dark:text-[#A8A199] hover:bg-[#F2ECE1] dark:hover:bg-[#262320] transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
