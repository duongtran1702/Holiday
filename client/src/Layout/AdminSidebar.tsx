import { useLocation, useNavigate } from "react-router-dom";
import { User, Package, Users, FileText, Tag, BarChart3, Lock, Shield, ShieldCheck, MessageCircle } from "lucide-react";
import { AuthRole, PermSet } from "../types/index";
import { countPerms } from "../util/helpers";

const DEMO_STAFF_ACCOUNT = {
  name: "Trần Thị B",
  jobTitle: "Nhân viên Sales"
};

type AdminTab = "overview" | "orders" | "products" | "agents" | "promotions" | "inbox" | "users";

export function AdminSidebar({ userRole, staffPerms, user }: Readonly<{ userRole: AuthRole; staffPerms: PermSet; user: any }>) {
  const isAdmin = userRole === "admin";
  const location = useLocation();
  const navigate = useNavigate();

  const ALL_NAV = [
    { key: "dashboard" as AdminTab, icon: BarChart3, label: "Tổng quan", permKey: "reports" },
    { key: "orders" as AdminTab, icon: FileText, label: "Đơn hàng", permKey: "orders" },
    { key: "products" as AdminTab, icon: Package, label: "Sản phẩm & Kho", permKey: "products" },
    { key: "agents" as AdminTab, icon: Users, label: "Quản lý Đại lý", permKey: "agents" },
    { key: "promotions" as AdminTab, icon: Tag, label: "Khuyến mãi", permKey: "promotions" },
    { key: "inbox" as AdminTab, icon: MessageCircle, label: "Hỗ trợ Khách hàng", permKey: "inbox" },
  ];

  const visibleNav = isAdmin
    ? ALL_NAV
    : ALL_NAV.filter(item => !!staffPerms[item.permKey]?.view);

  const staffInfo = isAdmin
    ? { initials: user?.fullName ? user.fullName[0] : "A", name: user?.fullName || "Admin User", role: "Quản trị viên (Admin)" }
    : { initials: user?.fullName ? user.fullName[0] : "T", name: user?.fullName || "Nhân viên", role: "Chuyên viên QHKH" };

  const permCount = isAdmin ? "Toàn quyền" : `${countPerms(staffPerms)} quyền`;

  return (
    <aside className="w-56 bg-primary text-primary-foreground flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-primary-foreground/10">
        <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm font-bold italic">Holiday Fashion</p>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-primary-foreground/30 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
            {isAdmin ? "Admin" : "Staff Portal"}
          </p>
          {!isAdmin && (
            <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">{permCount}</span>
          )}
        </div>
      </div>

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

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => {
          const isActive = location.pathname.includes(item.key);
          return (
            <button key={item.key} onClick={() => navigate(`/admin/${item.key}`)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${isActive ? "bg-accent text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10"}`}>
              <item.icon size={15} />
              <span className="flex-1">{item.label}</span>
              {item.key === "inbox" && (
                <span className="bg-destructive text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
              )}
            </button>
          )
        })}

        {isAdmin && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-primary-foreground/25 text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>Nội bộ</p>
            </div>
            <button onClick={() => navigate("/admin/users")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${location.pathname.includes("users") ? "bg-accent text-white" : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10"}`}>
              <ShieldCheck size={15} />NV & Phân quyền
            </button>
          </>
        )}

        {!isAdmin && visibleNav.length === 0 && (
          <div className="px-3 py-6 text-center">
            <Lock size={22} className="text-primary-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-primary-foreground/30">Chưa được cấp quyền xem bất kỳ module nào.</p>
          </div>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-primary-foreground/10">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin ? "bg-accent" : "bg-amber-500/70"}`}>
            {staffInfo.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{staffInfo.name}</p>
            <p className="text-[10px] text-primary-foreground/50 truncate mt-0.5">{staffInfo.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}