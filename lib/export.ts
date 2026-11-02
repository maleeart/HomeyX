import { HomeItem } from "@/types";
import { formatNumber, formatCurrency, formatDate } from "./utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportShoppingListExcel(items: HomeItem[]) {
  const data = items.map((item, index) => ({
    "ลำดับ": index + 1,
    "รหัส": item.code,
    "ชื่อของใช้": item.name,
    "หมวดหมู่": item.categoryName || item.categoryId,
    "ที่เก็บในบ้าน": item.locationName || item.locationId,
    "จำนวนที่ต้องซื้อ": item.shoppingQuantity || 1,
    "หน่วยนับ": item.unit,
    "สต๊อกปัจจุบัน": item.quantity,
    "ราคาประมาณ (บาท)": item.priceEstimate || "-",
    "หมายเหตุ": item.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Shopping List");
  XLSX.writeFile(wb, `HomeyX_Shopping_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportInventoryExcel(items: HomeItem[]) {
  const data = items.map((item, index) => ({
    "ลำดับ": index + 1,
    "รหัส": item.code,
    "บาร์โค้ด": item.barcode || "-",
    "ชื่อของใช้": item.name,
    "ยี่ห้อ/ขนาด": `${item.brand || ""} ${item.size || ""}`.trim() || "-",
    "หมวดหมู่": item.categoryName || item.categoryId,
    "สถานที่เก็บ": item.locationName || item.locationId,
    "จำนวนคงเหลือ": item.quantity,
    "หน่วย": item.unit,
    "จุดเตือนซื้อ": item.minStockLevel,
    "ราคาต่อหน่วย": item.priceEstimate || 0,
    "วันหมดอายุ": item.expiryDate || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Inventory");
  XLSX.writeFile(wb, `HomeyX_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function copyShoppingListText(items: HomeItem[]): string {
  const dateStr = formatDate(new Date(), "dd/MM/yyyy");
  let text = `🛒 รายการต้องซื้อเข้าบ้าน (HomeyX) - วันที่ ${dateStr}\n`;
  text += `------------------------------------\n`;

  // Group by room category
  const groups: Record<string, HomeItem[]> = {};
  items.forEach((item) => {
    const cat = item.categoryName || "ทั่วไป";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });

  Object.entries(groups).forEach(([category, catItems]) => {
    text += `\n📍 ${category}\n`;
    catItems.forEach((item, idx) => {
      const qty = item.shoppingQuantity || 1;
      text += `  [ ] ${item.name} (${item.brand ? item.brand + " " : ""}${item.size || ""}) x ${qty} ${item.unit}\n`;
    });
  });

  text += `\n------------------------------------\n`;
  text += `รวมทั้งหมด ${items.length} รายการ`;

  return text;
}
