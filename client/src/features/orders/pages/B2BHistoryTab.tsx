import { useState } from "react";
import { Package, FileText, ChevronRight, DollarSign, Download } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { AGENT_ORDERS } from "../../../core/utils/mockData";

export function B2BHistoryTab() {
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
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
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
                  {order.items.map((item) => {
                    const qty = Object.values(item.sizes).reduce((a, b) => a + b, 0);
                    return (
                      <div key={`${item.name}-${item.color}`} className="bg-card border border-border rounded-xl p-4">
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
