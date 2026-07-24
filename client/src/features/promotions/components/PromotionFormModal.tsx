import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../core/components/ui/overlay/Dialog';
import { Button } from '../../../core/components/ui/forms/Button';
import { Input } from '../../../core/components/ui/forms/Input';
import { promotionService, PromotionCreateReq, Promotion } from '../services/promotionService';
import { toast } from 'sonner';

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Promotion | null;
}

export function PromotionFormModal({ isOpen, onClose, onSuccess, initialData }: PromotionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PromotionCreateReq>({
    code: '',
    type: 'PERCENT',
    discountPercentage: 0,
    discountAmount: 0,
    minOrderValue: 0,
    targetType: 'ALL',
    expiryDate: null,
    usageLimit: null,
    specificEmails: ''
  });

  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasLimit, setHasLimit] = useState(false);

  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        code: initialData.code,
        type: initialData.type,
        discountPercentage: initialData.discountPercentage || 0,
        discountAmount: initialData.discountAmount || 0,
        minOrderValue: initialData.minOrderValue,
        targetType: initialData.targetType,
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : null,
        usageLimit: initialData.usageLimit || null,
        specificEmails: ''
      });
      setHasExpiry(!!initialData.expiryDate);
      setHasLimit(!!initialData.usageLimit);
    } else if (isOpen) {
      setFormData({
        code: '',
        type: 'PERCENT',
        discountPercentage: 0,
        discountAmount: 0,
        minOrderValue: 0,
        targetType: 'ALL',
        expiryDate: null,
        usageLimit: null,
        specificEmails: ''
      });
      setHasExpiry(false);
      setHasLimit(false);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData };
      if (!hasExpiry) payload.expiryDate = null;
      if (!hasLimit) payload.usageLimit = null;
      
      if (payload.type === 'PERCENT' && payload.discountPercentage) {
        payload.discountPercentage = Number(payload.discountPercentage);
        payload.discountAmount = 0;
      } else {
        payload.discountAmount = Number(payload.discountAmount);
        payload.discountPercentage = 0;
      }
      
      payload.minOrderValue = Number(payload.minOrderValue);
      if (payload.usageLimit) payload.usageLimit = Number(payload.usageLimit);
      
      if (initialData) {
        await promotionService.updatePromotion(initialData.id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await promotionService.createPromotion(payload);
        toast.success('Tạo voucher thành công');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] flex flex-col p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b">
          <DialogTitle>{initialData ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã Voucher</label>
              <Input 
                required 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="VD: SUMMER20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại giảm giá</label>
              <select 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as 'PERCENT' | 'FIXED'})}
              >
                <option value="PERCENT">Theo phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.type === 'PERCENT' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mức giảm (%)</label>
                <Input 
                  type="number" 
                  required 
                  min="1" max="100"
                  value={formData.discountPercentage}
                  onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mức giảm (VNĐ)</label>
                <Input 
                  type="number" 
                  required 
                  min="1000"
                  value={formData.discountAmount}
                  onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Đơn tối thiểu (VNĐ)</label>
              <Input 
                type="number" 
                required 
                min="0"
                value={formData.minOrderValue}
                onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" checked={hasExpiry} onChange={e => setHasExpiry(e.target.checked)} />
                Giới hạn thời gian
              </label>
              {hasExpiry && (
                <Input 
                  type="datetime-local" 
                  required={hasExpiry}
                  className="w-48"
                  value={formData.expiryDate || ''}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <input type="checkbox" checked={hasLimit} onChange={e => setHasLimit(e.target.checked)} />
                Giới hạn số lượng
              </label>
              {hasLimit && (
                <Input 
                  type="number" 
                  min="1"
                  required={hasLimit}
                  className="w-48"
                  placeholder="Nhập số lượng"
                  value={formData.usageLimit || ''}
                  onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Đối tượng áp dụng</label>
            <select 
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.targetType}
              onChange={e => setFormData({...formData, targetType: e.target.value as any})}
              disabled={!!initialData}
            >
              <option value="ALL">Tất cả mọi người</option>
              <option value="CUSTOMER">Chỉ Khách hàng (B2C)</option>
              <option value="AGENT">Chỉ Đại lý (B2B)</option>
              <option value="SPECIFIC_EMAILS">Tài khoản cụ thể (Nhập Email)</option>
            </select>
          </div>

          {formData.targetType === 'SPECIFIC_EMAILS' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh sách Email (Cấp cho cá nhân/nhân viên)</label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="email1@gmail.com, email2@gmail.com..."
                required
                value={formData.specificEmails}
                onChange={e => setFormData({...formData, specificEmails: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Mã voucher sẽ tự động được gửi vào Ví Ưu Đãi của các email hợp lệ.</p>
            </div>
          )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? (initialData ? 'Đang cập nhật...' : 'Đang tạo...') : (initialData ? 'Cập nhật Voucher' : 'Tạo Voucher')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
