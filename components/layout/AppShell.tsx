"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F2] dark:bg-[#141210]">
      {/* Mobile Backdrop Scrim */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* 1. Desktop Stationary Drawer (screen >= 1024px) */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* 2. Mobile Drawer Modal (screen < 1024px) */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          collapsed={false}
          onItemClick={() => setMobileDrawerOpen(false)}
        />
      </div>

      {/* 3. Main Canvas Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          title={title}
          onMenuClick={() => setMobileDrawerOpen(true)}
          onOpenAddItem={() => setShowAddModal(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-24 lg:pb-8">{children}</div>
        </main>
      </div>

      {/* 4. Ergonomic Hamburger FAB (Mobile Only, Thumb-Zone Anchored Bottom-Left) */}
      <button
        onClick={() => setMobileDrawerOpen((o) => !o)}
        aria-label="เมนูหลัก"
        className={cn(
          "fixed bottom-6 left-6 z-40 lg:hidden",
          "w-13 h-13 rounded-2xl bg-[#C25E40] text-white shadow-lg shadow-[#C25E40]/30",
          "flex items-center justify-center hover:bg-[#D96E4C] active:scale-95 transition-all"
        )}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Add Item Modal */}
      <AddItemModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
