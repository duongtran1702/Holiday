import { useState, useMemo, useRef, useEffect } from "react";
import {
  ShoppingCart, Search, User, Star, X, Plus, Minus, Package,
  Users, FileText, Tag, BarChart3, CheckCircle,
  Clock, ChevronRight, Filter,
  Eye, Edit, Trash2, Bell, ShoppingBag, CreditCard,
  AlertTriangle, DollarSign, Download, Camera,
  Lock, LogOut, Settings, ArrowRight, Zap,
  TrendingUp, Circle, ChevronDown, Building2, Phone,
  Mail, KeyRound, Shield, ShieldCheck, AlertCircle,
  UserPlus, Smartphone, RefreshCw, RotateCcw,
  SquareCheckBig, CheckSquare, Square, Save, Info,
  MessageCircle, Send, Paperclip, Headphones,
  ArrowLeft, MoreHorizontal, TagIcon, UserCheck,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AppScreen = "auth-login" | "auth-register" | "app";
type AuthRole = "customer" | "agent" | "admin" | "staff" | null;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: "p1", name: "Áo Polo ABC Classic", category: "Áo", price: 280000,
    material: "Cotton piqué 100%", rating: 4.7, reviews: 128,
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop&auto=format",
    stock: { "S-Trắng": 15, "M-Trắng": 22, "L-Trắng": 18, "XL-Trắng": 10, "XXL-Trắng": 5, "S-Đen": 12, "M-Đen": 30, "L-Đen": 25, "XL-Đen": 14, "XXL-Đen": 8, "S-Xanh Navy": 8, "M-Xanh Navy": 15, "L-Xanh Navy": 20, "XL-Xanh Navy": 10, "XXL-Xanh Navy": 3, "S-Xám": 10, "M-Xám": 18, "L-Xám": 12, "XL-Xám": 7, "XXL-Xám": 2 },
    badge: "Bán chạy",
  },
  {
    id: "p2", name: "Đầm Floral Summer", category: "Đầm/Váy", price: 490000,
    material: "Vải lụa viscose, họa tiết hoa", rating: 4.9, reviews: 87,
    colors: ["Hồng Pastel", "Xanh Mint", "Vàng Chanh"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop&auto=format",
    stock: { "XS-Hồng Pastel": 5, "S-Hồng Pastel": 12, "M-Hồng Pastel": 8, "L-Hồng Pastel": 4, "XS-Xanh Mint": 6, "S-Xanh Mint": 10, "M-Xanh Mint": 9, "L-Xanh Mint": 3, "XS-Vàng Chanh": 4, "S-Vàng Chanh": 7, "M-Vàng Chanh": 5, "L-Vàng Chanh": 2 },
    badge: "Mới",
  },
  {
    id: "p3", name: "Quần Jeans Slim Fit", category: "Quần", price: 420000,
    material: "Denim cotton stretch 98%", rating: 4.5, reviews: 203,
    colors: ["Xanh Indigo", "Đen", "Xám nhạt"],
    sizes: ["28", "29", "30", "31", "32", "34"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&auto=format",
    stock: { "28-Xanh Indigo": 8, "29-Xanh Indigo": 15, "30-Xanh Indigo": 20, "31-Xanh Indigo": 12, "32-Xanh Indigo": 9, "34-Xanh Indigo": 4, "28-Đen": 6, "29-Đen": 12, "30-Đen": 18, "31-Đen": 10, "32-Đen": 7, "34-Đen": 3, "28-Xám nhạt": 5, "29-Xám nhạt": 8, "30-Xám nhạt": 10, "31-Xám nhạt": 6, "32-Xám nhạt": 4, "34-Xám nhạt": 2 },
    badge: null,
  },
  {
    id: "p4", name: "Áo Sơ Mi Linen Premium", category: "Áo", price: 360000,
    material: "Linen tự nhiên 100%, thoáng mát", rating: 4.6, reviews: 64,
    colors: ["Trắng kem", "Xanh da trời", "Be nhạt"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=700&fit=crop&auto=format",
    stock: { "S-Trắng kem": 12, "M-Trắng kem": 20, "L-Trắng kem": 15, "XL-Trắng kem": 8, "S-Xanh da trời": 9, "M-Xanh da trời": 16, "L-Xanh da trời": 11, "XL-Xanh da trời": 5, "S-Be nhạt": 7, "M-Be nhạt": 13, "L-Be nhạt": 9, "XL-Be nhạt": 4 },
    badge: "Premium",
  },
  {
    id: "p5", name: "Váy Maxi Boho", category: "Đầm/Váy", price: 550000,
    material: "Chiffon mỏng, thoáng mát", rating: 4.8, reviews: 42,
    colors: ["Đỏ gạch", "Olive", "Trắng"],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=700&fit=crop&auto=format",
    stock: { "XS-Đỏ gạch": 4, "S-Đỏ gạch": 8, "M-Đỏ gạch": 10, "L-Đỏ gạch": 6, "XL-Đỏ gạch": 3, "XS-Olive": 5, "S-Olive": 9, "M-Olive": 11, "L-Olive": 7, "XL-Olive": 2, "XS-Trắng": 3, "S-Trắng": 7, "M-Trắng": 8, "L-Trắng": 5, "XL-Trắng": 1 },
    badge: null,
  },
  {
    id: "p6", name: "Áo Khoác Bomber Unisex", category: "Áo", price: 680000,
    material: "Polyester cao cấp, lớp lót ấm", rating: 4.4, reviews: 31,
    colors: ["Đen", "Xanh lục quân", "Nâu camel"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=700&fit=crop&auto=format",
    stock: { "S-Đen": 10, "M-Đen": 18, "L-Đen": 14, "XL-Đen": 9, "XXL-Đen": 4, "S-Xanh lục quân": 6, "M-Xanh lục quân": 12, "L-Xanh lục quân": 10, "XL-Xanh lục quân": 5, "XXL-Xanh lục quân": 2, "S-Nâu camel": 5, "M-Nâu camel": 9, "L-Nâu camel": 7, "XL-Nâu camel": 3, "XXL-Nâu camel": 1 },
    badge: "Mới",
  },
];

const REVENUE_DATA = [
  { month: "T1", b2c: 48, b2b: 120 }, { month: "T2", b2c: 62, b2b: 98 },
  { month: "T3", b2c: 55, b2b: 140 }, { month: "T4", b2c: 78, b2b: 165 },
  { month: "T5", b2c: 91, b2b: 188 }, { month: "T6", b2c: 84, b2b: 210 },
  { month: "T7", b2c: 110, b2b: 245 },
];

const ORDERS_DATA = [
  { id: "ORD-2024-001", customer: "Nguyễn Văn Minh", type: "B2C", status: "Đã giao", amount: 840000, date: "08/07/2026", items: 3 },
  { id: "ORD-2024-002", customer: "Cty TNHH ATMIN Fashion", type: "B2B", status: "Đang xử lý", amount: 13500000, date: "08/07/2026", items: 135 },
  { id: "ORD-2024-003", customer: "Trần Thị Hoa", type: "B2C", status: "Đang giao", amount: 490000, date: "07/07/2026", items: 1 },
  { id: "ORD-2024-004", customer: "Đại lý Phương Nam", type: "B2B", status: "Chờ duyệt", amount: 6000000, date: "07/07/2026", items: 60 },
  { id: "ORD-2024-005", customer: "Lê Minh Tuấn", type: "B2C", status: "Hoàn thành", amount: 1120000, date: "06/07/2026", items: 4 },
  { id: "ORD-2024-006", customer: "Shop Thời Trang Miền Tây", type: "B2B", status: "Đã hủy", amount: 4500000, date: "05/07/2026", items: 45 },
];

const AGENTS_DATA = [
  { id: "AG-001", name: "Cty TNHH ATMIN Fashion", contact: "0901 234 567", credit: 50000000, used: 13500000, status: "Hoạt động", orders: 42 },
  { id: "AG-002", name: "Đại lý Phương Nam", contact: "0912 345 678", credit: 30000000, used: 6000000, status: "Hoạt động", orders: 28 },
  { id: "AG-003", name: "Shop Miền Tây Fashion", contact: "0923 456 789", credit: 20000000, used: 20000000, status: "Vượt hạn mức", orders: 15 },
  { id: "AG-004", name: "Thời Trang Bắc Giang", contact: "0934 567 890", credit: 25000000, used: 0, status: "Chờ duyệt", orders: 0 },
];

const PRICING_TIERS = [
  { tier: 1, min: 1, max: 9, price: 280000, discount: 0, label: "Giá lẻ" },
  { tier: 2, min: 10, max: 49, price: 210000, discount: 25, label: "Sỉ cơ bản" },
  { tier: 3, min: 50, max: 99, price: 168000, discount: 40, label: "Sỉ trung" },
  { tier: 4, min: 100, max: Infinity, price: 140000, discount: 50, label: "Sỉ đại" },
];

// RBAC modules definition
const PERMISSION_MODULES = [
  { key: "products", label: "Quản lý Sản phẩm", actions: ["view", "create", "update", "delete"] as const },
  { key: "inventory", label: "Quản lý Tồn kho", actions: ["view", "create", "update"] as const },
  { key: "orders", label: "Quản lý Đơn hàng B2C & B2B", actions: ["view", "create", "update", "delete"] as const },
  { key: "agents", label: "Quản lý Đại lý & Duyệt hồ sơ", actions: ["view", "create", "update", "delete"] as const },
  { key: "debts", label: "Quản lý Công nợ", actions: ["view", "update"] as const },
  { key: "promotions", label: "Tạo Mã Khuyến mãi (Voucher)", actions: ["view", "create", "update", "delete"] as const },
  { key: "reports", label: "Báo cáo Thống kê & Doanh thu", actions: ["view"] as const },
  { key: "inbox", label: "Hỗ trợ Khách hàng (Live Chat)", actions: ["view", "create"] as const },
];

type PermSet = Record<string, Record<string, boolean>>;

const defaultPerms = (): PermSet =>
  Object.fromEntries(PERMISSION_MODULES.map((m) => [m.key, Object.fromEntries(m.actions.map((a) => [a, false]))]));

const STAFF_PRESETS: Record<string, PermSet> = {
  "Kế toán": { ...defaultPerms(), debts: { view: true, update: true }, reports: { view: true } },
  "Nhân viên Kho": { ...defaultPerms(), inventory: { view: true, create: true, update: true }, orders: { view: true, create: false, update: true, delete: false } },
  "Sales": { ...defaultPerms(), orders: { view: true, create: true, update: true, delete: false }, agents: { view: true, create: false, update: true, delete: false }, promotions: { view: true, create: true, update: true, delete: false }, inbox: { view: true, create: true } },
};

type StaffMember = {
  id: string; name: string; email: string; phone: string;
  jobTitle: string; status: "Hoạt động" | "Tạm khóa";
  lastLogin: string; permissions: PermSet;
};

const INITIAL_STAFF: StaffMember[] = [
  { id: "ST-001", name: "Trần Thị Bích", email: "bich.sales@abc.vn", phone: "0901 111 222", jobTitle: "Sales", status: "Hoạt động", lastLogin: "08/07/2026 08:30", permissions: STAFF_PRESETS["Sales"] },
  { id: "ST-002", name: "Lê Văn Kho", email: "kho.staff@abc.vn", phone: "0902 333 444", jobTitle: "Nhân viên Kho", status: "Hoạt động", lastLogin: "07/07/2026 17:00", permissions: STAFF_PRESETS["Nhân viên Kho"] },
  { id: "ST-003", name: "Phạm Minh Toán", email: "toan.kt@abc.vn", phone: "0903 555 666", jobTitle: "Kế toán", status: "Hoạt động", lastLogin: "08/07/2026 07:45", permissions: STAFF_PRESETS["Kế toán"] },
  { id: "ST-004", name: "Nguyễn Thị Hà", email: "ha.new@abc.vn", phone: "0904 777 888", jobTitle: "Sales", status: "Tạm khóa", lastLogin: "01/07/2026 10:00", permissions: defaultPerms() },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString("vi-VN") + "đ"; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Đã giao": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Hoàn thành": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Đã thanh toán": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Đang giao": "bg-blue-50 text-blue-700 border-blue-200",
    "Đang xử lý": "bg-amber-50 text-amber-700 border-amber-200",
    "Chờ duyệt": "bg-orange-50 text-orange-700 border-orange-200",
    "Đã hủy": "bg-red-50 text-red-700 border-red-200",
    "Hoạt động": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Vượt hạn mức": "bg-red-50 text-red-700 border-red-200",
    "Chưa thanh toán": "bg-red-50 text-red-700 border-red-200",
    "Thanh toán một phần": "bg-amber-50 text-amber-700 border-amber-200",
    "Tạm khóa": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-full ${map[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

function countPerms(perms: PermSet) {
  return Object.values(perms).reduce((s, m) => s + Object.values(m).filter(Boolean).length, 0);
}

// ─── AUTH SCREEN — SHARED LAYOUT ──────────────────────────────────────────────

function AuthLayout({ children, title, subtitle, imgSrc }: {
  children: React.ReactNode; title: string; subtitle: string; imgSrc: string;
}) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col">
        <img src={imgSrc} alt="ABC Fashion" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col h-full p-10">
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white italic">ABC Fashion</span>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Hệ thống quản lý & kinh doanh</p>
          </div>
          <div className="flex-1 flex flex-col justify-end pb-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white leading-tight mb-3">{title}</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">{subtitle}</p>
            <div className="flex items-center gap-6 mt-8">
              {[["500+", "Sản phẩm"], ["120+", "Đại lý"], ["10K+", "Đơn hàng"]].map(([v, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-white/50 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ─── INPUT HELPER ─────────────────────────────────────────────────────────────

function InputField({ label, icon: Icon, type = "text", placeholder, value, onChange, required, error, hint }: {
  label: string; icon?: React.ElementType; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean; error?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full text-sm py-2.5 rounded-lg border bg-input-background focus:outline-none focus:ring-2 transition-all ${Icon ? "pl-9 pr-3" : "px-3"} ${error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-accent/25 focus:border-accent"}`} />
      </div>
      {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin, onGoRegister }: {
  onLogin: (role: AuthRole) => void;
  onGoRegister: () => void;
}) {
  const [tab, setTab] = useState<"user" | "admin">("user");

  // User login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userLoading, setUserLoading] = useState(false);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [adminStep, setAdminStep] = useState<"creds" | "otp" | "locked">("creds");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [adminError, setAdminError] = useState("");
  const [failCount, setFailCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }
  }, [countdown]);

  const handleUserLogin = () => {
    setUserError("");
    setUserLoading(true);
    setTimeout(() => {
      setUserLoading(false);
      if (email === "agent@abc.vn" && password === "123456") {
        // Simulated pending agent
        setUserError("Tài khoản của bạn đang chờ phê duyệt hoặc đã bị tạm khóa. Vui lòng liên hệ Admin.");
        return;
      }
      if (email === "b2b@abc.vn" && password === "123456") { onLogin("agent"); return; }
      if (email && password) { onLogin("customer"); return; }
      setUserError("Email hoặc mật khẩu không chính xác.");
    }, 800);
  };

  const handleAdminCreds = () => {
    setAdminError("");
    if (!adminEmail || !adminPw) { setAdminError("Vui lòng nhập đầy đủ thông tin."); return; }
    if (failCount >= 5) { setAdminStep("locked"); setCountdown(1800); return; }
    // Simulate: wrong password increments counter
    if (adminPw !== "admin123") {
      const next = failCount + 1;
      setFailCount(next);
      if (next >= 5) { setAdminStep("locked"); setCountdown(1800); return; }
      setAdminError(`Sai mật khẩu. Còn ${5 - next} lần thử trước khi khóa tài khoản.`);
      return;
    }
    setAdminStep("otp");
    setOtpSent(true);
    setCountdown(60);
  };

  const handleOtpInput = (idx: number, val: string) => {
    const v = val.replace(/\D/, "").slice(-1);
    const next = [...otp]; next[idx] = v;
    setOtp(next);
    if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpVerify = () => {
    const code = otp.join("");
    if (code === "123456") { onLogin("admin"); return; }
    if (code === "000000") { onLogin("staff"); return; }
    setAdminError("Mã OTP không hợp lệ hoặc đã hết hạn.");
    setOtp(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục quản lý cửa hàng thời trang ABC của bạn."
      imgSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col justify-center flex-1 px-8 py-10 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">ABC Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground">Đăng nhập</h1>
          <p className="text-muted-foreground text-sm mt-1">Chọn cổng đăng nhập phù hợp với tài khoản của bạn.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          {[
            { key: "user", icon: User, label: "Khách hàng / Đại lý" },
            { key: "admin", icon: Shield, label: "Nội bộ (Admin & Staff)" },
          ].map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setUserError(""); setAdminError(""); setAdminStep("creds"); setOtp(["","","","","",""]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {tab === "user" && (
          <div className="space-y-4">
            <InputField label="Email" icon={Mail} type="email" placeholder="example@email.com" value={email} onChange={setEmail} required />
            <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={setPassword} required />

            {userError && (
              <div className={`flex items-start gap-2.5 p-3 rounded-lg text-sm border ${userError.includes("chờ") ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p>{userError}</p>
              </div>
            )}

            <button onClick={handleUserLogin} disabled={userLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {userLoading ? <><RefreshCw size={14} className="animate-spin" />Đang kiểm tra...</> : <>Đăng nhập <ArrowRight size={14} /></>}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">hoặc</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <button className="w-full flex items-center justify-center gap-2.5 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Đăng nhập với Google
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <button onClick={onGoRegister} className="text-accent font-semibold hover:underline">Đăng ký ngay</button>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              <span className="opacity-50">Demo: </span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">b2b@abc.vn / 123456</code>
              <span className="opacity-50"> → Agent</span>
            </p>
          </div>
        )}

        {tab === "admin" && (
          <div>
            {/* Secure portal badge */}
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl mb-5">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Cổng đăng nhập nội bộ bảo mật</p>
                <p className="text-xs text-muted-foreground">Yêu cầu xác thực 2 yếu tố (2FA) bắt buộc</p>
              </div>
            </div>

            {adminStep === "creds" && (
              <div className="space-y-4">
                <InputField label="Email nội bộ" icon={Mail} type="email" placeholder="admin@abc.vn" value={adminEmail} onChange={setAdminEmail} required />
                <InputField label="Mật khẩu hệ thống" icon={Lock} type="password" placeholder="••••••••" value={adminPw} onChange={setAdminPw} required />
                {adminError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" /><p>{adminError}</p>
                  </div>
                )}
                {failCount > 0 && failCount < 5 && (
                  <div className="flex gap-1.5 items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < failCount ? "bg-destructive" : "bg-muted"}`} />
                    ))}
                    <span className="text-xs text-destructive ml-1">{failCount}/5</span>
                  </div>
                )}
                <button onClick={handleAdminCreds}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Tiếp tục <ArrowRight size={14} />
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  <span className="opacity-50">Demo: </span>
                  <code className="bg-muted px-1 py-0.5 rounded">admin@abc.vn / admin123</code>
                  <span className="opacity-50"> → OTP: 123456</span>
                </p>
              </div>
            )}

            {adminStep === "locked" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Lock size={28} className="text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Tài khoản bị tạm khóa</h3>
                  <p className="text-sm text-muted-foreground mt-1">Đăng nhập sai quá 5 lần. Tài khoản bị khóa tạm thời.</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600 font-medium mb-1">Mở khóa sau:</p>
                  <p className="text-2xl font-mono font-bold text-destructive">
                    {Math.floor(countdown / 60).toString().padStart(2, "0")}:{(countdown % 60).toString().padStart(2, "0")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Email cảnh báo xâm nhập đã được gửi đến Chủ shop.</p>
                <button onClick={() => { setAdminStep("creds"); setFailCount(0); setAdminError(""); }}
                  className="text-sm text-accent hover:underline">Liên hệ Admin để mở khóa</button>
              </div>
            )}

            {adminStep === "otp" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={24} className="text-accent" />
                  </div>
                  <h3 className="font-semibold text-base">Xác thực 2 bước (2FA)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Nhập mã 6 chữ số từ ứng dụng Google Authenticator hoặc SMS gửi đến <strong>{adminEmail}</strong></p>
                </div>

                {/* OTP input boxes */}
                <div className="flex gap-2 justify-center">
                  {otp.map((d, i) => (
                    <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                      type="text" maxLength={1} value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                      className="w-11 h-12 text-center text-lg font-bold border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    />
                  ))}
                </div>

                {adminError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle size={14} />{adminError}
                  </div>
                )}

                <button onClick={handleOtpVerify} disabled={otp.join("").length < 6}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  <ShieldCheck size={15} /> Xác thực & Đăng nhập
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => setAdminStep("creds")} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                    <RotateCcw size={12} /> Quay lại
                  </button>
                  {countdown > 0
                    ? <span className="text-xs text-muted-foreground">Gửi lại mã ({countdown}s)</span>
                    : <button onClick={() => setCountdown(60)} className="text-xs text-accent hover:underline">Gửi lại mã OTP</button>
                  }
                </div>
                <p className="text-xs text-center text-muted-foreground opacity-60">Demo OTP: <code className="bg-muted px-1 rounded">123456</code> (Admin) hoặc <code className="bg-muted px-1 rounded">000000</code> (Staff)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────

function RegisterPage({ onGoLogin }: { onGoLogin: () => void }) {
  const [tab, setTab] = useState<"b2c" | "b2b">("b2c");
  const [b2cStep, setB2cStep] = useState<"form" | "otp" | "done">("form");
  const [b2bStep, setB2bStep] = useState<"form" | "pending">("form");

  // B2C fields
  const [b2c, setB2c] = useState({ name: "", phone: "", email: "", pw: "", confirm: "" });
  const [b2cOtp, setB2cOtp] = useState(["", "", "", "", "", ""]);
  const [b2cError, setB2cError] = useState("");
  const otpRefs2 = useRef<(HTMLInputElement | null)[]>([]);

  // B2B fields
  const [b2b, setB2b] = useState({ name: "", phone: "", email: "", pw: "", confirm: "", business: "", tax: "", address: "" });
  const [b2bError, setB2bError] = useState("");

  const validateB2C = () => {
    if (!b2c.name || !b2c.phone || !b2c.email || !b2c.pw) return "Vui lòng điền đầy đủ các trường bắt buộc.";
    if (b2c.pw !== b2c.confirm) return "Mật khẩu xác nhận không khớp.";
    if (b2c.pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    return "";
  };
  const validateB2B = () => {
    if (!b2b.name || !b2b.phone || !b2b.email || !b2b.pw || !b2b.business || !b2b.address) return "Vui lòng điền đầy đủ các trường bắt buộc.";
    if (b2b.pw !== b2b.confirm) return "Mật khẩu xác nhận không khớp.";
    return "";
  };

  const handleB2cOtp = (i: number, val: string) => {
    const v = val.replace(/\D/, "").slice(-1);
    const next = [...b2cOtp]; next[i] = v;
    setB2cOtp(next);
    if (v && i < 5) otpRefs2.current[i + 1]?.focus();
  };

  return (
    <AuthLayout
      title="Tham gia cùng ABC Fashion"
      subtitle="Tạo tài khoản để mua sắm trực tuyến hoặc đăng ký làm đối tác đại lý phân phối."
      imgSrc="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col flex-1 px-8 py-10 max-w-lg mx-auto w-full">
        <div className="mb-7">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">ABC Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-muted-foreground text-sm mt-1">Chọn loại tài khoản phù hợp với nhu cầu của bạn.</p>
        </div>

        {/* Account type selector */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { key: "b2c", icon: User, title: "Khách hàng cá nhân", sub: "Mua lẻ với giá niêm yết" },
            { key: "b2b", icon: Building2, title: "Đối tác / Đại lý", sub: "Mua sỉ, chiết khấu đặc biệt" },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setB2cError(""); setB2bError(""); setB2cStep("form"); setB2bStep("form"); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${tab === t.key ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/40"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tab === t.key ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>
                <t.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* B2C Form */}
        {tab === "b2c" && b2cStep === "form" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Họ và tên" icon={User} placeholder="Nguyễn Văn A" value={b2c.name} onChange={(v) => setB2c(p => ({ ...p, name: v }))} required />
              <InputField label="Số điện thoại" icon={Phone} type="tel" placeholder="09xx xxx xxx" value={b2c.phone} onChange={(v) => setB2c(p => ({ ...p, phone: v }))} required />
            </div>
            <InputField label="Email" icon={Mail} type="email" placeholder="email@example.com" value={b2c.email} onChange={(v) => setB2c(p => ({ ...p, email: v }))} required hint="Mã xác thực sẽ được gửi đến email này" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2c.pw} onChange={(v) => setB2c(p => ({ ...p, pw: v }))} required hint="Tối thiểu 8 ký tự" />
              <InputField label="Xác nhận mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2c.confirm} onChange={(v) => setB2c(p => ({ ...p, confirm: v }))} required />
            </div>
            {b2cError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle size={14} />{b2cError}</div>}
            <button onClick={() => { const e = validateB2C(); if (e) { setB2cError(e); return; } setB2cStep("otp"); }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Đăng ký & Nhận mã xác thực <ArrowRight size={14} />
            </button>
          </div>
        )}

        {tab === "b2c" && b2cStep === "otp" && (
          <div className="space-y-5 text-center">
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3"><Mail size={24} className="text-accent" /></div>
              <h3 className="font-semibold">Xác thực Email</h3>
              <p className="text-sm text-muted-foreground mt-1">Mã OTP đã được gửi đến <strong>{b2c.email || "email của bạn"}</strong>. Có hiệu lực trong 10 phút.</p>
            </div>
            <div className="flex gap-2 justify-center">
              {b2cOtp.map((d, i) => (
                <input key={i} ref={el => { otpRefs2.current[i] = el; }} type="text" maxLength={1} value={d}
                  onChange={(e) => handleB2cOtp(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) otpRefs2.current[i - 1]?.focus(); }}
                  className="w-11 h-12 text-center text-lg font-bold border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
              ))}
            </div>
            <button onClick={() => setB2cStep("done")} disabled={b2cOtp.join("").length < 6}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <CheckCircle size={15} /> Xác thực & Hoàn tất
            </button>
            <p className="text-xs text-muted-foreground">Demo: nhập bất kỳ 6 chữ số</p>
          </div>
        )}

        {tab === "b2c" && b2cStep === "done" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-emerald-700">Đăng ký thành công!</h3>
              <p className="text-sm text-muted-foreground mt-2">Chào mừng <strong>{b2c.name || "bạn"}</strong> đến với ABC Fashion. Tài khoản đã sẵn sàng để mua sắm.</p>
            </div>
            <button onClick={onGoLogin} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Bắt đầu mua sắm <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* B2B Form */}
        {tab === "b2b" && b2bStep === "form" && (
          <div className="space-y-3.5">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
              <Info size={13} className="shrink-0 mt-0.5" />
              Hồ sơ đại lý sẽ được Ban quản trị xét duyệt trước khi kích hoạt. Thời gian: 1-2 ngày làm việc.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Người đại diện" icon={User} placeholder="Họ và tên" value={b2b.name} onChange={v => setB2b(p => ({ ...p, name: v }))} required />
              <InputField label="Số điện thoại" icon={Phone} type="tel" placeholder="09xx xxx xxx" value={b2b.phone} onChange={v => setB2b(p => ({ ...p, phone: v }))} required />
            </div>
            <InputField label="Email đăng nhập" icon={Mail} type="email" placeholder="business@email.com" value={b2b.email} onChange={v => setB2b(p => ({ ...p, email: v }))} required />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2b.pw} onChange={v => setB2b(p => ({ ...p, pw: v }))} required />
              <InputField label="Xác nhận mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2b.confirm} onChange={v => setB2b(p => ({ ...p, confirm: v }))} required />
            </div>
            <InputField label="Tên cửa hàng / Doanh nghiệp" icon={Building2} placeholder="Cty TNHH / Cửa hàng..." value={b2b.business} onChange={v => setB2b(p => ({ ...p, business: v }))} required />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mã số thuế" placeholder="0123456789 (nếu có)" value={b2b.tax} onChange={v => setB2b(p => ({ ...p, tax: v }))} hint="Tùy chọn" />
              <InputField label="Địa chỉ kinh doanh" placeholder="Số nhà, đường, quận..." value={b2b.address} onChange={v => setB2b(p => ({ ...p, address: v }))} required />
            </div>
            {b2bError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle size={14} />{b2bError}</div>}
            <button onClick={() => { const e = validateB2B(); if (e) { setB2bError(e); return; } setB2bStep("pending"); }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Gửi hồ sơ đăng ký <ArrowRight size={14} />
            </button>
          </div>
        )}

        {tab === "b2b" && b2bStep === "pending" && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Clock size={28} className="text-amber-600" />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-amber-700">Hồ sơ đang xét duyệt</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Cảm ơn <strong>{b2b.name || "bạn"}</strong> đã đăng ký làm đối tác. Hồ sơ của bạn đang được Ban quản trị xem xét. Chúng tôi sẽ liên hệ lại qua email <strong>{b2b.email}</strong> và số điện thoại sớm nhất.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-left space-y-2.5">
              {[
                { step: "1", text: "Hồ sơ đã được ghi nhận", done: true },
                { step: "2", text: "Đang xét duyệt bởi Admin (1-2 ngày)", done: false },
                { step: "3", text: "Nhận email kích hoạt tài khoản", done: false },
                { step: "4", text: "Đăng nhập & bắt đầu đặt hàng sỉ", done: false },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-border text-muted-foreground"}`}>
                    {s.done ? <CheckCircle size={12} /> : s.step}
                  </div>
                  <span className={s.done ? "text-foreground font-medium" : "text-muted-foreground"}>{s.text}</span>
                </div>
              ))}
            </div>
            <button onClick={onGoLogin} className="text-sm text-accent hover:underline">Về trang đăng nhập</button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{" "}
          <button onClick={onGoLogin} className="text-accent font-semibold hover:underline">Đăng nhập</button>
        </p>
      </div>
    </AuthLayout>
  );
}

// ─── PORTAL SWITCHER ──────────────────────────────────────────────────────────


// ─── PROFILE MODAL ────────────────────────────────────────────────────────────

function ProfileModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "password">("info");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "Nguyễn Văn Minh", email: "minh@example.com", phone: "0901 234 567" });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold">Tài khoản của tôi</h2>
            <p className="text-primary-foreground/50 text-xs mt-0.5">Quản lý thông tin cá nhân</p>
          </div>
          <button onClick={onClose} className="text-primary-foreground/50 hover:text-primary-foreground p-1"><X size={18} /></button>
        </div>
        <div className="flex border-b border-border">
          {[{ key: "info", icon: User, label: "Thông tin" }, { key: "password", icon: Lock, label: "Đổi mật khẩu" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="px-6 py-5">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border">
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>M</div>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                    <Camera size={13} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <p className="text-xs text-muted-foreground">Nhấp camera để đổi ảnh đại diện</p>
              </div>
              {[
                { label: "Họ và tên", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Số điện thoại", key: "phone", type: "tel" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full text-sm px-3 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                </div>
              ))}
              <button onClick={handleSave} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {saved ? "✓ Đã lưu" : "Lưu thông tin"}
              </button>
            </div>
          )}
          {tab === "password" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa và chữ số.
              </div>
              {[
                { label: "Mật khẩu hiện tại", key: "current" },
                { label: "Mật khẩu mới", key: "next" },
                { label: "Xác nhận mật khẩu mới", key: "confirm" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5">{f.label}</label>
                  <input type="password" value={(pwForm as any)[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="••••••••" className="w-full text-sm px-3 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                </div>
              ))}
              {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && <p className="text-xs text-destructive">Mật khẩu không khớp</p>}
              <button onClick={handleSave} disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"}`}>
                {saved ? "✓ Đã đổi mật khẩu" : "Đổi mật khẩu"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMenu({ onOpenProfile, onLogout }: { onOpenProfile: () => void; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-muted transition-colors">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">M</div>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">Nguyễn Văn Minh</p>
            <p className="text-xs text-muted-foreground mt-0.5">minh@example.com</p>
          </div>
          <div className="py-1">
            {[
              { icon: User, label: "Thông tin tài khoản", action: () => { onOpenProfile(); setOpen(false); } },
              { icon: Lock, label: "Đổi mật khẩu", action: () => { onOpenProfile(); setOpen(false); } },
              { icon: Settings, label: "Cài đặt", action: () => setOpen(false) },
            ].map(item => (
              <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                <item.icon size={14} className="text-muted-foreground" />{item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-border py-1">
            <button onClick={() => onLogout?.()} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-destructive transition-colors">
              <LogOut size={14} />Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── B2C ──────────────────────────────────────────────────────────────────────

type CartItem = { productId: string; size: string; color: string; qty: number; price: number; name: string };

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} className={i <= Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground"} />)}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: typeof PRODUCTS[0]; onAdd: (item: CartItem) => void }) {
  const [sel, setSel] = useState({ size: product.sizes[1] ?? product.sizes[0], color: product.colors[0] });
  const inStock = (product.stock as Record<string, number>)[`${sel.size}-${sel.color}`] ?? 0;
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative overflow-hidden aspect-[3/4] bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && <span className="absolute top-2.5 left-2.5 bg-accent text-white text-xs font-medium px-2 py-0.5 rounded-full">{product.badge}</span>}
        {inStock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">Hết hàng</span></div>}
      </div>
      <div className="p-3.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{product.category}</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="font-semibold text-sm leading-snug mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-2.5"><StarRating rating={product.rating} /><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
        <div className="flex gap-1 mb-2">
          {product.colors.slice(0, 4).map(c => <button key={c} onClick={() => setSel(s => ({ ...s, color: c }))} title={c} className={`w-4 h-4 rounded-full border-2 transition-all ${sel.color === c ? "border-primary scale-110" : "border-transparent"} bg-muted`} />)}
          <span className="text-xs text-muted-foreground self-center ml-1">{sel.color}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.sizes.map(s => <button key={s} onClick={() => setSel(p => ({ ...p, size: s }))} className={`text-xs px-2 py-0.5 rounded border transition-colors ${sel.size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}>{s}</button>)}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-base font-bold text-accent">{fmt(product.price)}</span>
            <p className="text-xs text-muted-foreground">{inStock > 0 ? `Còn ${inStock}` : "Hết"}</p>
          </div>
          <button disabled={inStock === 0} onClick={() => onAdd({ productId: product.id, size: sel.size, color: sel.color, qty: 1, price: product.price, name: product.name })}
            className="flex items-center gap-1 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingCart size={12} /> Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose }: { cart: CartItem[]; setCart: (c: CartItem[]) => void; onClose: () => void }) {
  const [voucher, setVoucher] = useState("");
  const [voucherOk, setVoucherOk] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherOk ? Math.floor(subtotal * 0.1) : 0;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="w-72 bg-card flex flex-col shadow-2xl border-l border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} />
            <span className="text-sm font-semibold">Giỏ hàng</span>
            {cart.length > 0 && <span className="bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingCart size={32} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Giỏ hàng trống</p>
              <button onClick={onClose} className="mt-3 text-xs text-accent hover:underline">Tiếp tục mua sắm</button>
            </div>
          ) : cart.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.size} · {item.color}</p>
                <p className="text-xs font-semibold text-accent mt-0.5">{fmt(item.price * item.qty)}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors"><X size={11} /></button>
                <div className="flex items-center border border-border rounded overflow-hidden">
                  <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:Math.max(1,i.qty-1)} : i))} className="w-5 h-5 flex items-center justify-center hover:bg-muted text-muted-foreground"><Minus size={9} /></button>
                  <span className="text-xs w-5 text-center">{item.qty}</span>
                  <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:i.qty+1} : i))} className="w-5 h-5 flex items-center justify-center hover:bg-muted text-muted-foreground"><Plus size={9} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-border px-4 py-3 space-y-2.5">
            <div className="flex gap-1.5">
              <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Mã giảm giá (ABC10)"
                className="flex-1 text-xs px-2.5 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={() => { if (voucher.toUpperCase() === "ABC10") setVoucherOk(true); }}
                className="text-xs px-2.5 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap">Dùng</button>
            </div>
            {voucherOk && <p className="text-xs text-emerald-600 font-medium">✓ Giảm 10% — {fmt(discount)}</p>}
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/60">
              <span>Tổng</span>
              <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-accent">{fmt(subtotal - discount)}</span>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
              Thanh toán <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CHAT DATA & WIDGET ───────────────────────────────────────────────────────

type ChatMsg = { id: string; from: "user" | "staff" | "bot"; text: string; time: string; img?: string };
type Convo = {
  id: string; name: string; phone: string; role: "guest" | "customer" | "agent";
  lastMsg: string; lastTime: string; unread: number; tag?: string; messages: ChatMsg[];
};

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

const DEMO_CONVOS: Convo[] = [
  {
    id: "c1", name: "Nguyễn Thị Mai", phone: "0901 234 567", role: "customer",
    lastMsg: "Cho mình hỏi size L áo polo còn không ạ?", lastTime: "08:42", unread: 2, tag: "Hỏi size",
    messages: [
      { id: "m1", from: "bot", text: "Chào bạn! Cửa hàng thời trang ABC có thể giúp gì cho bạn? 😊", time: "08:40" },
      { id: "m2", from: "user", text: "Cho mình hỏi size L áo polo còn không ạ?", time: "08:42" },
    ],
  },
  {
    id: "c2", name: "ATMIN Fashion", phone: "0912 345 678", role: "agent",
    lastMsg: "Tôi muốn tăng hạn mức công nợ lên 80 triệu", lastTime: "08:15", unread: 1, tag: "Hỏi chính sách sỉ",
    messages: [
      { id: "m1", from: "bot", text: "Chào đại lý ATMIN Fashion! Chúng tôi có thể hỗ trợ gì cho bạn?", time: "08:10" },
      { id: "m2", from: "user", text: "Tôi muốn tăng hạn mức công nợ lên 80 triệu", time: "08:15" },
    ],
  },
  {
    id: "c3", name: "Khách vãng lai", phone: "0923 456 789", role: "guest",
    lastMsg: "Bảng size áo cho mình xem với", lastTime: "Hôm qua", unread: 0, tag: undefined,
    messages: [
      { id: "m1", from: "bot", text: "Chào bạn! Cửa hàng thời trang ABC có thể giúp gì cho bạn? 😊", time: "20:30" },
      { id: "m2", from: "user", text: "Bảng size áo cho mình xem với", time: "20:31" },
      { id: "m3", from: "staff", text: "Dạ bạn tham khảo bảng size bên dưới nhé! S: 45-55kg | M: 55-65kg | L: 65-75kg | XL: 75-85kg | XXL: 85-95kg", time: "20:35" },
      { id: "m4", from: "user", text: "Cảm ơn bạn nhiều nha!", time: "20:36" },
    ],
  },
  {
    id: "c4", name: "Trần Văn Bình", phone: "0934 567 890", role: "customer",
    lastMsg: "Đơn ORD-2024-003 khi nào giao tới vậy?", lastTime: "Hôm qua", unread: 0, tag: "Hỏi đơn hàng",
    messages: [
      { id: "m1", from: "bot", text: "Chào bạn! Cửa hàng thời trang ABC có thể giúp gì cho bạn? 😊", time: "15:00" },
      { id: "m2", from: "user", text: "Đơn ORD-2024-003 khi nào giao tới vậy?", time: "15:01" },
      { id: "m3", from: "staff", text: "Dạ đơn của bạn đang trên đường giao, dự kiến hôm nay hoặc ngày mai bạn nhé!", time: "15:10" },
    ],
  },
];

const FAQ_BUTTONS = [
  { label: "📏 Bảng size", answer: "Bảng size tham khảo: S: 45-55kg | M: 55-65kg | L: 65-75kg | XL: 75-85kg | XXL: 85-95kg. Nếu bạn ở giữa 2 size, chọn size lớn hơn nhé!" },
  { label: "🔄 Đổi trả", answer: "Chính sách đổi trả trong 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem, chưa qua sử dụng. Liên hệ hotline 0901 234 567 để được hỗ trợ." },
  { label: "🤝 Chính sách Đại lý", answer: "Đại lý ABC được hưởng chiết khấu 25-50% theo số lượng. Đặt từ 10 bộ: -25% | 50 bộ: -40% | 100 bộ: -50%. Đăng ký qua trang web để được xét duyệt!" },
];

const TAGS = ["Hỏi size", "Hỏi đơn hàng", "Khiếu nại đổi trả", "Hỏi chính sách sỉ", "Khác"];

// ── Chat Widget (floating, for B2C + B2B) ────────────────────────────────────

function ChatWidget({ loggedInAs }: { loggedInAs?: { name: string; role: "customer" | "agent" } }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [guestForm, setGuestForm] = useState({ name: "", phone: "" });
  const [guestReady, setGuestReady] = useState(!!loggedInAs);
  const [unread, setUnread] = useState(1);
  const [faqSent, setFaqSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAfterHours = new Date().getHours() >= 22 || new Date().getHours() < 7;

  const userName = loggedInAs?.name ?? guestForm.name;

  useEffect(() => {
    if (open && messages.length === 0 && guestReady) {
      const welcome: ChatMsg = {
        id: "w1", from: "bot", time: nowTime(),
        text: isAfterHours
          ? "Hiện tại cửa hàng đã nghỉ. Vui lòng để lại lời nhắn hoặc số điện thoại, chúng tôi sẽ liên hệ lại vào sáng mai 🌙"
          : `Chào ${userName || "bạn"}! Cửa hàng thời trang ABC có thể giúp gì cho bạn? 😊`,
      };
      setMessages([welcome]);
      setUnread(0);
    }
  }, [open, guestReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMsg = { id: Date.now().toString(), from: "user", text: text.trim(), time: nowTime() };
    setMessages(prev => [...prev, msg]);
    setInput("");
    // Simulate staff reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), from: "staff", time: nowTime(),
        text: "Cảm ơn bạn đã liên hệ! Nhân viên ABC sẽ phản hồi trong giây lát. Trong thời gian chờ, bạn có thể tham khảo các câu hỏi thường gặp bên dưới.",
      }]);
    }, 1500);
  };

  const sendFaq = (faq: typeof FAQ_BUTTONS[0]) => {
    const userMsg: ChatMsg = { id: Date.now().toString(), from: "user", text: faq.label, time: nowTime() };
    const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), from: "bot", text: faq.answer, time: nowTime() };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setFaqSent(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Chat window */}
      {open && (
        <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: "480px" }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold">A</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Hỗ trợ ABC Fashion</p>
              <p className="text-xs text-primary-foreground/50">{isAfterHours ? "Ngoài giờ làm việc" : "Đang trực tuyến · Trả lời ngay"}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/50 hover:text-primary-foreground p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Guest form */}
          {!guestReady ? (
            <div className="flex-1 flex flex-col justify-center px-5 py-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Headphones size={24} className="text-accent" />
                </div>
                <h3 className="font-semibold text-sm">Bắt đầu trò chuyện</h3>
                <p className="text-xs text-muted-foreground mt-1">Nhập thông tin để nhân viên tiện hỗ trợ bạn</p>
              </div>
              <div className="space-y-2.5">
                <input value={guestForm.name} onChange={e => setGuestForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Họ và tên *" className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/40" />
                <input value={guestForm.phone} onChange={e => setGuestForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Số điện thoại *" type="tel" className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/40" />
              </div>
              <button onClick={() => { if (guestForm.name && guestForm.phone) setGuestReady(true); }}
                disabled={!guestForm.name || !guestForm.phone}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-all">
                Bắt đầu chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.from !== "user" && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.from === "bot" ? "bg-muted text-muted-foreground" : "bg-accent text-white"}`}>
                        {msg.from === "bot" ? "🤖" : "A"}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.from === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* FAQ quick buttons */}
                {messages.length > 0 && !faqSent && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-muted-foreground text-center">Câu hỏi thường gặp:</p>
                    {FAQ_BUTTONS.map(faq => (
                      <button key={faq.label} onClick={() => sendFaq(faq)}
                        className="w-full text-left text-xs px-3 py-2 border border-accent/30 text-accent bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors">
                        {faq.label}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-border px-3 py-2.5 flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <Paperclip size={15} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                  placeholder="Nhập tin nhắn..." className="flex-1 text-xs px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30" />
                <button onClick={() => sendMsg(input)} disabled={!input.trim()}
                  className="w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40">
                  <Send size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating bubble */}
      <button onClick={() => { setOpen(v => !v); setUnread(0); }}
        className="w-13 h-13 bg-accent text-white rounded-full shadow-xl flex items-center justify-center hover:bg-accent/90 hover:scale-105 transition-all relative"
        style={{ width: 52, height: 52 }}>
        {open ? <X size={20} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}

// ── Admin Inbox ───────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<Convo["role"], string> = {
  guest: "Khách vãng lai", customer: "Khách lẻ", agent: "Đại lý",
};
const ROLE_COLOR: Record<Convo["role"], string> = {
  guest: "bg-gray-100 text-gray-600", customer: "bg-blue-50 text-blue-700", agent: "bg-purple-50 text-purple-700",
};

function AdminInbox() {
  const [convos, setConvos] = useState<Convo[]>(DEMO_CONVOS);
  const [activeId, setActiveId] = useState<string>(DEMO_CONVOS[0].id);
  const [reply, setReply] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  // Layout preference: "standard" = staff RIGHT / customer LEFT (mặc định, giống Zalo)
  //                   "reversed" = staff LEFT / customer RIGHT
  const [layout, setLayout] = useState<"standard" | "reversed">("standard");
  const bottomRef = useRef<HTMLDivElement>(null);
  const active = convos.find(c => c.id === activeId)!;

  // staffOnRight = true means staff msg bubble sits on RIGHT
  const staffOnRight = layout === "standard";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages.length]);

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg: ChatMsg = { id: Date.now().toString(), from: "staff", text: reply.trim(), time: nowTime() };
    setConvos(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, msg], lastMsg: reply.trim(), lastTime: nowTime(), unread: 0 }
      : c));
    setReply("");
  };

  const setTag = (tag: string) => {
    setConvos(prev => prev.map(c => c.id === activeId ? { ...c, tag } : c));
    setTagOpen(false);
  };

  const markRead = (id: string) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setActiveId(id);
  };

  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full gap-0 -m-5 overflow-hidden rounded-xl border border-border bg-card" style={{ height: "calc(100vh - 120px)" }}>
      {/* Left: conversation list */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Hộp thư hỗ trợ</h2>
            {totalUnread > 0 && <p className="text-xs text-accent mt-0.5">{totalUnread} tin chưa đọc</p>}
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{convos.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {convos.map(c => (
            <button key={c.id} onClick={() => markRead(c.id)}
              className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors ${activeId === c.id ? "bg-accent/5 border-l-2 border-accent" : ""}`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${c.role === "agent" ? "bg-purple-100 text-purple-700" : c.role === "customer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-semibold truncate">{c.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">{c.lastMsg}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[c.role]}`}>{ROLE_LABEL[c.role]}</span>
                    {c.tag && <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full">{c.tag}</span>}
                    {c.unread > 0 && <span className="ml-auto bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{c.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="shrink-0 px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${active.role === "agent" ? "bg-purple-100 text-purple-700" : active.role === "customer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
            {active.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{active.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[active.role]}`}>{ROLE_LABEL[active.role]}</span>
              {active.tag && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">{active.tag}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{active.phone}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tag picker */}
            <div className="relative">
              <button onClick={() => setTagOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
                <TagIcon size={12} /> {active.tag ?? "Gắn thẻ"}
              </button>
              {tagOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 w-44">
                  {TAGS.map(t => (
                    <button key={t} onClick={() => setTag(t)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${active.tag === t ? "font-semibold text-accent" : ""}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <UserCheck size={12} /> Chuyển Admin
            </button>
            {/* Layout toggle */}
            <button
              onClick={() => setLayout(l => l === "standard" ? "reversed" : "standard")}
              title={layout === "standard" ? "Đang: Tôi bên phải — Nhấn để đổi" : "Đang: Tôi bên trái — Nhấn để đổi"}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ArrowLeft size={12} className={layout === "standard" ? "rotate-180" : ""} />
              {layout === "standard" ? "Tôi: Phải" : "Tôi: Trái"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-muted/10">
          {active.messages.map(msg => {
            // Determine which side this bubble goes to
            const isMyMsg = msg.from === "staff" || msg.from === "bot";
            const myOnRight = staffOnRight;
            const bubbleRight = isMyMsg ? myOnRight : !myOnRight;

            return (
              <div key={msg.id} className={`flex gap-2.5 ${bubbleRight ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {isMyMsg ? (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.from === "bot" ? "bg-muted border border-border text-muted-foreground" : "bg-accent text-white"}`}>
                    {msg.from === "bot" ? "🤖" : "NV"}
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${active.role === "agent" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {active.name[0]}
                  </div>
                )}
                {/* Bubble */}
                <div className={`max-w-[65%] flex flex-col gap-0.5 ${bubbleRight ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-muted-foreground px-1">
                    {msg.from === "bot" ? "Bot tự động" : msg.from === "staff" ? "Nhân viên ABC" : active.name}
                  </span>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-muted text-foreground " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                      : msg.from === "bot"
                      ? "bg-card border border-border text-foreground " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                      : "bg-accent text-white " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div className="shrink-0 border-t border-border px-5 py-3 bg-card">
          <div className="flex items-end gap-2.5">
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder={`Trả lời ${active.name}...`} rows={2}
              className="flex-1 text-sm px-3 py-2 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none" />
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={sendReply} disabled={!reply.trim()}
                className="w-9 h-9 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40">
                <Send size={15} />
              </button>
              <button className="w-9 h-9 border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <Paperclip size={14} />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Enter để gửi · Shift+Enter xuống dòng</p>
        </div>
      </div>
    </div>
  );
}

// ─── B2C ──────────────────────────────────────────────────────────────────────

function B2CPortal({ onLogout }: { onLogout: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Mới nhất");
  const categories = ["Tất cả", "Áo", "Quần", "Đầm/Váy"];
  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (category !== "Tất cả") list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "Giá tăng") list = [...list].sort((a,b)=>a.price-b.price);
    if (sortBy === "Giá giảm") list = [...list].sort((a,b)=>b.price-a.price);
    if (sortBy === "Đánh giá") list = [...list].sort((a,b)=>b.rating-a.rating);
    return list;
  }, [category, search, sortBy]);
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId===item.productId && i.size===item.size && i.color===item.color);
      if (idx>=0) return prev.map((i,n) => n===idx ? {...i,qty:i.qty+1} : i);
      return [...prev, item];
    });
    setCartOpen(true);
  };
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-xl mx-auto px-5 py-2.5 flex items-center justify-between gap-4">
          <div style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold italic text-primary shrink-0">ABC Fashion</div>
          <nav className="hidden md:flex items-center gap-5">
            {categories.map(c => <button key={c} onClick={()=>setCategory(c)} className={`text-sm transition-colors pb-0.5 ${category===c?"text-foreground font-medium border-b-2 border-accent":"text-muted-foreground hover:text-foreground"}`}>{c}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm..."
                className="text-xs pl-8 pr-3 py-1.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring w-40" />
            </div>
            <button onClick={()=>setCartOpen(true)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart size={18} />
              {cartCount>0 && <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
            </button>
            <UserMenu onOpenProfile={()=>setProfileOpen(true)} onLogout={onLogout} />
          </div>
        </div>
      </header>
      <section className="relative h-[420px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=600&fit=crop&auto=format" alt="ABC Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-screen-xl mx-auto px-8 md:px-14">
            <p className="text-accent text-xs uppercase tracking-[0.3em] mb-3 font-medium">Bộ sưu tập 2026</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">Thời trang<br /><em>định nghĩa bạn</em></h1>
            <p className="text-white/65 text-sm mb-7 max-w-sm">Khám phá bộ sưu tập mới nhất — phong cách hiện đại, chất liệu cao cấp.</p>
            <button className="bg-accent text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2">Mua sắm ngay <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold">Sản phẩm</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} sản phẩm</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="text-xs px-2.5 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
              {["Mới nhất","Giá tăng","Giá giảm","Đánh giá"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart} />)}
        </div>
      </section>
      <section className="bg-secondary border-y border-border py-10 px-5">
        <div className="max-w-screen-xl mx-auto text-center">
          <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold mb-5">Khách hàng nói gì</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Nguyễn Thị Lan", text: "Áo polo chất lượng tuyệt vời, mặc thoáng mát. Sẽ ủng hộ ABC lần nữa!", rating: 5, product: "Áo Polo ABC Classic" },
              { name: "Trần Minh Hoàng", text: "Quần jeans vừa vặn, chất vải tốt không phai màu sau nhiều lần giặt.", rating: 5, product: "Quần Jeans Slim Fit" },
              { name: "Phạm Thu Hương", text: "Đầm floral siêu cute, nhận hàng đúng hẹn, đóng gói cẩn thận!", rating: 4, product: "Đầm Floral Summer" },
            ].map((r,i) => (
              <div key={i} className="bg-card p-4 rounded-xl border border-border text-left">
                <StarRating rating={r.rating} />
                <p className="text-sm mt-2.5 mb-2.5 text-foreground/75 italic leading-relaxed">"{r.text}"</p>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={()=>setCartOpen(false)} />}
      {profileOpen && <ProfileModal onClose={()=>setProfileOpen(false)} />}
      <ChatWidget loggedInAs={{ name: "Nguyễn Văn Minh", role: "customer" }} />
    </div>
  );
}

// ─── B2B PORTAL ───────────────────────────────────────────────────────────────

type MatrixQty = Record<string, number>;
type B2BTab = "order" | "debt" | "history";

function TierProgress({ totalQty }: { totalQty: number }) {
  const current = PRICING_TIERS.find(t=>totalQty>=t.min&&totalQty<=t.max) ?? PRICING_TIERS[0];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Bậc giá theo số lượng</span>
        {totalQty>0 && <span className="font-medium text-accent">{totalQty} bộ đang chọn</span>}
      </div>
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border">
        {PRICING_TIERS.map(t => {
          const active = current.tier===t.tier && totalQty>0;
          return (
            <div key={t.tier} className={`flex-1 px-2.5 py-2.5 text-center border-r border-border last:border-0 transition-all ${active?"bg-accent text-white":"bg-card"}`}>
              <p className={`text-xs font-semibold ${active?"text-white":"text-foreground"}`}>{t.label}</p>
              <p className={`text-xs mt-0.5 font-mono ${active?"text-white/80":"text-muted-foreground"}`}>≥{t.min}</p>
              <p className={`text-sm font-bold mt-0.5 ${active?"text-white":"text-foreground"}`}>{t.price.toLocaleString()}</p>
              {t.discount>0 && <p className={`text-xs mt-0.5 ${active?"text-white/70":"text-emerald-600"}`}>−{t.discount}%</p>}
            </div>
          );
        })}
      </div>
      {totalQty>0 && totalQty<10 && <p className="text-xs text-amber-600 flex items-center gap-1"><Zap size={11} />Thêm {10-totalQty} bộ để đạt Sỉ cơ bản (−25%)</p>}
      {totalQty>=10 && totalQty<50 && <p className="text-xs text-accent flex items-center gap-1"><Zap size={11} />Thêm {50-totalQty} bộ để đạt Sỉ trung (−40%)</p>}
    </div>
  );
}

function B2BOrderTab() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [matrixQty, setMatrixQty] = useState<MatrixQty>({});
  const [payMethod, setPayMethod] = useState<"cash"|"credit">("cash");
  const sizes = selectedProduct.sizes; const colors = selectedProduct.colors;
  const totalQty = Object.values(matrixQty).reduce((s,v)=>s+v,0);
  const activeTier = PRICING_TIERS.find(t=>totalQty>=t.min&&totalQty<=t.max) ?? PRICING_TIERS[0];
  const totalAmount = totalQty * activeTier.price;
  const stockOf = (s:string,c:string) => (selectedProduct.stock as Record<string,number>)[`${s}-${c}`] ?? 0;
  const setCell = (s:string,c:string,v:number) => setMatrixQty(p=>({...p,[`${s}-${c}`]:Math.max(0,v)}));
  const sizeTotal = (s:string) => colors.reduce((a,c)=>a+(matrixQty[`${s}-${c}`]??0),0);
  const colorTotal = (c:string) => sizes.reduce((a,s)=>a+(matrixQty[`${s}-${c}`]??0),0);
  return (
    <div className="flex gap-5 h-full">
      <div className="w-52 shrink-0 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Chọn sản phẩm</p>
        {PRODUCTS.map(p => (
          <button key={p.id} onClick={() => { setSelectedProduct(p); setMatrixQty({}); }} className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${selectedProduct.id===p.id?"border-accent bg-accent/5 shadow-sm":"border-border bg-card hover:border-accent/40 hover:bg-muted/30"}`}>
            <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg shrink-0" />
            <div className="min-w-0"><p className="text-xs font-medium leading-snug line-clamp-2">{p.name}</p><p className="text-xs text-muted-foreground mt-0.5">{fmt(p.price)}</p></div>
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
          <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-20 object-cover rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{selectedProduct.category}</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold leading-snug">{selectedProduct.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedProduct.material}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">{selectedProduct.colors.length} màu · {selectedProduct.sizes.length} size</span>
              <span className="text-xs font-medium text-accent">Giá lẻ: {fmt(selectedProduct.price)}</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4"><TierProgress totalQty={totalQty} /></div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Bảng đặt hàng theo Size × Màu</h3>
            <button onClick={()=>setMatrixQty({})} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Xóa tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Size</th>
                  {colors.map(c=><th key={c} className="px-3 py-2.5 text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">{c}</th>)}
                  <th className="px-4 py-2.5 text-xs font-semibold text-center text-accent uppercase tracking-wider">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size,ri) => (
                  <tr key={size} className={`border-t border-border ${ri%2===1?"bg-muted/20":""}`}>
                    <td className="px-4 py-2"><span className="inline-flex items-center justify-center w-8 h-7 bg-primary text-primary-foreground text-xs font-bold rounded-md">{size}</span></td>
                    {colors.map(color => {
                      const qty=matrixQty[`${size}-${color}`]??0; const stock=stockOf(size,color); const over=qty>stock;
                      return (
                        <td key={color} className="px-2 py-1.5">
                          <div className="flex flex-col items-center gap-0.5">
                            <input type="number" min="0" max={stock} value={qty===0?"":qty} onChange={e=>setCell(size,color,parseInt(e.target.value)||0)} placeholder="0"
                              className={`w-14 text-center py-1 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 transition-colors ${over?"border-destructive bg-red-50 text-destructive":qty>0?"border-accent bg-accent/5 focus:ring-accent/30":"border-border bg-input-background focus:ring-accent/30 focus:border-accent"}`} />
                            <span className={`text-xs ${stock===0?"text-destructive":stock<=5?"text-amber-500":"text-muted-foreground"}`}>{stock===0?"Hết":`/${stock}`}</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center"><span className={`text-sm font-bold font-mono ${sizeTotal(size)>0?"text-accent":"text-muted-foreground"}`}>{sizeTotal(size)}</span></td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary/20 bg-primary/5">
                  <td className="px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase">Tổng/Màu</td>
                  {colors.map(c=><td key={c} className="px-3 py-2.5 text-center font-bold font-mono text-sm">{colorTotal(c)}</td>)}
                  <td className="px-4 py-2.5 text-center font-bold font-mono text-accent text-base">{totalQty}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="w-60 shrink-0 space-y-3">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-32">
          <h3 className="text-sm font-semibold mb-3">Tóm tắt đơn hàng</h3>
          {totalQty===0 ? (
            <div className="text-center py-6 text-muted-foreground"><Package size={28} className="mx-auto mb-2 opacity-30" /><p className="text-xs">Nhập số lượng vào bảng để bắt đầu</p></div>
          ) : (
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs">Tổng số lượng</span><span className="font-mono font-bold text-base">{totalQty} bộ</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs">Bậc giá</span><span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">{activeTier.label}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs">Đơn giá</span><span className="font-mono text-xs">{fmt(activeTier.price)}</span></div>
              {activeTier.discount>0 && <div className="flex justify-between items-center text-emerald-600"><span className="text-xs">Tiết kiệm</span><span className="text-xs font-medium">−{fmt((selectedProduct.price-activeTier.price)*totalQty)}</span></div>}
              <div className="border-t border-border pt-2.5 flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Thành tiền</span>
                <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold text-accent">{fmt(totalAmount)}</span>
              </div>
            </div>
          )}
          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thanh toán</p>
            {[{key:"cash",label:"Thanh toán ngay",sub:"Chuyển khoản / VNPay"},{key:"credit",label:"Ghi nợ",sub:"Còn hạn mức: 36.5tr"}].map(m=>(
              <label key={m.key} className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${payMethod===m.key?"border-accent bg-accent/5":"border-border hover:border-accent/40"}`}>
                <input type="radio" name="b2b-pay" checked={payMethod===m.key} onChange={()=>setPayMethod(m.key as any)} className="mt-0.5 accent-accent" />
                <div><p className="text-xs font-medium">{m.label}</p><p className="text-xs text-muted-foreground">{m.sub}</p></div>
              </label>
            ))}
          </div>
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-1.5">
            <AlertTriangle size={11} className="shrink-0 mt-0.5" />Hạn mức còn: <strong>36.5 triệu</strong>
          </div>
          <button disabled={totalQty===0} className="w-full mt-3 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
            {totalQty>0?`Đặt ${totalQty} bộ`:"Chưa chọn SP"} {totalQty>0&&<ArrowRight size={13} />}
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Công nợ hiện tại</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Đang nợ</span><span className="font-mono text-destructive font-medium">13.5 tr</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Hạn mức</span><span className="font-mono">50 tr</span></div>
            <div className="relative h-1.5 bg-muted rounded-full mt-2"><div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{width:"27%"}} /></div>
            <p className="text-muted-foreground">Đã dùng 27% hạn mức</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── B2B ORDER HISTORY ────────────────────────────────────────────────────────

const AGENT_ORDERS = [
  {
    id: "ORD-2024-002", date: "08/07/2026", status: "Đang xử lý", payStatus: "Chưa thanh toán",
    items: [
      { name: "Áo Polo ABC Classic", color: "Trắng", sizes: { S:5, M:10, L:8, XL:5 }, unitPrice: 140000 },
      { name: "Quần Jeans Slim Fit", color: "Xanh Indigo", sizes: { "30":6, "31":4, "32":4 }, unitPrice: 210000 },
    ],
    totalQty: 42, totalAmount: 13500000, note: "Giao trước 12/07",
  },
  {
    id: "ORD-2024-001", date: "01/07/2026", status: "Đã giao", payStatus: "Thanh toán một phần",
    items: [
      { name: "Áo Polo ABC Classic", color: "Đen", sizes: { M:20, L:15, XL:10 }, unitPrice: 140000 },
      { name: "Áo Sơ Mi Linen Premium", color: "Trắng kem", sizes: { S:10, M:10, L:5 }, unitPrice: 168000 },
    ],
    totalQty: 70, totalAmount: 9000000, note: "",
  },
  {
    id: "ORD-2023-045", date: "20/06/2026", status: "Hoàn thành", payStatus: "Đã thanh toán",
    items: [
      { name: "Đầm Floral Summer", color: "Hồng Pastel", sizes: { XS:5, S:10, M:8, L:5 }, unitPrice: 210000 },
    ],
    totalQty: 28, totalAmount: 6000000, note: "Đơn VIP tháng 6",
  },
  {
    id: "ORD-2023-040", date: "05/06/2026", status: "Đã hủy", payStatus: "Đã hoàn tiền",
    items: [
      { name: "Áo Khoác Bomber Unisex", color: "Đen", sizes: { M:10, L:8, XL:5 }, unitPrice: 280000 },
    ],
    totalQty: 23, totalAmount: 6440000, note: "Hủy do hết hàng",
  },
];

function B2BHistoryTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const statuses = ["Tất cả", "Đang xử lý", "Đã giao", "Hoàn thành", "Đã hủy"];
  const filtered = filterStatus === "Tất cả" ? AGENT_ORDERS : AGENT_ORDERS.filter(o => o.status === filterStatus);

  const totalSpent = AGENT_ORDERS.filter(o => o.status !== "Đã hủy").reduce((s, o) => s + o.totalAmount, 0);
  const totalQtyAll = AGENT_ORDERS.filter(o => o.status !== "Đã hủy").reduce((s, o) => s + o.totalQty, 0);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng đơn hàng", value: `${AGENT_ORDERS.filter(o=>o.status!=="Đã hủy").length} đơn`, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tổng sản phẩm đã nhận", value: `${totalQtyAll} bộ`, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tổng giá trị", value: fmt(totalSpent), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}><s.icon size={16} className={s.color} /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-lg">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Filter + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>
              {s}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-xs text-accent hover:underline">
          <Download size={12} /> Xuất Excel
        </button>
      </div>

      {/* Order list — expandable rows */}
      <div className="space-y-2.5">
        {filtered.map(order => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Order header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                  {/* ID + date */}
                  <div>
                    <p className="text-xs font-mono font-semibold text-accent">{order.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                  </div>
                  {/* Items summary */}
                  <div className="hidden md:block">
                    <p className="text-xs font-medium">{order.items.map(i => i.name.split(" ").slice(0, 2).join(" ")).join(", ")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.totalQty} bộ · {order.items.length} loại SP</p>
                  </div>
                  {/* Amount */}
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold">{fmt(order.totalAmount)}</p>
                  </div>
                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground w-14 shrink-0">Đơn:</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground w-14 shrink-0">Tiền:</span>
                      <StatusBadge status={order.payStatus} />
                    </div>
                  </div>
                  {/* Note */}
                  <div className="hidden md:block">
                    {order.note && (
                      <p className="text-xs text-muted-foreground italic truncate">"{order.note}"</p>
                    )}
                  </div>
                </div>
                <ChevronRight size={15} className={`text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-border bg-muted/20 px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chi tiết sản phẩm trong đơn</p>
                  {order.items.map((item, idx) => {
                    const qty = Object.values(item.sizes).reduce((a, b) => a + b, 0);
                    return (
                      <div key={idx} className="bg-card border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Màu: {item.color} · Đơn giá: {fmt(item.unitPrice)}/bộ</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{qty} bộ</p>
                            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold text-accent">{fmt(item.unitPrice * qty)}</p>
                          </div>
                        </div>
                        {/* Size breakdown */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.sizes).map(([size, count]) => (
                            <div key={size} className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                              <span className="text-xs font-bold text-foreground">{size}</span>
                              <span className="text-xs text-muted-foreground">×{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Order total footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      {order.status === "Đang xử lý" && (
                        <button className="text-xs px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-red-50 transition-colors">
                          Yêu cầu hủy đơn
                        </button>
                      )}
                      <button className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5">
                        <Download size={11} /> Tải phiếu đặt hàng
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Thanh toán:</span>
                        <StatusBadge status={order.payStatus} />
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-base font-bold text-accent">{fmt(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-xl py-12 text-center text-muted-foreground">
            <FileText size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Không có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

function B2BPortal({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<B2BTab>("order");
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold">ABC Fashion</span>
            <span className="ml-2 text-xs text-primary-foreground/40 uppercase tracking-widest">Cổng Đại lý</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs text-primary-foreground/60 mr-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5"><TrendingUp size={12} className="text-accent" /><span>Bậc: <strong className="text-white">Sỉ đại</strong></span></div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5"><CreditCard size={12} className="text-emerald-400" /><span>Hạn mức: <strong className="text-white">36.5tr</strong></span></div>
            </div>
            <div className="flex items-center gap-2.5 border-l border-primary-foreground/10 pl-4">
              <div className="text-right"><p className="text-sm font-semibold">ATMIN Fashion</p><p className="text-xs text-primary-foreground/50">AG-001 · Đại lý</p></div>
              <button onClick={()=>setProfileOpen(true)} className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold hover:bg-accent/90 transition-colors">A</button>
            </div>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-primary-foreground/40 hover:text-primary-foreground border-l border-primary-foreground/10 pl-4 transition-colors">
              <LogOut size={13} />Đăng xuất
            </button>
          </div>
        </div>
        <div className="flex px-6 border-t border-primary-foreground/10">
          {([{key:"order",label:"Đặt hàng Matrix",icon:Package},{key:"debt",label:"Công nợ",icon:CreditCard},{key:"history",label:"Lịch sử đơn",icon:FileText}] as {key:B2BTab;label:string;icon:any}[]).map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab===t.key?"border-accent text-white":"border-transparent text-primary-foreground/50 hover:text-primary-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </header>
      <div className="px-6 py-6">
        {activeTab==="order" && <B2BOrderTab />}
        {activeTab==="debt" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[{label:"Tổng công nợ",value:fmt(13500000),color:"text-destructive",bg:"bg-red-50 border-red-100",icon:CreditCard},{label:"Hạn mức còn lại",value:fmt(36500000),color:"text-emerald-700",bg:"bg-emerald-50 border-emerald-100",icon:CheckCircle},{label:"Đơn chưa TT",value:"3 đơn",color:"text-amber-700",bg:"bg-amber-50 border-amber-100",icon:Clock}].map((s,i)=>(
                <div key={i} className={`flex items-center gap-3.5 p-4 rounded-xl border ${s.bg}`}><s.icon size={20} className={s.color} /><div><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p></div></div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between"><h3 className="font-semibold text-sm">Lịch sử công nợ</h3><button className="text-xs text-accent hover:underline flex items-center gap-1"><Download size={12} /> Xuất Excel</button></div>
              <table className="w-full text-sm">
                <thead className="bg-muted/60"><tr>{["Mã đơn","Ngày","Giá trị","Đã trả","Còn nợ","Hạn TT","Trạng thái"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">
                  {[{id:"ORD-2024-002",date:"08/07",value:13500000,paid:0,due:"22/07/2026",status:"Chưa thanh toán"},{id:"ORD-2024-001",date:"01/07",value:9000000,paid:4500000,due:"15/07/2026",status:"Thanh toán một phần"},{id:"ORD-2023-045",date:"20/06",value:6000000,paid:6000000,due:"04/07/2026",status:"Đã thanh toán"}].map(row=>(
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-accent">{row.id}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.date}</td>
                      <td className="px-4 py-3 font-mono text-xs">{fmt(row.value)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-600">{fmt(row.paid)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-destructive font-semibold">{fmt(row.value-row.paid)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.due}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab==="history" && <B2BHistoryTab />}
      </div>
      {profileOpen && <ProfileModal onClose={()=>setProfileOpen(false)} />}
      <ChatWidget loggedInAs={{ name: "ATMIN Fashion", role: "agent" }} />
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

type AdminTab = "overview" | "orders" | "products" | "agents" | "promotions" | "users" | "inbox";

// ── Permission Matrix Component ──────────────────────────────────────────────

function PermissionMatrix({ perms, onChange, readOnly }: { perms: PermSet; onChange?: (p: PermSet) => void; readOnly?: boolean }) {
  const ACTION_LABELS: Record<string, string> = { view: "Xem", create: "Thêm", update: "Sửa", delete: "Xóa" };
  const ALL_ACTIONS = ["view", "create", "update", "delete"] as const;

  const toggle = (mod: string, action: string) => {
    if (readOnly || !onChange) return;
    const updated = { ...perms, [mod]: { ...perms[mod], [action]: !perms[mod]?.[action] } };
    if (!updated[mod]["view"] && action !== "view") {
      // auto-check view when enabling other perms
    }
    onChange(updated);
  };

  const toggleAll = (mod: string, checked: boolean) => {
    if (readOnly || !onChange) return;
    const m = PERMISSION_MODULES.find(m => m.key === mod)!;
    onChange({ ...perms, [mod]: Object.fromEntries(m.actions.map(a => [a, checked])) });
  };

  const allChecked = (mod: string) => {
    const m = PERMISSION_MODULES.find(m => m.key === mod)!;
    return m.actions.every(a => perms[mod]?.[a]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[40%]">Module / Chức năng</th>
            {ALL_ACTIONS.map(a => (
              <th key={a} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">{ACTION_LABELS[a]}</th>
            ))}
            {!readOnly && <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tất cả</th>}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((mod, ri) => (
            <tr key={mod.key} className={`border-t border-border ${ri % 2 === 1 ? "bg-muted/20" : "bg-card"}`}>
              <td className="px-4 py-3">
                <span className="text-sm font-medium">{mod.label}</span>
              </td>
              {ALL_ACTIONS.map(action => {
                const applicable = (mod.actions as readonly string[]).includes(action);
                const checked = applicable && !!perms[mod.key]?.[action];
                return (
                  <td key={action} className="px-3 py-3 text-center">
                    {applicable ? (
                      <button onClick={() => toggle(mod.key, action)} disabled={readOnly}
                        className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-all ${checked ? "bg-accent text-white" : "border-2 border-muted-foreground/30 hover:border-accent"} ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
                        {checked && <CheckCircle size={12} />}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </td>
                );
              })}
              {!readOnly && (
                <td className="px-3 py-3 text-center">
                  <button onClick={() => toggleAll(mod.key, !allChecked(mod.key))}
                    className={`w-5 h-5 rounded flex items-center justify-center mx-auto border-2 transition-all ${allChecked(mod.key) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary"}`}>
                    {allChecked(mod.key) && <CheckCircle size={12} />}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Staff Permission Modal ────────────────────────────────────────────────────

function StaffPermModal({ staff, onSave, onClose }: {
  staff: StaffMember; onSave: (id: string, perms: PermSet, meta: Partial<StaffMember>) => void; onClose: () => void;
}) {
  const [perms, setPerms] = useState<PermSet>(JSON.parse(JSON.stringify(staff.permissions)));
  const [meta, setMeta] = useState({ name: staff.name, email: staff.email, phone: staff.phone, jobTitle: staff.jobTitle });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"info" | "perms">("perms");

  const handleSave = () => {
    onSave(staff.id, perms, meta);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const applyPreset = (preset: keyof typeof STAFF_PRESETS) => {
    setPerms(JSON.parse(JSON.stringify(STAFF_PRESETS[preset])));
  };

  const totalPerms = countPerms(perms);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {staff.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-base">{staff.name}</h2>
              <p className="text-primary-foreground/50 text-xs">{staff.email} · {staff.jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-foreground/60 bg-white/10 px-2.5 py-1 rounded-full">
              {totalPerms} quyền đang cấp
            </span>
            <button onClick={onClose} className="text-primary-foreground/50 hover:text-primary-foreground p-1"><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-card">
          {[{ key: "perms", label: "Bảng phân quyền", icon: ShieldCheck }, { key: "info", label: "Thông tin nhân viên", icon: User }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {tab === "perms" && (
            <div>
              {/* Preset toolbar */}
              <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Áp dụng mẫu nhanh:</span>
                {Object.keys(STAFF_PRESETS).map(preset => (
                  <button key={preset} onClick={() => applyPreset(preset as any)}
                    className="text-xs px-3 py-1.5 border border-border bg-card rounded-lg hover:border-accent hover:text-accent transition-colors font-medium">
                    {preset}
                  </button>
                ))}
                <button onClick={() => setPerms(defaultPerms())}
                  className="text-xs px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-red-50 transition-colors ml-auto">
                  Xóa tất cả quyền
                </button>
              </div>

              <div className="px-2">
                <PermissionMatrix perms={perms} onChange={setPerms} />
              </div>

              {/* Legend */}
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-accent rounded flex items-center justify-center"><CheckCircle size={10} className="text-white" /></span>Đã cấp</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 border-2 border-muted-foreground/30 rounded" />Chưa cấp</span>
                <span className="flex items-center gap-1.5"><span className="text-muted-foreground/30">—</span>Không áp dụng</span>
              </div>
            </div>
          )}

          {tab === "info" && (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Họ và tên" icon={User} value={meta.name} onChange={v => setMeta(p => ({ ...p, name: v }))} />
                <InputField label="Chức danh" icon={Settings} value={meta.jobTitle} onChange={v => setMeta(p => ({ ...p, jobTitle: v }))} />
                <InputField label="Email" icon={Mail} type="email" value={meta.email} onChange={v => setMeta(p => ({ ...p, email: v }))} />
                <InputField label="Số điện thoại" icon={Phone} value={meta.phone} onChange={v => setMeta(p => ({ ...p, phone: v }))} />
              </div>
              <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex gap-2">
                <Info size={13} className="shrink-0 mt-0.5" />Để đặt lại mật khẩu cho nhân viên, hãy dùng chức năng "Gửi email đặt lại mật khẩu" hoặc liên hệ quản trị hệ thống.
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Lần đăng nhập cuối: <strong>{staff.lastLogin}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Hủy</button>
            <button onClick={handleSave}
              className={`text-sm px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              {saved ? <><CheckCircle size={14} /> Đã lưu</> : <><Save size={14} /> Lưu phân quyền</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AdminUsers ────────────────────────────────────────────────────────────────

function AdminUsers() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", phone: "", jobTitle: "" });

  const handleSavePerms = (id: string, perms: PermSet, meta: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...meta, permissions: perms } : s));
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động" } : s));
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) return;
    const s: StaffMember = {
      id: `ST-00${staff.length + 1}`, ...newStaff,
      status: "Hoạt động", lastLogin: "Chưa đăng nhập",
      permissions: defaultPerms(),
    };
    setStaff(prev => [...prev, s]);
    setNewStaff({ name: "", email: "", phone: "", jobTitle: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      {/* Header + Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Quản lý Nhân viên & Phân quyền RBAC</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tạo tài khoản nhân viên và cài đặt quyền truy cập từng module</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <UserPlus size={13} /> Thêm nhân viên
        </button>
      </div>

      {/* Add staff form */}
      {showAdd && (
        <div className="bg-card border border-accent/40 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><UserPlus size={15} className="text-accent" /> Tạo tài khoản nhân viên mới</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <InputField label="Họ và tên" icon={User} value={newStaff.name} onChange={v => setNewStaff(p => ({ ...p, name: v }))} required placeholder="Nguyễn Thị A" />
            <InputField label="Email" icon={Mail} type="email" value={newStaff.email} onChange={v => setNewStaff(p => ({ ...p, email: v }))} required placeholder="nv@abc.vn" />
            <InputField label="Số điện thoại" icon={Phone} value={newStaff.phone} onChange={v => setNewStaff(p => ({ ...p, phone: v }))} placeholder="09xx xxx xxx" />
            <InputField label="Chức danh" icon={Settings} value={newStaff.jobTitle} onChange={v => setNewStaff(p => ({ ...p, jobTitle: v }))} placeholder="Sales, Kế toán..." />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleAddStaff} className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><CheckCircle size={13} /> Tạo & Cài đặt quyền sau</button>
            <button onClick={() => setShowAdd(false)} className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Hủy</button>
            <p className="text-xs text-muted-foreground ml-2">Mật khẩu tạm sẽ được gửi qua email. Nhân viên cần đổi mật khẩu lần đầu đăng nhập.</p>
          </div>
        </div>
      )}

      {/* Permission overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng nhân viên", value: staff.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Đang hoạt động", value: staff.filter(s => s.status === "Hoạt động").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tạm khóa", value: staff.filter(s => s.status === "Tạm khóa").length, icon: Lock, color: "text-red-600", bg: "bg-red-50" },
          { label: "TB quyền/NV", value: Math.round(staff.reduce((s, m) => s + countPerms(m.permissions), 0) / staff.length), icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}><c.icon size={16} className={c.color} /></div>
            <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-lg">{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              {["Nhân viên", "Email", "Chức danh", "Quyền đã cấp", "Trạng thái", "Lần đăng nhập", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map(s => {
              const total = countPerms(s.permissions);
              const modules = PERMISSION_MODULES.filter(m => Object.values(s.permissions[m.key] ?? {}).some(Boolean));
              return (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.status === "Tạm khóa" ? "bg-red-100 text-red-600" : "bg-accent/15 text-accent"}`}>
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-muted text-foreground border border-border rounded-full font-medium">{s.jobTitle || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${total > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {total} quyền
                      </span>
                      {modules.slice(0, 2).map(m => (
                        <span key={m.key} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{m.label.split(" ").slice(0, 2).join(" ")}</span>
                      ))}
                      {modules.length > 2 && <span className="text-xs text-muted-foreground">+{modules.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditTarget(s)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary/5 border border-border text-primary rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-colors font-medium">
                        <ShieldCheck size={12} /> Phân quyền
                      </button>
                      <button onClick={() => handleToggleStatus(s.id)}
                        className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${s.status === "Hoạt động" ? "border-red-200 text-destructive hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                        {s.status === "Hoạt động" ? "Khóa" : "Mở"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role info */}
      <div className="bg-muted/40 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Info size={14} className="text-muted-foreground" />Hướng dẫn phân quyền</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          {[
            { title: "Nhân viên Kho", hint: "Cấp: Xem/Sửa Tồn kho + Xem/Sửa Đơn hàng" },
            { title: "Kế toán", hint: "Cấp: Xem Công nợ + Sửa Công nợ + Xem Báo cáo" },
            { title: "Sales", hint: "Cấp: Toàn bộ Đơn hàng + Xem/Duyệt Đại lý + Khuyến mãi" },
          ].map(r => (
            <div key={r.title} className="flex gap-2">
              <ChevronRight size={13} className="shrink-0 mt-0.5 text-accent" />
              <div><strong className="text-foreground">{r.title}:</strong> {r.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {editTarget && (
        <StaffPermModal staff={editTarget} onSave={handleSavePerms} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}

// ── Permission routing ────────────────────────────────────────────────────────

// Maps each AdminTab to the permission module key needed to view it (null = admin-only)
const TAB_PERM: Record<AdminTab, string | null> = {
  overview: "reports",
  orders: "orders",
  products: "products",
  agents: "agents",
  promotions: "promotions",
  inbox: "inbox",
  users: null, // admin-only, never granted to staff
};

// Demo "logged-in" staff account (OTP 000000 in login)
const DEMO_STAFF_ACCOUNT = INITIAL_STAFF[0]; // Trần Thị Bích – Sales

// ── Other Admin sections ──────────────────────────────────────────────────────

function AdminSidebar({
  tab, setTab, userRole, staffPerms,
}: {
  tab: AdminTab; setTab: (t: AdminTab) => void;
  userRole: AuthRole; staffPerms: PermSet;
}) {
  const isAdmin = userRole === "admin";

  const ALL_NAV = [
    { key: "overview" as AdminTab, icon: BarChart3, label: "Tổng quan", permKey: "reports" },
    { key: "orders" as AdminTab, icon: FileText, label: "Đơn hàng", permKey: "orders" },
    { key: "products" as AdminTab, icon: Package, label: "Sản phẩm & Kho", permKey: "products" },
    { key: "agents" as AdminTab, icon: Users, label: "Quản lý Đại lý", permKey: "agents" },
    { key: "promotions" as AdminTab, icon: Tag, label: "Khuyến mãi", permKey: "promotions" },
    { key: "inbox" as AdminTab, icon: MessageCircle, label: "Hỗ trợ Khách hàng", permKey: "inbox" },
  ];

  // Staff: only show nav items where they have view permission
  // Admin: show everything including users tab
  const visibleNav = isAdmin
    ? ALL_NAV
    : ALL_NAV.filter(item => !!staffPerms[item.permKey]?.view);

  const staffInfo = isAdmin
    ? { initials: "A", name: "Nguyễn Hữu Đức", role: "Quản trị viên (Admin)" }
    : { initials: DEMO_STAFF_ACCOUNT.name[0], name: DEMO_STAFF_ACCOUNT.name, role: DEMO_STAFF_ACCOUNT.jobTitle };

  const permCount = isAdmin ? "Toàn quyền" : `${countPerms(staffPerms)} quyền`;

  return (
    <aside className="w-56 bg-primary text-primary-foreground flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-primary-foreground/10">
        <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold italic">ABC Fashion</p>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-primary-foreground/30 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
            {isAdmin ? "Admin" : "Staff Portal"}
          </p>
          {!isAdmin && (
            <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">{permCount}</span>
          )}
        </div>
      </div>

      {/* Role badge for staff */}
      {!isAdmin && (
        <div className="mx-3 mt-3 p-2.5 bg-amber-500/10 border border-amber-400/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={11} className="text-amber-400" />
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Nhân viên</span>
          </div>
          <p className="text-xs text-primary-foreground/50 leading-relaxed">
            Menu hiển thị theo quyền được Admin cấp. Liên hệ Admin để mở thêm quyền.
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${tab === item.key ? "bg-accent text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10"}`}>
            <item.icon size={15} />
            <span className="flex-1">{item.label}</span>
            {item.key === "inbox" && (
              <span className="bg-destructive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
            )}
          </button>
        ))}

        {/* Admin-only: NV & Phân quyền */}
        {isAdmin && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-primary-foreground/25 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Nội bộ</p>
            </div>
            <button onClick={() => setTab("users")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${tab === "users" ? "bg-accent text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10"}`}>
              <ShieldCheck size={15} />NV & Phân quyền
            </button>
          </>
        )}

        {/* If staff has zero visible items */}
        {!isAdmin && visibleNav.length === 0 && (
          <div className="px-3 py-6 text-center">
            <Lock size={22} className="text-primary-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-primary-foreground/30">Chưa được cấp quyền xem bất kỳ module nào.</p>
          </div>
        )}
      </nav>

      {/* User info footer */}
      <div className="px-3 py-3 border-t border-primary-foreground/10">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin ? "bg-accent" : "bg-amber-500/70"}`}>
            {staffInfo.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{staffInfo.name}</p>
            <p className="text-xs text-primary-foreground/40 truncate">{staffInfo.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Doanh thu hôm nay", value: fmt(14350000), delta: "+12%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Đơn hàng mới", value: "28", delta: "+5 hôm nay", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "SKU sắp hết hàng", value: "7 SKU", delta: "Cần nhập kho", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Đại lý hoạt động", value: "12", delta: "+1 mới duyệt", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center shrink-0`}><card.icon size={15} className={card.color} /></div>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">{card.value}</p>
            <p className={`text-xs mt-1 ${card.color}`}>{card.delta}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-semibold text-sm">Doanh thu B2C vs B2B</h3><p className="text-xs text-muted-foreground">7 tháng gần nhất (triệu đồng)</p></div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent inline-block" />B2C</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary inline-block" />B2B</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_DATA} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}tr`} />
              <Tooltip formatter={(v: number) => [`${v} triệu`]} />
              <Bar dataKey="b2c" fill="#C9973A" radius={[3, 3, 0, 0]} name="B2C" />
              <Bar dataKey="b2b" fill="#1C1917" radius={[3, 3, 0, 0]} name="B2B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Trạng thái đơn hàng</h3>
          <div className="space-y-2.5">
            {[{label:"Chờ xử lý",count:8,color:"bg-amber-400",pct:28},{label:"Đang giao",count:12,color:"bg-blue-400",pct:43},{label:"Hoàn thành",count:6,color:"bg-emerald-400",pct:21},{label:"Đã hủy",count:2,color:"bg-red-400",pct:8}].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{item.label}</span><span className="font-medium">{item.count}</span></div>
                <div className="w-full bg-muted rounded-full h-1.5"><div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3">
            <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wider">Cảnh báo kho thấp</h4>
            <div className="space-y-1.5">
              {[{sku:"ABC-POLO-NV-XXL",stock:3},{sku:"FLORAL-YE-L",stock:2},{sku:"MAXI-WH-XL",stock:1}].map(a=>(
                <div key={a.sku} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{a.sku}</span>
                  <span className={`text-xs font-bold ${a.stock<=2?"text-destructive":"text-amber-600"}`}>{a.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between"><h3 className="font-semibold text-sm">Đơn hàng gần đây</h3><button className="text-xs text-accent hover:underline flex items-center gap-1">Xem tất cả <ChevronRight size={12} /></button></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã đơn","Khách hàng","Kênh","Số SP","Tổng tiền","Trạng thái",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {ORDERS_DATA.slice(0,5).map(o=>(
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-accent">{o.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{o.customer}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.type==="B2C"?"bg-blue-50 text-blue-700":"bg-purple-50 text-purple-700"}`}>{o.type}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.items} sp</td>
                <td className="px-4 py-3 font-mono text-sm font-medium">{fmt(o.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><button className="text-muted-foreground hover:text-foreground p-1"><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [filter, setFilter] = useState("Tất cả");
  const statuses = ["Tất cả","Chờ duyệt","Đang xử lý","Đang giao","Đã giao","Hoàn thành","Đã hủy"];
  const filtered = filter==="Tất cả" ? ORDERS_DATA : ORDERS_DATA.filter(o=>o.status===filter);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold">Quản lý đơn hàng</h2>
        <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Tìm đơn hàng..." className="text-xs pl-8 pr-3 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring w-48" /></div>
      </div>
      <div className="flex gap-1 flex-wrap">{statuses.map(s=><button key={s} onClick={()=>setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>{s}</button>)}</div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã đơn","Khách hàng","Kênh","Ngày","Số SP","Tổng tiền","Trạng thái",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o=>(
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-accent">{o.id}</td>
                <td className="px-4 py-3 font-medium text-sm">{o.customer}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.type==="B2C"?"bg-blue-50 text-blue-700":"bg-purple-50 text-purple-700"}`}>{o.type}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.date}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.items}</td>
                <td className="px-4 py-3 font-mono font-medium text-sm">{fmt(o.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3"><div className="flex gap-1.5"><button className="text-muted-foreground hover:text-foreground p-1"><Eye size={13} /></button><button className="text-muted-foreground hover:text-foreground p-1"><Edit size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className="text-center py-10 text-muted-foreground text-sm">Không có đơn hàng</div>}
      </div>
    </div>
  );
}

function AdminProducts() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Sản phẩm & Tồn kho</h2><button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Plus size={13} /> Thêm sản phẩm</button></div>
      <div className="space-y-3">
        {PRODUCTS.map(p=>{
          const total=Object.values(p.stock as Record<string,number>).reduce((s,v)=>s+v,0);
          const low=Object.values(p.stock as Record<string,number>).filter(v=>v<=5).length;
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
              <img src={p.image} alt={p.name} className="w-14 h-[72px] object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div><span className="text-xs text-muted-foreground">{p.category}</span><h3 className="font-semibold text-sm">{p.name}</h3><p className="text-xs text-muted-foreground">{p.material}</p></div>
                  <div className="flex items-center gap-2"><span style={{fontFamily:"'Playfair Display',serif"}} className="text-accent font-semibold text-sm">{fmt(p.price)}</span><button className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button><button className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button></div>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs"><strong>{total}</strong> <span className="text-muted-foreground">tổng kho</span></span>
                  <span className="text-xs text-muted-foreground">{p.colors.length} màu · {p.sizes.length} size</span>
                  {low>0 && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} />{low} SKU sắp hết</span>}
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11} />Đang bán</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminAgents() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Quản lý đại lý</h2><span className="text-xs text-amber-600 flex items-center gap-1"><Circle size={7} className="fill-amber-400 text-amber-400" />1 chờ duyệt</span></div>
      <div className="grid grid-cols-3 gap-4">
        {[{label:"Tổng công nợ",value:fmt(39500000),color:"text-destructive"},{label:"Nợ trong hạn",value:fmt(19500000),color:"text-amber-600"},{label:"Nợ quá hạn",value:fmt(20000000),color:"text-destructive font-bold"}].map((s,i)=>(
          <div key={i} className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className={`text-base font-mono font-semibold ${s.color}`}>{s.value}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã ĐL","Tên đại lý","Liên hệ","Hạn mức","Đã dùng","Đơn hàng","Trạng thái",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {AGENTS_DATA.map(a=>{const pct=(a.used/a.credit)*100;return(
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                <td className="px-4 py-3 font-medium text-sm">{a.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.contact}</td>
                <td className="px-4 py-3 font-mono text-xs">{fmt(a.credit)}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs text-destructive">{fmt(a.used)}</span><div className="w-20 bg-muted rounded-full h-1 mt-1"><div className={`h-1 rounded-full ${pct>=100?"bg-destructive":pct>=70?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${Math.min(pct,100)}%`}} /></div></td>
                <td className="px-4 py-3 font-mono text-sm">{a.orders}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3"><div className="flex gap-1.5">{a.status==="Chờ duyệt"&&<button className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">Duyệt</button>}<button className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button></div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPromotions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Khuyến mãi & Voucher</h2><button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Plus size={13} /> Tạo voucher</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{code:"ABC10",type:"Giảm %",value:"10%",minOrder:fmt(200000),used:47,total:100,expiry:"31/07/2026",status:"Hoạt động"},{code:"SALE50K",type:"Giảm tiền",value:fmt(50000),minOrder:fmt(300000),used:23,total:50,expiry:"15/07/2026",status:"Hoạt động"},{code:"NEWCUS",type:"Giảm %",value:"15%",minOrder:fmt(150000),used:50,total:50,expiry:"01/07/2026",status:"Đã hủy"}].map(v=>(
          <div key={v.code} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3"><div><div className="flex items-center gap-2 mb-0.5"><span className="font-mono text-base font-bold text-accent">{v.code}</span><StatusBadge status={v.status} /></div><p className="text-xs text-muted-foreground">{v.type} · Tối thiểu {v.minOrder}</p></div><span style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold">{v.value}</span></div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Đã dùng</span><span>{v.used}/{v.total} lượt</span></div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2.5"><div className="bg-accent h-1.5 rounded-full" style={{width:`${(v.used/v.total)*100}%`}} /></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Hết hạn: {v.expiry}</span><div className="flex gap-1.5"><button className="p-1 hover:text-foreground"><Edit size={12} /></button><button className="p-1 hover:text-destructive"><Trash2 size={12} /></button></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 403 screen shown when staff navigates to a tab they don't have access to
function Forbidden403({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16 px-8">
      <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-5">
        <Lock size={32} className="text-destructive" />
      </div>
      <p className="text-xs font-mono text-destructive/60 uppercase tracking-widest mb-2">403 Forbidden</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground mb-2">
        Không có quyền truy cập
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Tài khoản của bạn chưa được cấp quyền xem module <strong>"{tabLabel}"</strong>. Liên hệ Admin để được cấp quyền bổ sung.
      </p>
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 max-w-xs text-left space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={12} />Hành vi truy cập trái phép đã được ghi lại</p>
        <p>IP, trình duyệt và thời gian truy cập đã được lưu vào audit log.</p>
      </div>
    </div>
  );
}

function AdminDashboard({ userRole, onLogout }: { userRole: AuthRole; onLogout: () => void }) {
  const isAdmin = userRole === "admin";
  // For demo: staff uses DEMO_STAFF_ACCOUNT's permissions
  const staffPerms: PermSet = isAdmin
    ? Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, Object.fromEntries(m.actions.map(a => [a, true]))]))
    : DEMO_STAFF_ACCOUNT.permissions;

  // Determine starting tab: first visible tab for staff, overview for admin
  const firstAllowedTab = (): AdminTab => {
    if (isAdmin) return "overview";
    for (const [key, permKey] of Object.entries(TAB_PERM)) {
      if (permKey && staffPerms[permKey]?.view) return key as AdminTab;
    }
    return "overview"; // fallback (will show 403)
  };

  const [tab, setTab] = useState<AdminTab>(firstAllowedTab);

  // Tab label lookup for 403 screen
  const TAB_LABELS: Record<AdminTab, string> = {
    overview: "Tổng quan",
    orders: "Đơn hàng",
    products: "Sản phẩm & Kho",
    agents: "Quản lý Đại lý",
    promotions: "Khuyến mãi",
    inbox: "Hỗ trợ Khách hàng",
    users: "NV & Phân quyền",
  };

  // Check if current user can access this tab
  const canAccess = (t: AdminTab): boolean => {
    if (isAdmin) return true;
    const permKey = TAB_PERM[t];
    if (permKey === null) return false; // admin-only
    return !!staffPerms[permKey]?.view;
  };

  const content: Record<AdminTab, React.ReactNode> = {
    overview: <AdminOverview />,
    orders: <AdminOrders />,
    products: <AdminProducts />,
    agents: <AdminAgents />,
    promotions: <AdminPromotions />,
    inbox: <AdminInbox />,
    users: isAdmin ? <AdminUsers /> : <Forbidden403 tabLabel="NV & Phân quyền" />,
  };

  const staffInfo = isAdmin
    ? { initials: "A", name: "Nguyễn Hữu Đức", badge: "Admin" }
    : { initials: DEMO_STAFF_ACCOUNT.name[0], name: DEMO_STAFF_ACCOUNT.name, badge: DEMO_STAFF_ACCOUNT.jobTitle };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AdminSidebar tab={tab} setTab={setTab} userRole={userRole} staffPerms={staffPerms} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="shrink-0 bg-card border-b border-border px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{TAB_LABELS[tab]}</p>
            {!isAdmin && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Shield size={10} />Chế độ Nhân viên
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button className="relative p-1.5 hover:bg-muted rounded-lg transition-colors">
                <Bell size={16} /><span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-destructive rounded-full" />
              </button>
            )}
            {/* Staff permission summary pill */}
            {!isAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                <ShieldCheck size={12} className="text-accent" />
                <span>{countPerms(staffPerms)} quyền được cấp</span>
              </div>
            )}
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? "bg-accent" : "bg-amber-500"}`}>
                {staffInfo.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-none">{staffInfo.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{staffInfo.badge}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground hidden md:block">08/07/2026</p>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive border-l border-border pl-3 transition-colors">
              <LogOut size={13} />Đăng xuất
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {canAccess(tab) ? content[tab] : <Forbidden403 tabLabel={TAB_LABELS[tab]} />}
        </div>
      </main>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("auth-login");
  const [userRole, setUserRole] = useState<AuthRole>(null);

  const handleLogin = (role: AuthRole) => {
    setUserRole(role);
    setScreen("app");
  };

  const handleLogout = () => {
    setUserRole(null);
    setScreen("auth-login");
  };

  if (screen === "auth-login") {
    return <LoginPage onLogin={handleLogin} onGoRegister={() => setScreen("auth-register")} />;
  }
  if (screen === "auth-register") {
    return <RegisterPage onGoLogin={() => setScreen("auth-login")} />;
  }

  if (userRole === "customer") return <B2CPortal onLogout={handleLogout} />;
  if (userRole === "agent") return <B2BPortal onLogout={handleLogout} />;
  if (userRole === "admin" || userRole === "staff") return <AdminDashboard userRole={userRole} onLogout={handleLogout} />;

  return null;
}
