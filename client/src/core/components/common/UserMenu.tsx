import { useState, useEffect, useRef } from "react";
import { User, Lock, LogOut, Settings, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export function UserMenu({ onOpenProfile, onLogout }: { onOpenProfile: () => void; onLogout?: () => void }) {
  const user = useSelector((state: RootState) => state.auth.user);
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
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold overflow-hidden">
          {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U")}
        </div>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">{user?.fullName || "Người dùng"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email || "Chưa có email"}</p>
          </div>
          <div className="py-1">
            {[
              { icon: User, label: "Thông tin tài khoản", action: () => { onOpenProfile(); setOpen(false); } },
              { icon: Lock, label: "Đổi mật khẩu", action: () => { onOpenProfile(); setOpen(false); } },
              { icon: Settings, label: "Cài đặt", action: () => setOpen(false) },
            ].filter(item => !(item.label === "Đổi mật khẩu" && user?.authProvider === "GOOGLE"))
             .map(item => (
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