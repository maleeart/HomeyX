"use client";

import { useEffect, useRef, useState } from "react";
import {
  ScanLine,
  Camera,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useHomeItems, useAdjustStock, useToggleShoppingList } from "@/hooks/useHomeInventory";
import { findItemByBarcodeOrCode } from "@/lib/storage";
import { HomeItem } from "@/types";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { getItemStatus, statusConfig } from "@/lib/utils";
import { toast } from "sonner";

export default function ScanPage() {
  const [scannedCode, setScannedCode] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [foundItem, setFoundItem] = useState<HomeItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const scannerRef = useRef<any>(null);

  const adjustStock = useAdjustStock();
  const toggleShopping = useToggleShoppingList();

  // Search by code or barcode
  async function handleLookup(code: string) {
    if (!code.trim()) return;
    setScannedCode(code.trim());
    const item = await findItemByBarcodeOrCode(code.trim());
    if (item) {
      setFoundItem(item);
      setNotFound(false);
      toast.success(`พบของใช้: ${item.name}`);
    } else {
      setFoundItem(null);
      setNotFound(true);
      toast.info(`ไม่พบข้อมูลสำหรับรหัส: ${code}`);
    }
  }

  // Camera scanner toggle
  useEffect(() => {
    let html5QrCode: any = null;

    if (cameraActive) {
      import("html5-qrcode")
        .then(({ Html5Qrcode }) => {
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 280, height: 180 },
            formatsToSupport: [
              0, // QR_CODE
              1, // AZTEC
              2, // CODABAR
              3, // CODE_39
              4, // CODE_93
              5, // CODE_128
              6, // DATA_MATRIX
              7, // MAXICODE
              8, // ITF
              9, // EAN_13 (Supermarket barcode)
              10, // EAN_8
              11, // PDF_417
              12, // RSS_14
              13, // RSS_EXPANDED
              14, // UPC_A
              15, // UPC_E
              16, // UPC_EAN_EXTENSION
            ],
          };

          html5QrCode
            .start(
              { facingMode: "environment" },
              config,
              (decodedText: string) => {
                handleLookup(decodedText);
                // Pause slightly on success
              },
              (errorMessage: string) => {
                // ignore scanning noise
              }
            )
            .catch((err: any) => {
              console.warn("Camera init failed:", err);
              setCameraActive(false);
              toast.error("ไม่สามารถเข้าถึงกล้องได้ กรุณากรอกรหัสด้วยตนเอง");
            });
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  return (
    <AppShell title="สแกนบาร์โค้ด & QR Code">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Intro Banner */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center mx-auto mb-3 text-[#C25E40]">
            <ScanLine className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#2D2926] dark:text-[#FAF7F2]">
            สแกนบาร์โค้ดบนของใช้ในบ้าน
          </h2>
          <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-1 max-w-sm mx-auto">
            สแกนบาร์โค้ดบนขวดแชมพู ซองน้ำยา หรือกล่องอาหาร เพื่อเช็คจำนวนคงเหลือและตัดใช้ได้ทันที
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                cameraActive
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-[#C25E40] text-white hover:bg-[#D96E4C]"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? "ปิดกล้องสแกน" : "เปิดกล้องสแกน"}</span>
            </button>
          </div>
        </div>

        {/* Camera Container */}
        {cameraActive && (
          <div className="p-4 rounded-3xl bg-black rounded-2xl overflow-hidden border border-[#EADBCE]">
            <div id="reader" className="w-full h-64 overflow-hidden" />
            <p className="text-center text-xs text-white/70 mt-2">
              เล็งกรอบกล้องไปที่บาร์โค้ดหรือ QR Code
            </p>
          </div>
        )}

        {/* Manual Input Fallback */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#EADBCE] dark:border-[#38332E] shadow-xs">
          <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1.5">
            หรือค้นหาด้วยเลขบาร์โค้ด / รหัสของใช้
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-[#A8A199] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="เช่น 8850002011234 หรือ KIT-0001"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup(manualInput)}
                className="input-field pl-9"
              />
            </div>
            <button
              onClick={() => handleLookup(manualInput)}
              className="px-4 py-2 text-xs font-bold bg-[#C25E40] text-white rounded-xl hover:bg-[#D96E4C] shrink-0"
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* Scanned Result Card */}
        {foundItem && (
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border-2 border-[#C25E40] shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4E7D5B] mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>พบข้อมูลของใช้ในบ้าน!</span>
            </div>

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#262320] text-[#78716A] border border-[#EADBCE]">
                  {foundItem.categoryName}
                </span>
                <h3 className="text-lg font-bold text-[#2D2926] dark:text-[#FAF7F2] mt-1">
                  {foundItem.name}
                </h3>
                <p className="text-xs text-[#78716A] dark:text-[#A8A199]">
                  {foundItem.brand && `${foundItem.brand} · `}
                  {foundItem.size || foundItem.code} · เก็บที่: {foundItem.locationName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#78716A] block">คงเหลือ</span>
                <span className="text-2xl font-black text-[#C25E40]">
                  {foundItem.quantity}
                </span>
                <span className="text-xs text-[#78716A] ml-1">{foundItem.unit}</span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#171513] border border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between gap-2">
              <button
                onClick={async () => {
                  await adjustStock.mutateAsync({ id: foundItem.id, delta: -1, reason: "ตัดใช้จากการสแกน" });
                  setFoundItem((prev) => (prev ? { ...prev, quantity: Math.max(0, prev.quantity - 1) } : null));
                }}
                disabled={foundItem.quantity <= 0}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#24211E] border border-[#EADBCE] rounded-xl hover:bg-[#F2ECE1] disabled:opacity-40 active:scale-95 transition-all text-[#2D2926] dark:text-[#FAF7F2]"
              >
                <Minus className="w-3.5 h-3.5 text-[#C25E40]" />
                <span>ตัดใช้ 1 ชิ้น</span>
              </button>

              <button
                onClick={async () => {
                  await adjustStock.mutateAsync({ id: foundItem.id, delta: 1, reason: "เติมของจากการสแกน" });
                  setFoundItem((prev) => (prev ? { ...prev, quantity: prev.quantity + 1 } : null));
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#C25E40] text-white rounded-xl hover:bg-[#D96E4C] active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เติม 1 ชิ้น</span>
              </button>

              <button
                onClick={async () => {
                  await toggleShopping.mutateAsync({ id: foundItem.id, inList: true });
                  setFoundItem((prev) => (prev ? { ...prev, isInShoppingList: true } : null));
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#D97706] text-white rounded-xl hover:bg-[#B45309] active:scale-95 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{foundItem.isInShoppingList ? "ในลิสต์ซื้อแล้ว" : "ต้องซื้อเพิ่ม"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Not Found Screen */}
        {notFound && (
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-amber-200 dark:border-amber-900/40 text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#D97706] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#2D2926] dark:text-[#FAF7F2]">
              ยังไม่มีของชิ้นนี้ในสต๊อกบ้าน
            </h3>
            <p className="text-xs text-[#78716A] dark:text-[#A8A199] mt-1 mb-4">
              รหัสบาร์โค้ด: <code className="font-mono font-bold">{scannedCode}</code>
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#C25E40] text-white rounded-xl shadow-xs hover:bg-[#D96E4C]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มของใช้ชิ้นนี้เข้าระบบทันที</span>
            </button>
          </div>
        )}
      </div>

      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialItem={{
          id: "",
          code: "",
          barcode: scannedCode,
          name: "",
          categoryId: "kitchen",
          locationId: "ตู้กับข้าว",
          unit: "ชิ้น",
          quantity: 1,
          minStockLevel: 1,
          createdAt: "",
          updatedAt: "",
        }}
      />
    </AppShell>
  );
}
