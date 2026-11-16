import { RoomCategory } from "@/types";

export interface KnownProduct {
  barcode: string;
  name: string;
  brand?: string;
  size?: string;
  categoryId: RoomCategory;
  unit: string;
  locationName: string;
  priceEstimate?: number;
  minStockLevel?: number;
  targetStockLevel?: number;
}

export const KNOWN_THAI_PRODUCTS: Record<string, KnownProduct> = {
  // Kitchen & Food
  "8850002011234": {
    barcode: "8850002011234",
    name: "น้ำยาล้างจาน ซันไลต์ เลมอน",
    brand: "Sunlight",
    size: "750 ml",
    categoryId: "kitchen",
    unit: "ถุง",
    locationName: "ใต้ซิงค์ครัว",
    priceEstimate: 45,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850123456789": {
    barcode: "8850123456789",
    name: "น้ำมันพืช มรกต ปาล์ม",
    brand: "มรกต",
    size: "1 ลิตร",
    categoryId: "kitchen",
    unit: "ขวด",
    locationName: "ตู้กับข้าว",
    priceEstimate: 52,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850157001122": {
    barcode: "8850157001122",
    name: "ข้าวหอมมะลิ ตราฉัตร",
    brand: "ตราฉัตร",
    size: "5 กก.",
    categoryId: "kitchen",
    unit: "ถุง",
    locationName: "ตู้กับข้าว",
    priceEstimate: 195,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850183445566": {
    barcode: "8850183445566",
    name: "นมสด เมจิ รสจืด",
    brand: "Meiji",
    size: "830 ml",
    categoryId: "kitchen",
    unit: "ขวด",
    locationName: "ตู้เย็น / ช่องแช่แข็ง",
    priceEstimate: 46,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850329112233": {
    barcode: "8850329112233",
    name: "ไข่ไก่สด ซีพี เบอร์ 2",
    brand: "CP",
    size: "แพ็ค 10 ฟอง",
    categoryId: "kitchen",
    unit: "แพ็ค",
    locationName: "ตู้เย็น / ช่องแช่แข็ง",
    priceEstimate: 59,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850125001122": {
    barcode: "8850125001122",
    name: "ปลากระป๋อง สามแม่ครัว",
    brand: "สามแม่ครัว",
    size: "155 กรัม",
    categoryId: "kitchen",
    unit: "กระป๋อง",
    locationName: "ตู้กับข้าว",
    priceEstimate: 22,
    minStockLevel: 2,
    targetStockLevel: 4,
  },

  // Bathroom & Personal Care
  "8850029001122": {
    barcode: "8850029001122",
    name: "แชมพู แพนทีน เดลี่ มอยส์เจอร์",
    brand: "Pantene",
    size: "410 ml",
    categoryId: "bathroom",
    unit: "ขวด",
    locationName: "ชั้นวางห้องน้ำ",
    priceEstimate: 149,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8851759002233": {
    barcode: "8851759002233",
    name: "สบู่ก้อน โพรเทคส์ ไอซ์ซี่คูล",
    brand: "Protex",
    size: "แพ็ค 4 ก้อน",
    categoryId: "bathroom",
    unit: "แพ็ค",
    locationName: "ชั้นวางห้องน้ำ",
    priceEstimate: 62,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850092112233": {
    barcode: "8850092112233",
    name: "ยาสีฟัน คอลเกต รสยอดนิยม",
    brand: "Colgate",
    size: "150 กรัม",
    categoryId: "bathroom",
    unit: "หลอด",
    locationName: "ใต้อ่างล้างหน้า",
    priceEstimate: 59,
    minStockLevel: 1,
    targetStockLevel: 2,
  },

  // Cleaning & Laundry
  "8850006345678": {
    barcode: "8850006345678",
    name: "ผงซักฟอก บรีส เอกเซล",
    brand: "Breeze",
    size: "1400 กรัม",
    categoryId: "cleaning",
    unit: "ถุง",
    locationName: "มุมเครื่องซักผ้า",
    priceEstimate: 129,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850188223344": {
    barcode: "8850188223344",
    name: "น้ำยาปรับผ้านุ่ม คอมฟอร์ท อัลตร้า",
    brand: "Comfort",
    size: "500 ml",
    categoryId: "cleaning",
    unit: "ถุง",
    locationName: "มุมเครื่องซักผ้า",
    priceEstimate: 49,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850172334455": {
    barcode: "8850172334455",
    name: "กระดาษทิชชู่ สก๊อตต์ ซีเล็คท์",
    brand: "Scott",
    size: "แพ็ค 6 ม้วน",
    categoryId: "cleaning",
    unit: "แพ็ค",
    locationName: "ตู้เก็บของใต้บันได",
    priceEstimate: 89,
    minStockLevel: 1,
    targetStockLevel: 2,
  },
  "8850389221133": {
    barcode: "8850389221133",
    name: "น้ำยาล้างห้องน้ำ เป็ดโปร สีม่วง",
    brand: "Duck",
    size: "900 ml",
    categoryId: "cleaning",
    unit: "ขวด",
    locationName: "ตู้เก็บอุปกรณ์ทำความสะอาด",
    priceEstimate: 62,
    minStockLevel: 1,
    targetStockLevel: 2,
  },

  // Medicine
  "8850987112233": {
    barcode: "8850987112233",
    name: "ยาพาราเซตามอล ซาร่า 500 มก.",
    brand: "Sara",
    size: "แผง 10 เม็ด",
    categoryId: "medicine",
    unit: "แผง",
    locationName: "ตู้ยาประจำบ้าน",
    priceEstimate: 15,
    minStockLevel: 1,
    targetStockLevel: 3,
  },
};

