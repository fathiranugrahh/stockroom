import type { StockTrendPoint } from "@/lib/api";

export interface PreviewProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
}

export const previewProducts: PreviewProduct[] = [
  { id: "p1", name: "Wireless Mouse", sku: "ELEC-MOUSE-001", category: "Electronics", price: 150000, stock: 8, minStock: 10 },
  { id: "p2", name: "Kopi Bubuk 250g", sku: "GROC-KOPI-014", category: "Groceries", price: 32000, stock: 4, minStock: 12 },
  { id: "p3", name: "A4 Paper Ream", sku: "OFFC-PAPR-001", category: "Office", price: 55000, stock: 6, minStock: 8 },
  { id: "p4", name: "Cotton T-Shirt", sku: "APRL-TSHT-001", category: "Apparel", price: 85000, stock: 150, minStock: 40 },
  { id: "p5", name: "Cooking Oil 2L", sku: "GROC-OIL-002", category: "Groceries", price: 42000, stock: 63, minStock: 20 },
  { id: "p6", name: "Non-stick Pan", sku: "HOME-PAN-001", category: "Home", price: 180000, stock: 22, minStock: 8 },
];

export interface PreviewMovement {
  id: string;
  product: string;
  type: "IN" | "OUT";
  quantity: number;
  when: string;
}

export const previewMovements: PreviewMovement[] = [
  { id: "m1", product: "Cotton T-Shirt", type: "OUT", quantity: 20, when: "10:24" },
  { id: "m2", product: "Cooking Oil 2L", type: "IN", quantity: 48, when: "09:03" },
  { id: "m3", product: "Non-stick Pan", type: "OUT", quantity: 5, when: "Yesterday" },
];

// 14-day in/out trend (believable small-business volume).
export const previewTrend: StockTrendPoint[] = [
  { date: "2026-06-23", in: 0, out: 12 },
  { date: "2026-06-24", in: 40, out: 8 },
  { date: "2026-06-25", in: 0, out: 22 },
  { date: "2026-06-26", in: 60, out: 15 },
  { date: "2026-06-27", in: 0, out: 30 },
  { date: "2026-06-28", in: 24, out: 10 },
  { date: "2026-06-29", in: 0, out: 6 },
  { date: "2026-06-30", in: 90, out: 18 },
  { date: "2026-07-01", in: 0, out: 26 },
  { date: "2026-07-02", in: 48, out: 14 },
  { date: "2026-07-03", in: 12, out: 33 },
  { date: "2026-07-04", in: 0, out: 20 },
  { date: "2026-07-05", in: 150, out: 41 },
  { date: "2026-07-06", in: 20, out: 9 },
];

export const previewCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
