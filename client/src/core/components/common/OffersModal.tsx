import { Gift, X } from 'lucide-react';

interface OffersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OffersModal({ isOpen, onClose }: Readonly<OffersModalProps>) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-4">
                        <Gift size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Ưu đãi</h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Tính năng Ưu đãi (Voucher, Khuyến mãi) đang trong quá trình phát triển. Vui lòng quay lại sau nhé!
                    </p>
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
