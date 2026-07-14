import React, { useState } from "react";
import { User, Users, CheckCircle, ChevronRight, Lock, Settings, Phone, Mail, ShieldCheck, UserPlus, Info } from "lucide-react";
import { PermSet, StaffMember } from "../../types/index";
import { PERMISSION_MODULES, defaultPerms, INITIAL_STAFF } from "../../util/mockData";
import { StatusBadge } from "../../components/common/StatusBadge";
import { countPerms } from "../../util/helpers";
import { InputField } from "../../components/common/InputField";
import { StaffPermModal } from "../../components/common/StaffPermModal";

import { toast } from "sonner";
import { callApi } from "../../util/callApi";

export function AdminUsers() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", phone: "", jobTitle: "" });

  const [statusFilter, setStatusFilter] = useState<"Tất cả" | "Hoạt động" | "Tạm khóa">("Tất cả");

  const handleSavePerms = (id: string, perms: PermSet, meta: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...meta, permissions: perms } : s));
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động" } : s));
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email) return;
    try {
      await callApi("/admin/users/staff", "POST", {
        fullName: newStaff.name,
        email: newStaff.email,
        phoneNumber: newStaff.phone
      });
      toast.success("Tạo tài khoản và gửi email thành công!");
      
      const s: StaffMember = {
        id: `ST-00${staff.length + 1}`, ...newStaff,
        status: "Hoạt động", lastLogin: "Chưa đăng nhập",
        permissions: defaultPerms(),
      };
      setStaff(prev => [...prev, s]);
      setNewStaff({ name: "", email: "", phone: "", jobTitle: "" });
      setShowAdd(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản");
    }
  };

  const filteredStaff = staff.filter(s => statusFilter === "Tất cả" || s.status === statusFilter);

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
            <InputField label="Email" icon={Mail} type="email" value={newStaff.email} onChange={v => setNewStaff(p => ({ ...p, email: v }))} required placeholder="nv@atmin.vn" />
            <InputField label="Số điện thoại" icon={Phone} value={newStaff.phone} onChange={v => setNewStaff(p => ({ ...p, phone: v }))} placeholder="09xx xxx xxx" />
            <InputField label="Chức danh" icon={Settings} value={newStaff.jobTitle} onChange={v => setNewStaff(p => ({ ...p, jobTitle: v }))} placeholder="Chọn chức danh..." options={["Nhân viên Sales", "Kế toán trưởng", "Thủ kho", "Nhân viên CSKH", "Trưởng phòng", "Giám đốc"]} />
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
          { label: "TB quyền/NV", value: Math.round(staff.reduce((s, m) => s + countPerms(m.permissions), 0) / Math.max(1, staff.length)), icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}><c.icon size={16} className={c.color} /></div>
            <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-lg">{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/20">
          {(["Tất cả", "Hoạt động", "Tạm khóa"] as const).map(tab => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`text-sm font-medium pb-1 transition-colors relative ${statusFilter === tab ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
              {statusFilter === tab && <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              {["Nhân viên", "Email", "Chức danh", "Quyền đã cấp", "Trạng thái", "Lần đăng nhập", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Không có nhân viên nào trong danh sách này.</td>
              </tr>
            ) : filteredStaff.map(s => {
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
