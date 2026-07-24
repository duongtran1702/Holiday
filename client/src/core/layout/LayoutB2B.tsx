import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Package, FileText, CreditCard, LogOut, TrendingUp } from "lucide-react";
import { atminDispatch } from "../store/reduxHook";
import { logout } from "../../features/auth";

export function LayoutB2B() {
  const navigate = useNavigate();
  const dispatch = atminDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold">Holiday Fashion</span>
            <span className="ml-2 text-xs text-primary-foreground/40 uppercase tracking-widest">Cổng Đại lý</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs text-primary-foreground/60 mr-2">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5"><TrendingUp size={12} className="text-accent" /><span>Bậc: <strong className="text-white">Sói Đói</strong></span></div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5"><CreditCard size={12} className="text-emerald-400" /><span>Hạn mức: <strong className="text-white">36.5tr</strong></span></div>
            </div>
            <div className="flex items-center gap-2.5 border-l border-primary-foreground/10 pl-4">
              <div className="text-right"><p className="text-sm font-semibold">Holiday Fashion</p><p className="text-xs text-primary-foreground/50">AG-001 | Đại lý</p></div>
              <button className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold hover:bg-accent/90 transition-colors">A</button>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-primary-foreground/40 hover:text-primary-foreground border-l border-primary-foreground/10 pl-4 transition-colors">
              <LogOut size={13} />Đăng xuất
            </button>
          </div>
        </div>
        <div className="flex px-6 border-t border-primary-foreground/10">
          <button onClick={()=>navigate("/b2b/portal")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${isActive("portal")?"border-accent text-white":"border-transparent text-primary-foreground/50 hover:text-primary-foreground"}`}>
            <Package size={14} />Đặt hàng Matrix
          </button>
          <button onClick={()=>navigate("/b2b/tier")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${isActive("tier")?"border-accent text-white":"border-transparent text-primary-foreground/50 hover:text-primary-foreground"}`}>
            <TrendingUp size={14} />Tiến trình
          </button>
          <button onClick={()=>navigate("/b2b/history")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${isActive("history")?"border-accent text-white":"border-transparent text-primary-foreground/50 hover:text-primary-foreground"}`}>
            <FileText size={14} />Lịch sử đơn
          </button>
        </div>
      </header>
      <div className="px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
}
