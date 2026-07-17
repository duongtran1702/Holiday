import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, ChevronRight } from 'lucide-react';
import { orderApi } from "../../../features/orders/services/order.api";
import { OrderResponse } from '../../../features/orders/types/order.types';

interface OrderHistoryPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrderHistoryPopup({ isOpen, onClose }: OrderHistoryPopupProps) {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getMyOrders();
            if (res.data) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const displayOrders = orders.slice(0, 5); // Show max 5

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 bg-green-50';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PAID': return 'Đã thanh toán';
            case 'PENDING': return 'Chờ thanh toán';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package size={16} className="text-gray-500" /> Đơn hàng gần đây
                </h3>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                    <div className="py-8 text-center text-sm text-gray-500">Đang tải...</div>
                ) : orders.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                        <Package size={32} className="text-gray-300 mb-2" />
                        Chưa có đơn hàng nào
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {displayOrders.map(order => (
                            <div key={order.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-default border border-transparent hover:border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-medium text-gray-800">#{order.orderCode}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                    <span className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()}đ</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {orders.length > 0 && (
                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                    <button 
                        onClick={() => {
                            onClose();
                            navigate('/b2c/orders');
                        }}
                        className="w-full py-2 flex items-center justify-center gap-1 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Xem tất cả ({orders.length}) <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
