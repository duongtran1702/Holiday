import { useState } from "react";
import { Search, Eye, Edit } from "lucide-react";
import { ORDERS_DATA } from "../../../core/utils/mockData";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";

export function AdminOrders() {
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
