import { Plus, Edit, Trash2 } from "lucide-react";
import { fmt } from "../../util/format";
import { StatusBadge } from "../../components/common/StatusBadge";

export function AdminPromotions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Khuyến mãi & Voucher</h2><button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Plus size={13} /> Tạo voucher</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{code:"ATMIN10",type:"Giảm %",value:"10%",minOrder:fmt(200000),used:47,total:100,expiry:"31/07/2026",status:"Hoạt động"},{code:"SALE50K",type:"Giảm tiền",value:fmt(50000),minOrder:fmt(300000),used:23,total:50,expiry:"15/07/2026",status:"Hoạt động"},{code:"NEWCUS",type:"Giảm %",value:"15%",minOrder:fmt(150000),used:50,total:50,expiry:"01/07/2026",status:"Đã hủy"}].map(v=>(
          <div key={v.code} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-3"><div><div className="flex items-center gap-2 mb-0.5"><span className="font-mono text-base font-bold text-accent">{v.code}</span><StatusBadge status={v.status} /></div><p className="text-xs text-muted-foreground">{v.type} · Tối thiểu {v.minOrder}</p></div><span style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold">{v.value}</span></div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Đã dùng</span><span>{v.used}/{v.total} lượt</span></div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2.5"><div className="bg-accent h-1.5 rounded-full" style={{width:`${(v.used/v.total)*100}%`}} /></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Hết hạn: {v.expiry}</span><div className="flex gap-1.5"><button className="p-1 hover:text-foreground"><Edit size={12} /></button><button className="p-1 hover:text-destructive"><Trash2 size={12} /></button></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
