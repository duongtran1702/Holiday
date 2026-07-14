import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOut, Shield, ShieldCheck } from "lucide-react";
import { countPerms } from "../util/helpers";
import { AdminSidebar } from "./AdminSidebar";
import { atminDispatch, atminSelector } from "../hook/reduxHook";
import { logout } from "../redux/slice/authSlice";
import { PERMISSION_MODULES } from "../util/mockData";
import { AuthRole, PermSet } from "../types/index";

export function LayoutAtmin() {
  const navigate = useNavigate();
  const dispatch = atminDispatch();
  const { userRole, user } = atminSelector((state) => state.auth);
  
  const isAdmin = userRole === "admin";
  const DEMO_STAFF_ACCOUNT = {
    name: "Trần Anh Vũ",
    jobTitle: "Chuyên viên QHKH",
    permissions: { orders: { view: true, edit: true, delete: false }, products: { view: true, edit: false, delete: false }, inbox: { view: true, edit: true, delete: false } }
  };

  const staffPerms: PermSet = isAdmin
    ? Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, Object.fromEntries(m.actions.map(a => [a, true]))]))
    : DEMO_STAFF_ACCOUNT.permissions;

  const staffInfo = isAdmin
    ? { initials: user?.fullName ? user.fullName[0] : "A", name: user?.fullName || "Admin User", badge: "Admin" }
    : { initials: user?.fullName ? user.fullName[0] : DEMO_STAFF_ACCOUNT.name[0], name: user?.fullName || DEMO_STAFF_ACCOUNT.name, badge: DEMO_STAFF_ACCOUNT.jobTitle };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AdminSidebar userRole={userRole} staffPerms={staffPerms} user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="shrink-0 bg-card border-b border-border px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive border-l border-border pl-3 transition-colors">
              <LogOut size={13} />Đăng xuất
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Outlet context={{ staffPerms, userRole }} />
        </div>
      </main>
    </div>
  );
}
