import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { promotionService, Promotion } from "../services/promotionService";
import { PromotionFormModal } from "../components/PromotionFormModal";
import { toast } from "sonner";

export function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Quản lý Khuyến mãi & Voucher</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={13} /> Tạo voucher
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {promotions.length === 0 && <div className="text-sm text-muted-foreground">Chưa có voucher nào.</div>}
          {promotions.map((v) => {
            const isPercent = v.type === "PERCENT";
            const valueStr = isPercent ? `${v.discountPercentage}%` : fmt(v.discountAmount || 0);
            
            // Tính % sử dụng
            const usagePercent = v.usageLimit ? Math.min((v.usedCount / v.usageLimit) * 100, 100) : 0;
            
            let expiryStr = "Không giới hạn";
            if (v.expiryDate) {
              const d = new Date(v.expiryDate);
              expiryStr = d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
            }

            return (
              <div key={v.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-base font-bold text-accent">{v.code}</span>
                      <StatusBadge status={v.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPercent ? "Giảm %" : "Giảm tiền"} · Tối thiểu {fmt(v.minOrderValue)}
                    </p>
                  </div>
                  <span style={{fontFamily:"'Playfair Display',serif"}} className="text-xl font-bold">{valueStr}</span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Đã dùng</span>
                  <span>{v.usedCount} / {v.usageLimit ? v.usageLimit : '∞'} lượt</span>
                </div>
                
                {v.usageLimit && (
                  <div className="w-full bg-muted rounded-full h-1.5 mb-2.5">
                    <div className="bg-accent h-1.5 rounded-full transition-all" style={{width: `${usagePercent}%`}} />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span className="truncate">Hạn: {expiryStr}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {v.targetType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PromotionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPromotions} 
      />
    </div>
  );
}
