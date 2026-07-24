import { Users, CheckCircle, Lock } from "lucide-react";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { useAdminCustomers } from "../hooks/useAdminCustomers";

export function AdminCustomers() {
  const {
    customers,
    statusFilter, setStatusFilter,
    handleToggleStatus,
    filteredCustomers,
    isCustomersLoading
  } = useAdminCustomers();

  return (
    <div className="space-y-5">
      {/* Header + Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Quản lý Khách hàng (B2C)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Quản lý tài khoản khách hàng đăng ký mua sắm trên hệ thống</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Tổng khách hàng", value: customers.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Đang hoạt động", value: customers.filter(s => s.status === "active").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tạm khóa", value: customers.filter(s => s.status === "inactive").length, icon: Lock, color: "text-red-600", bg: "bg-red-50" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}><c.icon size={16} className={c.color} /></div>
            <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="font-bold text-lg">{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Table */}
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
              {["Khách hàng", "Email", "Số điện thoại", "Trạng thái", "Hành động"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isCustomersLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Không có khách hàng nào trong danh sách này.</td>
              </tr>
            ) : filteredCustomers.map(s => {
              return (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.status === "inactive" ? "bg-red-100 text-red-600" : "bg-accent/15 text-accent"}`}>
                        {s.fullName?.[0] || '?'}
                      </div>
                      <div className="max-w-[150px]">
                        <p className="font-medium text-sm truncate" title={s.fullName}>{s.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate" title={s.id}>#{s.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.phoneNumber || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status === "active" ? "Hoạt động" : "Tạm khóa"} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleStatus(s.id)}
                      className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${s.status === "active" ? "border-red-200 text-destructive hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                      {s.status === "active" ? "Khóa" : "Mở"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
