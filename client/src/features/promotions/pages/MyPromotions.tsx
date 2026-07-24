import { useEffect, useState } from "react";
import { promotionService, UserVoucher } from "../services/promotionService";
import { fmt } from "../../../core/utils/format";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export function MyPromotions() {
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await promotionService.getMyVouchers();
      setVouchers(res || []);
    } catch (error) {
      toast.error("Không thể tải ví voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await promotionService.deleteMyVoucher(id);
      toast.success("Đã xoá voucher khỏi ví");
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error) {
      toast.error("Không thể xoá voucher");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ví Voucher của tôi</h1>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Đang tải ví voucher...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.length === 0 && <div className="text-muted-foreground">Bạn chưa có voucher nào.</div>}
          
          {vouchers.map((item) => {
            const v = item.promotion;
            const isPercent = v.type === "PERCENT";
            const valueStr = isPercent ? `${v.discountPercentage}%` : fmt(v.discountAmount || 0);
            
            // Check if expired or used
            let isExpired = false;
            if (v.expiryDate && new Date(v.expiryDate).getTime() < Date.now()) {
              isExpired = true;
            }
            
            const isUsed = item.status === "USED";
            const isOutOfLimit = v.usageLimit ? v.usedCount >= v.usageLimit : false;
            
            const isDisabled = isExpired || isUsed || isOutOfLimit;

            let expiryStr = "Không giới hạn";
            if (v.expiryDate) {
              const d = new Date(v.expiryDate);
              expiryStr = d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'});
            }

            return (
              <div 
                key={item.id} 
                className={`flex border rounded-xl overflow-hidden shadow-sm transition-all ${
                  isDisabled ? 'opacity-50 grayscale bg-muted/30 border-muted' : 'bg-card border-border hover:shadow-md'
                }`}
              >
                {/* Left ticket part (discount value) */}
                <div className={`w-1/3 flex flex-col items-center justify-center p-4 text-primary-foreground ${isDisabled ? 'bg-muted-foreground/30' : 'bg-primary'}`}>
                  <span className="text-sm font-medium mb-1">{isPercent ? "Giảm" : "Tặng"}</span>
                  <span className="text-2xl font-bold leading-none mb-1">{valueStr}</span>
                  <span className="text-[10px] text-center opacity-80 mt-2 line-clamp-2">Đơn tối thiểu {fmt(v.minOrderValue)}</span>
                </div>
                
                {/* Right ticket part (details and action) */}
                <div className="w-2/3 p-4 flex flex-col justify-between border-l border-dashed border-border relative">
                  {/* Half circles for ticket effect */}
                  <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-full ${isDisabled ? 'bg-background' : 'bg-background'}`} />
                  <div className={`absolute -left-2 -bottom-2 w-4 h-4 rounded-full ${isDisabled ? 'bg-background' : 'bg-background'}`} />
                  
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-accent">{v.code}</span>
                      {isDisabled && (
                        <span className="text-[10px] bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded uppercase font-semibold">
                          {isUsed ? 'Đã dùng' : isExpired ? 'Hết hạn' : 'Hết lượt'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">HSD: {expiryStr}</p>
                    
                    {v.usageLimit && (
                      <p className="text-[10px] text-muted-foreground">Còn {v.usageLimit - v.usedCount} lượt</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    {isDisabled ? (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 text-xs text-destructive hover:underline p-1"
                      >
                        <Trash2 size={12} /> Xoá
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate('/b2c')}
                        className="bg-accent text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-accent/90 transition-colors"
                      >
                        Dùng ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
