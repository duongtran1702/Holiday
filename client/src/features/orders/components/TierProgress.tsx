import { Zap } from "lucide-react";
import { PRICING_TIERS } from "../../../core/utils/mockData";

export function TierProgress({ totalQty }: Readonly<{ totalQty: number }>) {
  const current = PRICING_TIERS.find(t=>totalQty>=t.min&&totalQty<=t.max) ?? PRICING_TIERS[0];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Bậc giá theo số lượng</span>
        {totalQty>0 && <span className="font-medium text-accent">{totalQty} bộ đang chọn</span>}
      </div>
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border">
        {PRICING_TIERS.map(t => {
          const active = current.tier===t.tier && totalQty>0;
          return (
            <div key={t.tier} className={`flex-1 px-2.5 py-2.5 text-center border-r border-border last:border-0 transition-all ${active?"bg-accent text-white":"bg-card"}`}>
              <p className={`text-xs font-semibold ${active?"text-white":"text-foreground"}`}>{t.label}</p>
              <p className={`text-xs mt-0.5 font-mono ${active?"text-white/80":"text-muted-foreground"}`}>≥{t.min}</p>
              <p className={`text-sm font-bold mt-0.5 ${active?"text-white":"text-foreground"}`}>{t.price.toLocaleString()}</p>
              {t.discount>0 && <p className={`text-xs mt-0.5 ${active?"text-white/70":"text-emerald-600"}`}>−{t.discount}%</p>}
            </div>
          );
        })}
      </div>
      {totalQty>0 && totalQty<10 && <p className="text-xs text-amber-600 flex items-center gap-1"><Zap size={11} />Thêm {10-totalQty} bộ để đạt Sỉ cơ bản (−25%)</p>}
      {totalQty>=10 && totalQty<50 && <p className="text-xs text-accent flex items-center gap-1"><Zap size={11} />Thêm {50-totalQty} bộ để đạt Sỉ trung (−40%)</p>}
    </div>
  );
}
