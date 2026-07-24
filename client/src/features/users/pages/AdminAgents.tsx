import { useState } from "react";
import { Edit, Circle, Loader2, X, DollarSign, CheckCircle } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { useAdminAgents } from "../hooks/useAdminAgents";

export function AdminAgents() {
  const { agents, loading, summary, approveAgent, updateCredit } = useAdminAgents();
  const [editAgent, setEditAgent] = useState<any>(null);
  const [creditInput, setCreditInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (agent: any) => {
    setEditAgent(agent);
    setCreditInput(agent.credit.toString());
  };

  const handleSaveCredit = async () => {
    setIsSaving(true);
    try {
      await updateCredit(editAgent.id, Number(creditInput) || 0);
      setEditAgent(null);
    } finally {
      setIsSaving(false);
    }
  };
  
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
                <td className="px-4 py-3"><div className="flex gap-1.5">{a.status==="PENDING"&&<button onClick={() => approveAgent(a.id)} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">Duyệt</button>}<button onClick={() => handleEditClick(a)} className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button></div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>

      {editAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Cập nhật hạn mức công nợ</h3>
              <button onClick={() => setEditAgent(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Đại lý</p>
                <p className="font-medium">{editAgent.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hạn mức mới (VNĐ)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"><DollarSign size={15} /></div>
                  <input type="number" value={creditInput} onChange={e => setCreditInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    placeholder="VD: 50000000" />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setEditAgent(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Hủy</button>
              <button onClick={handleSaveCredit} disabled={isSaving} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-70">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
