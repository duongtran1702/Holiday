import { Edit, Circle, Loader2 } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { useAdminAgents } from "../hooks/useAdminAgents";

export function AdminAgents() {
  const { agents, loading, summary } = useAdminAgents();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Quản lý đại lý</h2><span className="text-xs text-amber-600 flex items-center gap-1"><Circle size={7} className="fill-amber-400 text-amber-400" />1 chờ duyệt</span></div>
      <div className="grid grid-cols-3 gap-4">
        {[{label:"Tổng công nợ",value:fmt(summary.totalDebt),color:"text-destructive"},{label:"Nợ trong hạn",value:fmt(summary.inTermDebt),color:"text-amber-600"},{label:"Nợ quá hạn",value:fmt(summary.overdueDebt),color:"text-destructive font-bold"}].map((s,i)=>(
          <div key={i} className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className={`text-base font-mono font-semibold ${s.color}`}>{s.value}</p></div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã ĐL","Tên đại lý","Liên hệ","Hạn mức","Đã dùng","Đơn hàng","Trạng thái",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center"><Loader2 className="animate-spin text-primary inline-block" /></td></tr>
            ) : agents.map(a=>{const pct=(a.used/a.credit)*100;return(
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                <td className="px-4 py-3 font-medium text-sm">{a.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.contact}</td>
                <td className="px-4 py-3 font-mono text-xs">{fmt(a.credit)}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs text-destructive">{fmt(a.used)}</span><div className="w-20 bg-muted rounded-full h-1 mt-1"><div className={`h-1 rounded-full ${pct>=100?"bg-destructive":pct>=70?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${Math.min(pct,100)}%`}} /></div></td>
                <td className="px-4 py-3 font-mono text-sm">{a.orders}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3"><div className="flex gap-1.5">{a.status==="Chờ duyệt"&&<button className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">Duyệt</button>}<button className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button></div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
