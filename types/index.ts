// ============================================================
// HOMEYX - Core TypeScript Types
// ============================================================

export type RoomCategory =
  | "kitchen"       // ห้องครัว & ของกิน
  | "bathroom"      // ห้องน้ำ & ดูแลร่างกาย
  | "cleaning"      // ซักล้าง & ทำความสะอาด
  | "living"        // ห้องนอน & ห้องนั่งเล่น
  | "medicine"      // ยา & ปฐมพยาบาล
  | "general";      // ของใช้ทั่วไป

export interface CategoryInfo {
  id: RoomCategory;
  name: string;
  nameEn: string;
  icon: string;
  color: string;      // Badge accent color
  bgLight: string;
  prefix: string;
}

export type ItemStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface HomeItem {
  id: string;
  code: string;            // e.g. KIT-0001, BAT-0002
  barcode?: string;         // EAN-13, UPC barcode on product package
  name: string;            // e.g. "น้ำยาล้างจาน ซันไลต์ เลมอน"
  brand?: string;          // e.g. "Sunlight"
  size?: string;           // e.g. "750 ml"
  categoryId: RoomCategory;
  categoryName?: string;
  locationId: string;      // e.g. "ใต้ซิงค์ครัว", "ชั้นวางห้องน้ำ"
  locationName?: string;
  unit: string;            // ขวด, ถุง, ก้อน, ซอง, กล่อง, ม้วน, หลอด, ชิ้น
  quantity: number;        // จำนวนคงเหลือปัจจุบัน
  minStockLevel: number;   // จุดสั่งซื้อซ้ำ (เมื่อ quantity <= minStockLevel -> แจ้งเตือน)
  targetStockLevel?: number; // จำนวนสต๊อกที่ควรมี (เช่น ปกติตุนไว้ 3 ชิ้น)
  priceEstimate?: number;  // ราคาประมาณการต่อชิ้น (บาท)
  expiryDate?: string;     // YYYY-MM-DD
  images?: string[];
  notes?: string;
  // Shopping list status
  isInShoppingList?: boolean;
  shoppingQuantity?: number; // จำนวนที่ต้องการซื้อเพิ่ม
  isPurchased?: boolean;     // ติ๊กซื้อแล้วในโหมดช้อปปิ้ง
  // Audit & timestamps
  lastRestockedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | "consume"      // ใช้ไป / ตัดสต๊อก
  | "restock"      // ซื้อมาเติม / รับเข้า
  | "adjust"       // ปรับยอดตรวจนับ
  | "initial";     // สร้างรายการเริ่มต้น

export interface StockMovement {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: MovementType;
  quantityBefore: number;
  quantityChange: number; // -1, +2, etc.
  quantityAfter: number;
  unit?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface HomeyUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  householdName?: string;
  role: "owner" | "member";
}

export interface HouseholdRoomLocation {
  id: string;
  name: string;
  category: RoomCategory;
  description?: string;
}
