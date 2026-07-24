import { Gift, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

interface OffersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OffersModal({ isOpen, onClose }: OffersModalProps) {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state: any) => state.auth.user);

    useEffect(() => {
        if (isOpen && user) {
            setLoading(true);
            import('../../../features/promotions/services/promotionService').then(m => {
                m.promotionService.getMyVouchers()
                    .then(res => setVouchers(res || []))
                    .catch(console.error)
                    .finally(() => setLoading(false));
            });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center mt-2 w-full">
                    <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-4">
                        <Gift size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Ví Ưu Đãi Của Bạn</h3>
                    
                    {!user ? (
                        <p className="text-gray-600 text-sm mb-6 text-center">
                            Vui lòng đăng nhập để xem các mã giảm giá dành riêng cho bạn.
                        </p>
                    ) : loading ? (
                        <div className="py-8 flex justify-center w-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        </div>
                    ) : vouchers.length === 0 ? (
                        <p className="text-gray-600 text-sm mb-6 text-center">
                            Bạn chưa có mã giảm giá nào. Hãy tiếp tục mua sắm để nhận nhiều ưu đãi nhé!
                        </p>
                    ) : (
                        <div className="w-full space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-1">
                            {vouchers.map(v => (
                                <div key={v.id} className="border border-pink-200 bg-pink-50 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 bottom-0 -left-2 w-4 border-r-2 border-dashed border-pink-200 bg-white rounded-r-full my-4"></div>
                                    <div className="pl-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-pink-600">{v.promotion.code}</span>
                                            <span className="text-xs font-medium px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                                                {v.status === 'AVAILABLE' ? 'Khả dụng' : 'Đã dùng/Hết hạn'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {v.promotion.discountAmount 
                                                ? `Giảm ${v.promotion.discountAmount.toLocaleString()}đ` 
                                                : `Giảm ${v.promotion.discountPercentage}%`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu: {v.promotion.minOrderValue.toLocaleString()}đ</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button 
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
