import { Users, ChevronRight, Eye, ShoppingBag, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboard.api";

export function AdminOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard_metrics'],
    queryFn: dashboardApi.getMetrics
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;
  if (error || !data?.data) return <div className="text-center text-red-500 py-10">Lỗi tải dữ liệu dashboard</div>;

  const metrics = data.data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Doanh thu hôm nay", value: fmt(metrics.todayRevenue), delta: "Hôm nay", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Đơn hàng mới", value: metrics.newOrders.toString(), delta: "Hôm nay", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "SKU sắp hết", value: `${metrics.lowStockSkuCount} SKU`, delta: "Cần nhập kho", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Khách hàng B2C", value: metrics.totalCustomers?.toString() || "0", delta: `+${metrics.newCustomersToday || 0} hôm nay`, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Đại lý B2B", value: metrics.activeAgents.toString(), delta: "Hoạt động", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
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
            <BarChart data={metrics.revenueChartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}M`} />
              <Tooltip formatter={(v: number) => [`${v}M`]} />
              <Bar dataKey="b2c" fill="#C9973A" radius={[3, 3, 0, 0]} name="B2C" />
              <Bar dataKey="b2b" fill="#1C1917" radius={[3, 3, 0, 0]} name="B2B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Trạng thái đơn hàng</h3>
          <div className="space-y-2.5">
            {metrics.orderStatusData.map((item: any) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{item.label}</span><span className="font-medium">{item.count}</span></div>
                <div className="w-full bg-muted rounded-full h-1.5"><div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3">
            <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wider">Cảnh báo kho thấp</h4>
            <div className="space-y-1.5">
              {metrics.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
                metrics.lowStockProducts.map((a: any) => (
                  <div key={a.sku} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{a.sku}</span>
                    <span className={`text-xs font-bold ${a.stock<=2?"text-destructive":"text-amber-600"}`}>{a.stock}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground italic">Không có cảnh báo.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between"><h3 className="font-semibold text-sm">Đơn hàng gần đây</h3><button className="text-xs text-accent hover:underline flex items-center gap-1">Xem tất cả <ChevronRight size={12} /></button></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã đơn","Ngày tạo","Số SP","Tổng tiền","Trạng thái","Vận chuyển",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {metrics.recentOrders.map(o=>(
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-accent">#{o.orderCode}</td>
                <td className="px-4 py-3 text-sm font-medium">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.items ? o.items.length : 0} sp</td>
                <td className="px-4 py-3 font-mono text-sm font-medium">{fmt(o.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status as any} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.status === 'CANCELLED' ? 'bg-gray-100 text-gray-400' :
                    o.shippingStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                    o.shippingStatus === 'SHIPPING' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {o.status === 'CANCELLED' ? 'Đã hủy' : o.shippingStatus === 'DELIVERED' ? 'Đã giao' : o.shippingStatus === 'SHIPPING' ? 'Đang giao' : 'Chưa giao'}
                  </span>
                </td>
                <td className="px-4 py-3"><button className="text-muted-foreground hover:text-foreground p-1"><Eye size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
