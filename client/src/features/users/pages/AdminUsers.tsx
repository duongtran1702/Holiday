import { User, Users, CheckCircle, Lock, Settings, Phone, Mail, ShieldCheck, UserPlus, Info } from "lucide-react";
import { PERMISSION_MODULES } from "../../../core/utils/mockData";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { countPerms } from "../../../core/utils/helpers";
import { InputField } from "../../../core/components/common/InputField";
import { StaffPermModal } from "../../../core/components/common/StaffPermModal";
import { useAdminUsers } from "../hooks/useAdminUsers";

export function AdminUsers() {
  const {
    staff,
    editTarget, setEditTarget,
    showAdd, setShowAdd,
    newStaff, setNewStaff,
    statusFilter, setStatusFilter,
    isSubmitting,
    isStaffLoading,
    handleSavePerms,
    handleToggleStatus,
    handleAddStaff,
    filteredStaff
  } = useAdminUsers();

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
            <button onClick={handleAddStaff} disabled={isSubmitting} className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircle size={13} /> {isSubmitting ? "Đang tạo..." : "Tạo & Cài đặt quyền sau"}</button>
            <button onClick={() => setShowAdd(false)} disabled={isSubmitting} className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Hủy</button>
            <p className="text-xs text-muted-foreground ml-2">Mật khẩu tạm sẽ được gửi qua email. Nhân viên cần đổi mật khẩu lần đầu đăng nhập.</p>
          </div>
        </div>
      )}

      {/* Permission overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng nhân viên", value: staff.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Đang hoạt động", value: staff.filter((s: any) => s.status === "Hoạt động").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tạm khóa", value: staff.filter((s: any) => s.status === "Tạm khóa").length, icon: Lock, color: "text-red-600", bg: "bg-red-50" },
          { label: "TB quyền/NV", value: Math.round(staff.reduce((s: number, m: any) => s + countPerms(m.permissions), 0) / Math.max(1, staff.length)), icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}><c.icon size={16} className={c.color} /></div>
            <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-lg">{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-6 px-5 py-3 border-b border-border bg-muted/10">
          {(["Tất cả", "Hoạt động", "Tạm khóa"] as const).map(tab => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`text-sm font-medium transition-colors relative pb-1 ${statusFilter === tab ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
              {statusFilter === tab && <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-accent rounded-t" />}
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
            {isStaffLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Đang tải dữ liệu nhân viên...</td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Không có nhân viên nào trong danh sách này.</td>
              </tr>
            ) : filteredStaff.map((s: any) => {
              const total = countPerms(s.permissions);
              const modules = PERMISSION_MODULES.filter(m => Object.values(s.permissions[m.key] ?? {}).some(Boolean));
              return (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.status === "Tạm khóa" ? "bg-red-100 text-red-600" : "bg-accent/15 text-accent"}`}>
                        {s.name[0]}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="font-medium text-sm truncate" title={s.name}>{s.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate" title={s.id}>#{s.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-muted/80 text-foreground border border-border rounded-md font-medium whitespace-nowrap">{s.jobTitle || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${total > 0 ? "bg-accent/10 text-accent border border-accent/20" : "bg-muted text-muted-foreground border border-border"}`}>
                        {total} quyền
                      </span>
                      {(() => {
                        const shortLabels: Record<string, string> = { products: "Sản phẩm", inventory: "Kho", orders: "Đơn hàng", agents: "Đại lý", debts: "Công nợ", promotions: "Voucher", reports: "Báo cáo", inbox: "CSKH" };
                        return modules.slice(0, 2).map(m => (
                          <span key={m.key} className="text-[11px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded whitespace-nowrap">{shortLabels[m.key] || m.key}</span>
                        ));
                      })()}
                      {modules.length > 2 && <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">+{modules.length - 2} module</span>}
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
      <div className="bg-muted/20 border border-border rounded-xl overflow-hidden mt-2">
        <div className="bg-muted/40 px-5 py-3.5 border-b border-border flex items-center gap-2">
          <Info size={16} className="text-accent" />
          <h3 className="text-sm font-semibold">Gợi ý phân quyền theo bộ phận (Mẫu nhanh)</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Kế toán", icon: "💰", hint: "Chỉ tập trung vào dòng tiền. Được cấp quyền xem/sửa công nợ và xem báo cáo doanh thu." },
            { title: "Nhân viên Kho", icon: "📦", hint: "Quản lý luân chuyển hàng hóa. Được cấp quyền xem/sửa tồn kho và cập nhật đơn hàng." },
            { title: "Sales", icon: "🤝", hint: "Phát triển kinh doanh. Được quyền xử lý toàn bộ đơn hàng, đại lý và tạo khuyến mãi." },
            { title: "CSKH", icon: "🎧", hint: "Hỗ trợ khách hàng. Chỉ cấp quyền chat inbox, xem (nhưng không sửa) đơn hàng & khuyến mãi." },
            { title: "Quản lý (Full)", icon: "👑", hint: "Toàn quyền quản lý các nghiệp vụ hàng ngày (Sản phẩm, Kho, Đơn hàng, Đại lý...), trừ cài đặt hệ thống lõi." },
          ].map(r => (
            <div key={r.title} className="bg-card border border-border/80 rounded-lg p-4 shadow-sm hover:border-accent/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-lg bg-muted/50 w-8 h-8 flex items-center justify-center rounded-md">{r.icon}</span>
                <strong className="text-sm text-foreground">{r.title}</strong>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.hint}</p>
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
