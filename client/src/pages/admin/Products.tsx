import { Plus, CheckCircle, Edit, Trash2, AlertTriangle } from "lucide-react";
import { PRODUCTS } from "../../util/mockData";
import { fmt } from "../../util/format";

export function AdminProducts() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Sản phẩm & Tồn kho</h2><button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Plus size={13} /> Thêm sản phẩm</button></div>
      <div className="space-y-3">
        {PRODUCTS.map(p=>{
          const total=Object.values(p.stock as unknown as Record<string,number>).reduce((s,v)=>s+v,0);
          const low=Object.values(p.stock as unknown as Record<string,number>).filter(v=>v<=5).length;
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
              <img src={p.image} alt={p.name} className="w-14 h-[72px] object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div><span className="text-xs text-muted-foreground">{p.category}</span><h3 className="font-semibold text-sm">{p.name}</h3><p className="text-xs text-muted-foreground">{p.material}</p></div>
                  <div className="flex items-center gap-2"><span style={{fontFamily:"'Playfair Display',serif"}} className="text-accent font-semibold text-sm">{fmt(p.price)}</span><button className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button><button className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button></div>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs"><strong>{total}</strong> <span className="text-muted-foreground">tổng kho</span></span>
                  <span className="text-xs text-muted-foreground">{p.colors.length} màu · {p.sizes.length} size</span>
                  {low>0 && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} />{low} SKU sắp hết</span>}
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11} />Đang bán</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
