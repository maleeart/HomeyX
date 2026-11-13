"use client";

import { useState, useEffect } from "react";
import { X, Package, Plus, Sparkles, Barcode, Trash2 } from "lucide-react";
import { HomeItem, RoomCategory } from "@/types";
import { HOME_CATEGORIES, DEFAULT_UNITS, DEFAULT_LOCATIONS } from "@/lib/constants";
import { generateItemCode } from "@/lib/utils";
import { useHomeItems, useSaveHomeItem, useDeleteHomeItem } from "@/hooks/useHomeInventory";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  initialItem?: HomeItem | null;
}

export function AddItemModal({ open, onClose, initialItem }: AddItemModalProps) {
  const { data: items = [] } = useHomeItems();
  const saveMut = useSaveHomeItem();
  const deleteMut = useDeleteHomeItem();

  const [categoryId, setCategoryId] = useState<RoomCategory>("kitchen");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [barcode, setBarcode] = useState("");
  const [locationName, setLocationName] = useState(DEFAULT_LOCATIONS[0]);
  const [unit, setUnit] = useState(DEFAULT_UNITS[0]);
  const [quantity, setQuantity] = useState(1);
  const [minStockLevel, setMinStockLevel] = useState(1);
  const [targetStockLevel, setTargetStockLevel] = useState(2);
  const [priceEstimate, setPriceEstimate] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (initialItem) {
      setCategoryId(initialItem.categoryId);
      setName(initialItem.name);
      setBrand(initialItem.brand || "");
      setSize(initialItem.size || "");
      setBarcode(initialItem.barcode || "");
      setLocationName(initialItem.locationName || initialItem.locationId || DEFAULT_LOCATIONS[0]);
      setUnit(initialItem.unit || DEFAULT_UNITS[0]);
      setQuantity(initialItem.quantity);
      setMinStockLevel(initialItem.minStockLevel);
      setTargetStockLevel(initialItem.targetStockLevel || initialItem.minStockLevel + 1);
      setPriceEstimate(initialItem.priceEstimate);
      setExpiryDate(initialItem.expiryDate || "");
      setNotes(initialItem.notes || "");
      setImageUrl(initialItem.images?.[0] || "");
    } else {
      setName("");
      setBrand("");
      setSize("");
      setBarcode("");
      setQuantity(1);
      setMinStockLevel(1);
      setTargetStockLevel(2);
      setPriceEstimate(undefined);
      setExpiryDate("");
      setNotes("");
      setImageUrl("");
    }
  }, [initialItem, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const existingCodes = items.map((i) => i.code);
    const code = initialItem ? initialItem.code : generateItemCode(categoryId, existingCodes);
    const cat = HOME_CATEGORIES.find((c) => c.id === categoryId);

    await saveMut.mutateAsync({
      ...(initialItem ? { id: initialItem.id } : {}),
      code,
      name: name.trim(),
      brand: brand.trim() || undefined,
      size: size.trim() || undefined,
      barcode: barcode.trim() || undefined,
      categoryId,
      categoryName: cat?.name || "ห้องครัว & ของกิน",
      locationId: locationName,
      locationName,
      unit,
      quantity: Number(quantity),
      minStockLevel: Number(minStockLevel),
      targetStockLevel: Number(targetStockLevel),
      priceEstimate: priceEstimate ? Number(priceEstimate) : undefined,
      expiryDate: expiryDate || undefined,
      notes: notes.trim() || undefined,
      images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      isInShoppingList: initialItem?.isInShoppingList || Number(quantity) <= Number(minStockLevel),
      shoppingQuantity: initialItem?.shoppingQuantity || 1,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1E1B18] w-full max-w-lg rounded-3xl border border-[#EADBCE] dark:border-[#38332E] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#171513]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center text-[#C25E40]">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#2D2926] dark:text-[#FAF7F2]">
              {initialItem ? "แก้ไขรายการของใช้" : "เพิ่มของใช้ใหม่ในบ้าน"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EADBCE] dark:hover:bg-[#2A2622] text-[#78716A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Room Category */}
          <div>
            <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1.5">
              หมวดหมู่ห้อง / ลักษณะการใช้งาน *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HOME_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-2 text-xs rounded-xl border text-left transition-all ${
                    categoryId === cat.id
                      ? "border-[#C25E40] bg-[#FDF4F0] dark:bg-[#2C1F1B] text-[#C25E40] font-semibold ring-1 ring-[#C25E40]"
                      : "border-[#EADBCE] dark:border-[#332E2A] hover:bg-[#FAF7F2] text-[#544E48] dark:text-[#B5AFA8]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Brand */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                ชื่อของใช้ *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น น้ำยาล้างจาน, สบู่, ข้าวสาร"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                  ยี่ห้อ (Brand)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ซันไลต์, มาม่า"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="input-field"
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
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1 flex items-center justify-between">
              <span>บาร์โค้ดบนบรรจุภัณฑ์ (Barcode)</span>
              <span className="text-[10px] text-[#A8A199] font-normal">สำหรับสแกนด้วยกล้อง</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="เช่น 8850002011234"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="input-field pl-9"
              />
              <Barcode className="w-4 h-4 text-[#A8A199] absolute left-3 top-3" />
            </div>
          </div>

          {/* Location & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                สถานที่เก็บในบ้าน
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="input-field"
              >
                {DEFAULT_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                หน่วยนับ
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-field"
              >
                {DEFAULT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Stock Levels */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF7F2] dark:bg-[#171513] rounded-2xl border border-[#EADBCE] dark:border-[#332E2A]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                จำนวนคงเหลือ *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input-field text-center font-bold text-base"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                เตือนเมื่อเหลือ ≤
              </label>
              <input
                type="number"
                min="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="input-field text-center"
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
                onChange={(e) => setTargetStockLevel(Number(e.target.value))}
                className="input-field text-center"
              />
            </div>
          </div>

          {/* Price & Expiry Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                ราคาต่อชิ้นโดยประมาณ (บาท)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="เช่น 45"
                value={priceEstimate ?? ""}
                onChange={(e) => setPriceEstimate(e.target.value ? Number(e.target.value) : undefined)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
                วันหมดอายุ (ถ้ามี)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Product Photo */}
          <div>
            <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
              รูปภาพสินค้า (URL หรืออัปโหลดไฟล์)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="วาง URL รูปภาพ (เช่น https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field text-xs flex-1"
              />
              <label className="px-3 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-[#2A2622] border border-[#EADBCE] dark:border-[#38332E] rounded-xl hover:bg-[#EADBCE] cursor-pointer shrink-0">
                เลือกรูป
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setImageUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EADBCE] bg-[#FAF7F2] shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs text-rose-600 hover:underline"
                >
                  ลบรูปนี้
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#6E675F] dark:text-[#A8A199] mb-1">
              หมายเหตุ / แหล่งที่ซื้อ
            </label>
            <input
              type="text"
              placeholder="เช่น ซื้อที่ Makro หรือ Lotus ถูกกว่า"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#EADBCE] dark:border-[#332E2A]">
            {initialItem ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`คุณต้องการลบ "${initialItem.name}" ออกจากระบบใช่หรือไม่?`)) {
                    await deleteMut.mutateAsync(initialItem.id);
                    onClose();
                  }
                }}
                disabled={deleteMut.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteMut.isPending ? "กำลังลบ..." : "ลบรายการนี้"}</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#78716A] dark:text-[#A8A199] hover:bg-[#F2ECE1] dark:hover:bg-[#2A2622] rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saveMut.isPending}
                className="px-5 py-2 text-xs font-bold bg-[#C25E40] hover:bg-[#D96E4C] text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {saveMut.isPending ? "กำลังบันทึก..." : initialItem ? "บันทึกการแก้ไข" : "เพิ่มของใช้"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