/**
 * Common quick-pick items for instant 1-tap autofill
 */
export const POPULAR_QUICK_PRESETS = [
  { icon: "🧽", name: "น้ำยาล้างจาน ซันไลต์", categoryId: "kitchen" as RoomCategory, unit: "ถุง", locationName: "ใต้ซิงค์ครัว" },
  { icon: "🧴", name: "แชมพู แพนทีน", categoryId: "bathroom" as RoomCategory, unit: "ขวด", locationName: "ชั้นวางห้องน้ำ" },
  { icon: "🧼", name: "ผงซักฟอก บรีส เอกเซล", categoryId: "cleaning" as RoomCategory, unit: "ถุง", locationName: "มุมเครื่องซักผ้า" },
  { icon: "🌸", name: "น้ำยาปรับผ้านุ่ม คอมฟอร์ท", categoryId: "cleaning" as RoomCategory, unit: "ถุง", locationName: "มุมเครื่องซักผ้า" },
  { icon: "🧻", name: "กระดาษทิชชู่ ม้วน", categoryId: "cleaning" as RoomCategory, unit: "แพ็ค", locationName: "ตู้เก็บของใต้บันได" },
  { icon: "🍚", name: "ข้าวสาร หอมมะลิ", categoryId: "kitchen" as RoomCategory, unit: "ถุง", locationName: "ตู้กับข้าว" },
  { icon: "🥚", name: "ไข่ไก่สด", categoryId: "kitchen" as RoomCategory, unit: "แพ็ค", locationName: "ตู้เย็น / ช่องแช่แข็ง" },
  { icon: "🛢️", name: "น้ำมันพืช ปาล์ม/ถั่วเหลือง", categoryId: "kitchen" as RoomCategory, unit: "ขวด", locationName: "ตู้กับข้าว" },
  { icon: "🥛", name: "นมสด เมจิ รสจืด", categoryId: "kitchen" as RoomCategory, unit: "ขวด", locationName: "ตู้เย็น / ช่องแช่แข็ง" },
  { icon: "🪥", name: "ยาสีฟัน คอลเกต", categoryId: "bathroom" as RoomCategory, unit: "หลอด", locationName: "ใต้อ่างล้างหน้า" },
  { icon: "🧼", name: "สบู่ก้อน โพรเทคส์", categoryId: "bathroom" as RoomCategory, unit: "ก้อน", locationName: "ชั้นวางห้องน้ำ" },
  { icon: "🚽", name: "น้ำยาล้างห้องน้ำ เป็ดโปร", categoryId: "cleaning" as RoomCategory, unit: "ขวด", locationName: "ตู้เก็บอุปกรณ์ทำความสะอาด" },
  { icon: "💊", name: "ยาพาราเซตามอล ซาร่า", categoryId: "medicine" as RoomCategory, unit: "แผง", locationName: "ตู้ยาประจำบ้าน" },
];

/**
 * Intelligent category and unit inference from item name
 */
