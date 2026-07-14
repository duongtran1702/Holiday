import { PermSet, StaffMember } from "../types/index";

export const PRODUCTS = [
  {
    id: "p1", name: "Áo Polo Atmin Classic", category: "Áo", price: 280000,
    material: "Cotton piqué 100%", rating: 4.7, reviews: 128,
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop&auto=format",
    stock: { "S-Trắng": 15, "M-Trắng": 22, "L-Trắng": 18, "XL-Trắng": 10, "XXL-Trắng": 5, "S-Đen": 12, "M-Đen": 30, "L-Đen": 25, "XL-Đen": 14, "XXL-Đen": 8, "S-Xanh Navy": 8, "M-Xanh Navy": 15, "L-Xanh Navy": 20, "XL-Xanh Navy": 10, "XXL-Xanh Navy": 3, "S-Xám": 10, "M-Xám": 18, "L-Xám": 12, "XL-Xám": 7, "XXL-Xám": 2 },
    badge: "Bán chạy",
  }
];

export const REVENUE_DATA = [
  { month: "T1", b2c: 48, b2b: 120 }, { month: "T2", b2c: 62, b2b: 98 },
  { month: "T3", b2c: 55, b2b: 140 }, { month: "T4", b2c: 78, b2b: 165 },
  { month: "T5", b2c: 91, b2b: 188 }, { month: "T6", b2c: 84, b2b: 210 },
  { month: "T7", b2c: 110, b2b: 245 },
];

export const ORDERS_DATA = [
  { id: "ORD-2024-001", customer: "Nguyễn Văn Minh", type: "B2C", status: "Đã giao", amount: 840000, date: "08/07/2026", items: 3 }
];

export const AGENTS_DATA = [
  { id: "AG-001", name: "Cty TNHH Holiday Fashion", contact: "0901 234 567", credit: 50000000, used: 13500000, status: "Hoạt động", orders: 42 }
];

export const PRICING_TIERS = [
  { tier: 1, min: 1, max: 9, price: 280000, discount: 0, label: "Giá lẻ" },
  { tier: 2, min: 10, max: 49, price: 210000, discount: 25, label: "Sỉ cơ bản" },
  { tier: 3, min: 50, max: 99, price: 168000, discount: 40, label: "Sỉ trung" },
  { tier: 4, min: 100, max: Infinity, price: 140000, discount: 50, label: "Sỉ đại" },
];

export const PERMISSION_MODULES = [
  { key: "products", label: "Quản lý Sản phẩm", actions: ["view", "create", "update", "delete"] as const },
  { key: "inventory", label: "Quản lý Tồn kho", actions: ["view", "create", "update"] as const },
  { key: "orders", label: "Quản lý Đơn hàng B2C & B2B", actions: ["view", "create", "update", "delete"] as const },
  { key: "agents", label: "Quản lý Đại lý & Duyệt hồ sơ", actions: ["view", "create", "update", "delete"] as const },
  { key: "debts", label: "Quản lý Công nợ", actions: ["view", "update"] as const },
  { key: "promotions", label: "Tạo Mã Khuyến mãi (Voucher)", actions: ["view", "create", "update", "delete"] as const },
  { key: "reports", label: "Báo cáo Thống kê & Doanh thu", actions: ["view"] as const },
  { key: "inbox", label: "Hỗ trợ Khách hàng (Live Chat)", actions: ["view", "create"] as const },
];

export const defaultPerms = (): PermSet =>
  Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, Object.fromEntries(m.actions.map((a) => [a, false]))]));

export const STAFF_PRESETS: Record<string, PermSet> = {
  "Kế toán": { ...defaultPerms(), debts: { view: true, update: true }, reports: { view: true } },
  "Nhân viên Kho": { ...defaultPerms(), inventory: { view: true, create: true, update: true }, orders: { view: true, create: false, update: true, delete: false } },
  "Sales": { ...defaultPerms(), orders: { view: true, create: true, update: true, delete: false }, agents: { view: true, create: false, update: true, delete: false }, promotions: { view: true, create: true, update: true, delete: false }, inbox: { view: true, create: true } },
};

export const INITIAL_STAFF: StaffMember[] = [];