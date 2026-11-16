"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  Plus,
  Minus,
  Sparkles,
  Barcode,
  Trash2,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { HomeItem, RoomCategory } from "@/types";
import { HOME_CATEGORIES, DEFAULT_UNITS, DEFAULT_LOCATIONS } from "@/lib/constants";
import { generateItemCode } from "@/lib/utils";
import { useHomeItems, useSaveHomeItem, useDeleteHomeItem } from "@/hooks/useHomeInventory";
import {
  KNOWN_THAI_PRODUCTS,
  POPULAR_QUICK_PRESETS,
  inferCategoryAndUnitFromName,
  compressImageToDataUrl,
  scanBarcodeFromFile,
} from "@/lib/productScanner";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  initialItem?: HomeItem | null;
}

export function AddItemModal({ open, onClose, initialItem }: AddItemModalProps) {
  const { data: items = [] } = useHomeItems();
  const saveMut = useSaveHomeItem();
  const deleteMut = useDeleteHomeItem();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(initialItem && initialItem.id && initialItem.id.trim() !== "");

  // Core fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<RoomCategory>("kitchen");
  const [categoryManuallyChosen, setCategoryManuallyChosen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(DEFAULT_UNITS[0]);
  const [locationName, setLocationName] = useState(DEFAULT_LOCATIONS[0]);

  // Optional fields (in expandable section)
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [barcode, setBarcode] = useState("");
  const [minStockLevel, setMinStockLevel] = useState(1);
  const [targetStockLevel, setTargetStockLevel] = useState(2);
  const [priceEstimate, setPriceEstimate] = useState<string | number>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // UI state
  const [showDetails, setShowDetails] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);

  // Initialize form state
  useEffect(() => {
    if (!open) return;

    setScanMessage(null);
    setIsScanning(false);

    if (initialItem && initialItem.id && initialItem.id.trim() !== "") {
      // Editing existing item
      setName(initialItem.name || "");
      setCategoryId(initialItem.categoryId || "kitchen");
      setCategoryManuallyChosen(true);
      setBrand(initialItem.brand || "");
      setSize(initialItem.size || "");
      setBarcode(initialItem.barcode || "");
      setLocationName(initialItem.locationName || initialItem.locationId || DEFAULT_LOCATIONS[0]);
      setUnit(initialItem.unit || DEFAULT_UNITS[0]);
      setQuantity(initialItem.quantity ?? 1);
      setMinStockLevel(initialItem.minStockLevel ?? 1);
      setTargetStockLevel(initialItem.targetStockLevel || (initialItem.minStockLevel ?? 1) + 1);
      setPriceEstimate(initialItem.priceEstimate !== undefined ? String(initialItem.priceEstimate) : "");
      setExpiryDate(initialItem.expiryDate || "");
      setNotes(initialItem.notes || "");
      setImageUrl(initialItem.images?.[0] || "");
      setShowDetails(Boolean(initialItem.brand || initialItem.expiryDate || initialItem.notes || initialItem.priceEstimate));
    } else if (initialItem?.barcode) {
      // Incoming from scanner page with barcode
      const scannedCode = initialItem.barcode.trim();
      setBarcode(scannedCode);
      const known = KNOWN_THAI_PRODUCTS[scannedCode];

      if (known) {
        setName(known.name);
        setBrand(known.brand || "");
        setSize(known.size || "");
        setCategoryId(known.categoryId);
        setCategoryManuallyChosen(true);
        setUnit(known.unit);
        setLocationName(known.locationName);
        if (known.priceEstimate) setPriceEstimate(known.priceEstimate);
        if (known.minStockLevel) setMinStockLevel(known.minStockLevel);
        if (known.targetStockLevel) setTargetStockLevel(known.targetStockLevel);
        setScanMessage({ text: `ตรวจพบสินค้า: ${known.name}`, isSuccess: true });
      } else {
        setName(initialItem.name || "");
        setCategoryId(initialItem.categoryId || "kitchen");
        setCategoryManuallyChosen(false);
        setQuantity(1);
        setUnit(DEFAULT_UNITS[0]);
        setLocationName(DEFAULT_LOCATIONS[0]);
        setScanMessage({ text: `พบบาร์โค้ด ${scannedCode} (ระบุชื่อสินค้าเพื่อจัดเก็บ)`, isSuccess: true });
      }
      setShowDetails(false);
    } else {
      // Clean new item
      setName("");
      setCategoryId("kitchen");
      setCategoryManuallyChosen(false);
      setBrand("");
      setSize("");
      setBarcode("");
      setLocationName(DEFAULT_LOCATIONS[0]);
      setUnit(DEFAULT_UNITS[0]);
      setQuantity(1);
      setMinStockLevel(1);
      setTargetStockLevel(2);
      setPriceEstimate("");
      setExpiryDate("");
      setNotes("");
      setImageUrl("");
      setShowDetails(false);
    }
  }, [initialItem, open]);

  if (!open) return null;

  // Handle typing item name with auto-detection of category & unit
  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryManuallyChosen && val.trim().length >= 2) {
      const inferred = inferCategoryAndUnitFromName(val);
      setCategoryId(inferred.categoryId);
      setUnit(inferred.unit);
      setLocationName(inferred.locationName);
    }
  };

  // Quick preset 1-tap fill
  const handleSelectPreset = (preset: (typeof POPULAR_QUICK_PRESETS)[0]) => {
    setName(preset.name);
    setCategoryId(preset.categoryId);
    setUnit(preset.unit);
    setLocationName(preset.locationName);
    setCategoryManuallyChosen(true);

    // Look for matching barcode in known products
    for (const [code, p] of Object.entries(KNOWN_THAI_PRODUCTS)) {
      if (p.name.includes(preset.name) || preset.name.includes(p.name)) {
        setBarcode(code);
        if (p.brand) setBrand(p.brand);
        if (p.size) setSize(p.size);
        if (p.priceEstimate) setPriceEstimate(p.priceEstimate);
        break;
      }
    }
  };

  // Process captured/selected photo for barcode reading & image compression
  const handleProcessImage = async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setScanMessage({ text: "กำลังอ่านข้อมูลจากรูปภาพและตรวจจับบาร์โค้ด...", isSuccess: false });

    try {
      // 1. Compress image for thumbnail storage
      const compressedDataUrl = await compressImageToDataUrl(file, 600, 0.75);
      setImageUrl(compressedDataUrl);

      // 2. Scan barcode from image
      const detectedBarcode = await scanBarcodeFromFile(file);

      if (detectedBarcode) {
        setBarcode(detectedBarcode);
        const known = KNOWN_THAI_PRODUCTS[detectedBarcode];
        if (known) {
          setName(known.name);
          setBrand(known.brand || "");
          setSize(known.size || "");
          setCategoryId(known.categoryId);
          setCategoryManuallyChosen(true);
          setUnit(known.unit);
          setLocationName(known.locationName);
          if (known.priceEstimate) setPriceEstimate(known.priceEstimate);
          if (known.minStockLevel) setMinStockLevel(known.minStockLevel);
          if (known.targetStockLevel) setTargetStockLevel(known.targetStockLevel);
          setScanMessage({ text: `🎉 ตรวจพบสินค้า: ${known.name}`, isSuccess: true });
        } else {
          setScanMessage({
            text: `✅ ตรวจพบบาร์โค้ด: ${detectedBarcode} (พิมพ์ชื่อเพื่อระบุหมวดหมู่อัตโนมัติ)`,
            isSuccess: true,
          });
        }
      } else {
        setScanMessage({
          text: "📸 แนบรูปถ่ายสินค้าแล้ว (พิมพ์ชื่อสินค้าด้านล่างเพื่อบันทึกด่วน)",
          isSuccess: true,
        });
      }
    } catch (err) {
      console.warn("Failed to process image:", err);
      setScanMessage({
        text: "แนบรูปถ่ายแล้ว (ไม่พบบาร์โค้ดที่ชัดเจน กรุณาระบุชื่อสินค้า)",
        isSuccess: false,
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Submit & Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const existingCodes = items.map((i) => i.code);
    const code = isEditMode && initialItem ? initialItem.code : generateItemCode(categoryId, existingCodes);
    const cat = HOME_CATEGORIES.find((c) => c.id === categoryId);

    // Build clean payload without any `undefined` values to satisfy Firestore
    const payload: any = {
      code,
      name: name.trim(),
      categoryId,
      categoryName: cat?.name || "ห้องครัว & ของกิน",
      locationId: locationName || DEFAULT_LOCATIONS[0],
      locationName: locationName || DEFAULT_LOCATIONS[0],
      unit: unit || DEFAULT_UNITS[0],
      quantity: Math.max(0, Number(quantity) || 0),
      minStockLevel: Math.max(0, Number(minStockLevel) || 1),
      targetStockLevel: Math.max(1, Number(targetStockLevel) || 2),
      isInShoppingList: isEditMode
        ? Boolean(initialItem?.isInShoppingList)
        : Number(quantity) <= Number(minStockLevel),
      shoppingQuantity: initialItem?.shoppingQuantity || 1,
    };

    if (isEditMode && initialItem?.id) {
      payload.id = initialItem.id;
    }

    if (brand.trim()) payload.brand = brand.trim();
    if (size.trim()) payload.size = size.trim();
    if (barcode.trim()) payload.barcode = barcode.trim();
    if (priceEstimate !== "" && !isNaN(Number(priceEstimate))) {
      payload.priceEstimate = Number(priceEstimate);
    }
    if (expiryDate.trim()) payload.expiryDate = expiryDate.trim();
    if (notes.trim()) payload.notes = notes.trim();
    if (imageUrl.trim()) payload.images = [imageUrl.trim()];

    await saveMut.mutateAsync(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1E1B18] w-full max-w-lg rounded-3xl border border-[#EADBCE] dark:border-[#38332E] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#171513]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center text-[#C25E40]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                {isEditMode ? "แก้ไขรายการของใช้" : "เพิ่มของใช้ใหม่ในบ้าน"}
              </h2>
              <p className="text-[11px] text-[#8C827A] dark:text-[#A8A199]">
                {isEditMode ? "อัปเดตจำนวนหรือรายละเอียดสินค้า" : "บันทึกของใช้ด่วนใน 3 วินาที หรือถ่ายรูป/สแกน"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EADBCE] dark:hover:bg-[#2A2622] text-[#78716A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Camera & Photo Autofill Bar */}
          <div className="bg-gradient-to-r from-[#FDF4F0] via-[#FAF7F2] to-[#F5ECE3] dark:from-[#261E1A] dark:via-[#1E1B18] dark:to-[#221C18] p-3 rounded-2xl border border-[#EADBCE] dark:border-[#38332E]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#C25E40] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                อ่านค่าอัตโนมัติจากกล้อง / รูปถ่าย
              </span>
              {isScanning && (
                <span className="text-[11px] text-[#C25E40] font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  กำลังอ่าน...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-[#2A2520] hover:bg-[#FDF4F0] dark:hover:bg-[#332B25] border border-[#EADBCE] dark:border-[#403730] rounded-xl text-xs font-semibold text-[#2D2926] dark:text-[#EAE5DF] shadow-xs active:scale-98 transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-[#C25E40]" />
                <span>ถ่ายรูปสินค้า</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImage(file);
                }}
              />

              {/* Photo Album Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-[#2A2520] hover:bg-[#FDF4F0] dark:hover:bg-[#332B25] border border-[#EADBCE] dark:border-[#403730] rounded-xl text-xs font-semibold text-[#2D2926] dark:text-[#EAE5DF] shadow-xs active:scale-98 transition-all disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4 text-[#78716A] dark:text-[#A8A199]" />
                <span>เลือกรูป / บาร์โค้ด</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImage(file);
                }}
              />
            </div>

            {/* Scanning Status Message & Thumbnail */}
            {(scanMessage || imageUrl) && (
              <div className="mt-2.5 pt-2 border-t border-[#EADBCE]/60 dark:border-[#38332E] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  {imageUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#EADBCE] dark:border-[#3D3731] shrink-0 bg-white">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#EADBCE]/50 flex items-center justify-center shrink-0">
                      <Barcode className="w-4 h-4 text-[#78716A]" />
                    </div>
                  )}
                  <p
                    className={`text-xs truncate ${
                      scanMessage?.isSuccess
                        ? "text-emerald-700 dark:text-emerald-400 font-medium"
                        : "text-[#6E675F] dark:text-[#A8A199]"
                    }`}
                  >
                    {scanMessage?.text || "รูปถ่ายสินค้าปัจจุบัน"}
                  </p>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setScanMessage(null);
                    }}
                    className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline shrink-0"
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Preset Chips (For rapid 1-tap fill) */}
          {!isEditMode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#8C827A] dark:text-[#A8A199]">
                  💡 ของใช้ยอดนิยม (แตะเพื่อกรอกทันที):
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {POPULAR_QUICK_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className="shrink-0 px-2.5 py-1 text-xs rounded-full bg-[#FAF7F2] dark:bg-[#25201C] border border-[#EADBCE] dark:border-[#38332E] text-[#544E48] dark:text-[#D5CFC9] hover:border-[#C25E40] hover:text-[#C25E40] active:scale-95 transition-all"
                  >
                    <span>{preset.icon}</span> <span className="font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Field 1: Item Name */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] mb-1">
              ชื่อของใช้ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus={!initialItem}
                placeholder="เช่น น้ำยาล้างจาน ซันไลต์, นมสด, ข้าวสาร"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-sm text-[#2D2926] dark:text-[#FAF7F2] placeholder-[#A8A199] focus:outline-none focus:ring-2 focus:ring-[#C25E40]/30 focus:border-[#C25E40] transition-all font-medium"
              />
              {name.trim().length > 0 && (
                <div className="absolute right-3 top-2.5 text-[10px] text-[#A8A199] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C25E40]" />
                  <span>จัดหมวดหมู่อัตโนมัติ</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Field 2: Room Category (Pill Grid) */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] dark:text-[#FAF7F2] mb-1.5">
              หมวดหมู่ห้อง <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HOME_CATEGORIES.map((cat) => {
                const isActive = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setCategoryManuallyChosen(true);
                    }}
                    className={`px-2.5 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? "border-[#C25E40] bg-[#FDF4F0] dark:bg-[#2C1F1B] text-[#C25E40] font-bold shadow-xs ring-1 ring-[#C25E40]"
                        : "border-[#EADBCE] dark:border-[#332E2A] bg-[#FAF7F2]/60 dark:bg-[#201C19] hover:bg-[#F5EDE3] text-[#544E48] dark:text-[#B5AFA8]"
                    }`}
                  >
                    <span className="text-xs truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Field 3: Quantity Stepper & Unit */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] dark:bg-[#181614] rounded-2xl border border-[#EADBCE] dark:border-[#332E2A]">
            {/* Quantity Stepper */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E675F] dark:text-[#A8A199] mb-1">
                จำนวนคงเหลือปัจจุบัน <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, Number(q) - 1))}
                  className="w-9 h-9 rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#25201C] flex items-center justify-center hover:bg-[#F5ECE3] active:scale-95 text-[#2D2926] dark:text-[#FAF7F2]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center font-bold text-base py-1.5 rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#C25E40]"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Number(q) + 1)}
                  className="w-9 h-9 rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#25201C] flex items-center justify-center hover:bg-[#F5ECE3] active:scale-95 text-[#2D2926] dark:text-[#FAF7F2]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E675F] dark:text-[#A8A199] mb-1">
                หน่วยนับ
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-xs font-semibold text-[#2D2926] dark:text-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#C25E40]"
              >
                {DEFAULT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable Section Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] dark:bg-[#201C19] hover:bg-[#F2ECE1] dark:hover:bg-[#28231F] border border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C25E40]" />
                {showDetails ? "ซ่อนรายละเอียดเพิ่มเติม" : "รายละเอียดเพิ่มเติม (ยี่ห้อ, หมดอายุ, ที่เก็บ, บาร์โค้ด)"}
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expandable Optional Fields */}
          {showDetails && (
            <div className="space-y-3 pt-1 border-t border-dashed border-[#EADBCE] dark:border-[#38332E] animate-in fade-in duration-200">
              {/* Brand & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                    ยี่ห้อ (Brand)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ซันไลต์, แพนทีน, เมจิ"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                    ขนาด / ปริมาณ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 750 ml, แพ็ค 6"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C25E40]" />
                  สถานที่เก็บในบ้าน
                </label>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                >
                  {DEFAULT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-[#C25E40]" />
                  รหัสบาร์โค้ด (Barcode)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 8850002011234"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                />
              </div>

              {/* Stock Alert Levels */}
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-[#FAF7F2] dark:bg-[#181614] rounded-xl border border-[#EADBCE] dark:border-[#332E2A]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                    เตือนเมื่อเหลือ ≤
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 text-center text-xs font-bold rounded-lg border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                    จำนวนที่ควรตุน
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetStockLevel}
                    onChange={(e) => setTargetStockLevel(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 text-center text-xs font-bold rounded-lg border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Price & Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                    ราคาประมาณ (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="เช่น 45"
                    value={priceEstimate}
                    onChange={(e) => setPriceEstimate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C25E40]" />
                    วันหมดอายุ
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                  หมายเหตุ / แหล่งซื้อ
                </label>
                <input
                  type="text"
                  placeholder="เช่น ซื้อที่ Makro หรือ Lotus ถูกกว่า"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C7B8] dark:border-[#403831] bg-white dark:bg-[#1E1B18] text-[#2D2926] dark:text-[#FAF7F2]"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-[#EADBCE] dark:border-[#332E2A]">
            {isEditMode && initialItem ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`คุณต้องการลบ "${initialItem.name}" ออกจากคลังใช่หรือไม่?`)) {
                    await deleteMut.mutateAsync(initialItem.id);
                    onClose();
                  }
                }}
                disabled={deleteMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteMut.isPending ? "กำลังลบ..." : "ลบรายการ"}</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#78716A] dark:text-[#A8A199] hover:bg-[#F2ECE1] dark:hover:bg-[#2A2622] rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saveMut.isPending || !name.trim()}
                className="px-6 py-2.5 text-xs font-bold bg-[#C25E40] hover:bg-[#D96E4C] text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saveMut.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditMode ? "บันทึกการแก้ไข" : "บันทึกของใช้"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