export function inferCategoryAndUnitFromName(name: string): {
  categoryId: RoomCategory;
  unit: string;
  locationName: string;
} {
  const lower = name.toLowerCase();

  // 1. Kitchen & Pantry
  if (
    lower.includes("น้ำยาล้างจาน") ||
    lower.includes("ซันไลต์") ||
    lower.includes("จาน")
  ) {
    return { categoryId: "kitchen", unit: "ถุง", locationName: "ใต้ซิงค์ครัว" };
  }
  if (
    lower.includes("น้ำมัน") ||
    lower.includes("น้ำปลา") ||
    lower.includes("ซีอิ๊ว") ||
    lower.includes("ซอส") ||
    lower.includes("น้ำตาล") ||
    lower.includes("เกลือ")
  ) {
    return { categoryId: "kitchen", unit: "ขวด", locationName: "ตู้กับข้าว" };
  }
  if (
    lower.includes("ข้าว") ||
    lower.includes("มาม่า") ||
    lower.includes("บะหมี่") ||
    lower.includes("กาแฟ") ||
    lower.includes("โอวัลติน")
  ) {
    return { categoryId: "kitchen", unit: "ถุง", locationName: "ตู้กับข้าว" };
  }
  if (
    lower.includes("นม") ||
    lower.includes("ไข่") ||
    lower.includes("เนย") ||
    lower.includes("ชีส") ||
    lower.includes("โยเกิร์ต") ||
    lower.includes("ผัก") ||
    lower.includes("หมู") ||
    lower.includes("ไก่")
  ) {
    return { categoryId: "kitchen", unit: lower.includes("ไข่") ? "แพ็ค" : "ขวด", locationName: "ตู้เย็น / ช่องแช่แข็ง" };
  }

  // 2. Bathroom & Personal Care
  if (
    lower.includes("แชมพู") ||
    lower.includes("ยาสระผม") ||
    lower.includes("ครีมนวด") ||
    lower.includes("สบู่เหลว") ||
    lower.includes("ครีมอาบน้ำ") ||
    lower.includes("โฟมล้างหน้า")
  ) {
    return { categoryId: "bathroom", unit: "ขวด", locationName: "ชั้นวางห้องน้ำ" };
  }
  if (lower.includes("ยาสีฟัน") || lower.includes("โฟม")) {
    return { categoryId: "bathroom", unit: "หลอด", locationName: "ใต้อ่างล้างหน้า" };
  }
  if (lower.includes("สบู่")) {
    return { categoryId: "bathroom", unit: "ก้อน", locationName: "ชั้นวางห้องน้ำ" };
  }
  if (lower.includes("แปรงสีฟัน") || lower.includes("มีดโกน")) {
    return { categoryId: "bathroom", unit: "ด้าม", locationName: "ชั้นวางห้องน้ำ" };
  }

  // 3. Cleaning & Laundry
  if (lower.includes("ผงซักฟอก") || lower.includes("ปรับผ้านุ่ม") || lower.includes("ไฮเตอร์")) {
    return { categoryId: "cleaning", unit: "ถุง", locationName: "มุมเครื่องซักผ้า" };
  }
  if (lower.includes("ทิชชู่") || lower.includes("กระดาษชำระ")) {
    return { categoryId: "cleaning", unit: "ม้วน", locationName: "ตู้เก็บของใต้บันได" };
  }
  if (lower.includes("ล้างห้องน้ำ") || lower.includes("เป็ด") || lower.includes("ถูพื้น") || lower.includes("กระจก")) {
    return { categoryId: "cleaning", unit: "ขวด", locationName: "ตู้เก็บอุปกรณ์ทำความสะอาด" };
  }
  if (lower.includes("ถุงขยะ") || lower.includes("ฟองน้ำ") || lower.includes("สก๊อตไบรต์")) {
    return { categoryId: "cleaning", unit: "แพ็ค", locationName: "ตู้เก็บอุปกรณ์ทำความสะอาด" };
  }

  // 4. Medicine
  if (
    lower.includes("ยา") ||
    lower.includes("พารา") ||
    lower.includes("ซาร่า") ||
    lower.includes("ไทลินอล") ||
    lower.includes("แก้แพ้") ||
    lower.includes("แก้ไอ") ||
    lower.includes("พลาสเตอร์") ||
    lower.includes("เบตาดีน") ||
    lower.includes("แอลกอฮอล์")
  ) {
    return { categoryId: "medicine", unit: lower.includes("แอลกอฮอล์") ? "ขวด" : "แผง", locationName: "ตู้ยาประจำบ้าน" };
  }

  // 5. Living & Bedroom
  if (lower.includes("ถ่าน") || lower.includes("แบต") || lower.includes("หลอดไฟ")) {
    return { categoryId: "living", unit: "แพ็ค", locationName: "ตู้เก็บของใต้บันได" };
  }

  // Default fallback
  return { categoryId: "kitchen", unit: "ชิ้น", locationName: "ตู้กับข้าว" };
}

/**
 * Compress an image file to a small base64 DataURL (max 600px width/height)
 */
export async function compressImageToDataUrl(file: File, maxDim = 600, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Scan barcode from an image file using html5-qrcode
 */
export async function scanBarcodeFromFile(file: File): Promise<string | null> {
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const scannerId = `temp-scanner-${Date.now()}`;
    const div = document.createElement("div");
    div.id = scannerId;
    div.style.display = "none";
    document.body.appendChild(div);

    const html5QrCode = new Html5Qrcode(scannerId);
    try {
      const decodedText = await html5QrCode.scanFile(file, false);
      html5QrCode.clear();
      document.body.removeChild(div);
      return decodedText.trim();
    } catch {
      html5QrCode.clear();
      document.body.removeChild(div);
      return null;
    }
  } catch (err) {
    console.warn("Scan barcode from file error:", err);
    return null;
  }
}
