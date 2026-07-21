import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, XCircle, Receipt, AlertTriangle, Truck } from 'lucide-react';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { Button } from '../../../core/components/ui/forms/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../core/components/ui/overlay/AlertDialog';
import { toast } from 'sonner';

export function OrderHistoryPage() {
    const navigate = useNavigate();
    const { orders, loading, selectedOrder, setSelectedOrder, cancelOrder } = useOrderHistory();
    const [isCancelling, setIsCancelling] = useState(false);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-700 bg-green-50';
            case 'PENDING': return 'text-amber-800 bg-amber-100';
            case 'CANCELLED': return 'text-red-700 bg-red-50';
            default: return 'text-gray-700 bg-gray-50';
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

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;
        setIsCancelling(true);
        const success = await cancelOrder(selectedOrder.id);
        setIsCancelling(false);
        if (success) {
            toast.success('Đã hủy đơn hàng thành công!');
        } else {
            toast.error('Có lỗi xảy ra khi hủy đơn hàng.');
        }
    };

    const renderOrderList = () => {
        if (loading && orders.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
                </div>
            );
        }
        if (orders.length === 0) {
            return (
                <div className="text-center py-16 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col items-center">
                    <Receipt size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có đơn hàng nào</p>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2.5">
                {orders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                        <button
                            key={order.id}
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className={`w-full text-left p-3.5 transition-all relative rounded-[16px] ${
                                isSelected
                                    ? 'bg-white shadow-[0_2px_12px_-4px_rgba(6,81,237,0.12)] ring-1 ring-blue-100'
                                    : 'bg-white/80 border border-gray-100 hover:border-gray-200 hover:bg-white shadow-sm'
                            }`}
                        >
                            {isSelected && (
                                <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-blue-600"></div>
                            )}
                            <div className="flex justify-between items-center mb-2.5">
                                <span className={`text-[15px] font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                    #{order.orderCode}
                                </span>
                                <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${getStatusStyle(order.status)}`}
                                >
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center gap-1.5 text-xs font-medium">
                                    <Clock size={13} />
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                                <span className={`text-[15px] font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {order.totalAmount.toLocaleString()}đ
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200/60 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            Lịch sử đơn hàng
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row items-start">
                {/* Danh sách đơn hàng */}
                <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col">
                    {renderOrderList()}
                </div>

                {/* Thanh ngăn cách */}
                <div className="hidden lg:block w-px bg-gray-200 mx-6 self-stretch rounded-full"></div>

                {/* Chi tiết đơn hàng */}
                <div className="w-full flex-1 min-w-0 flex lg:justify-start justify-center">
                    {selectedOrder ? (
                        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-7 sticky top-24 w-full max-w-[480px]">
                            
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-7 gap-4">
                                <div>
                                    <h2 className="text-[22px] font-black text-gray-900 leading-tight">
                                        Đơn hàng
                                    </h2>
                                    <h2 className="text-[22px] font-black text-blue-600 leading-tight mb-2.5">
                                        #{selectedOrder.orderCode}
                                    </h2>
                                    <p className="text-gray-500 text-[13px] flex items-center gap-1.5 font-medium">
                                        <Clock size={14}/>
                                        {new Date(selectedOrder.createdAt).toLocaleTimeString('vi-VN')} {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 self-start mt-1 sm:mt-0">
                                    {selectedOrder.status === 'PENDING' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="h-[28px] px-4 text-[12px] flex items-center bg-[#CD403A] hover:bg-[#b03530] text-white border-0 rounded-full shadow-none font-semibold transition-colors cursor-pointer">
                                                    Hủy đơn
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-[24px] sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl">
                                                <div className="bg-red-500 p-6 flex flex-col items-center justify-center text-white relative">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
                                                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm relative z-10">
                                                        <AlertTriangle size={32} className="text-white" strokeWidth={2}/>
                                                    </div>
                                                    <AlertDialogTitle className="text-xl font-bold relative z-10 text-white">Hủy đơn hàng này?</AlertDialogTitle>
                                                </div>
                                                <div className="p-6 bg-white pt-5">
                                                    <AlertDialogDescription className="text-sm text-center text-gray-600 mb-6 block">
                                                        Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy đơn hàng <b className="text-gray-900">#{selectedOrder.orderCode}</b>?
                                                    </AlertDialogDescription>
                                                    <AlertDialogFooter className="flex flex-row w-full items-center sm:justify-center gap-3">
                                                        <AlertDialogCancel className="rounded-xl border-gray-200 h-11 px-6 font-semibold flex-1 hover:bg-gray-50 transition-colors m-0 sm:mt-0 mt-0">Đóng</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={handleCancelOrder} 
                                                            disabled={isCancelling} 
                                                            className="bg-red-600 text-white hover:bg-red-700 rounded-xl h-11 px-6 font-semibold flex-1 transition-all hover:shadow-lg hover:shadow-red-500/30 m-0"
                                                        >
                                                            {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </div>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    <span className={`text-[12px] px-3.5 py-1 rounded-full font-bold ${getStatusStyle(selectedOrder.status)}`}>
                                        {getStatusText(selectedOrder.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            {selectedOrder.status !== 'CANCELLED' && (
                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-[16px] p-4 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                                            <Truck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[12px] text-gray-500 font-medium mb-0.5">Trạng thái vận chuyển</p>
                                            <p className="text-[14px] font-bold text-gray-900">
                                                {selectedOrder.shippingStatus === 'DELIVERED' ? 'Đã giao hàng' : selectedOrder.shippingStatus === 'SHIPPING' ? 'Đang giao hàng' : 'Chưa giao hàng'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedOrder.estimatedDeliveryDate && selectedOrder.shippingStatus !== 'DELIVERED' && (
                                        <div className="text-right">
                                            <p className="text-[11px] text-gray-500 font-medium mb-0.5">Dự kiến giao</p>
                                            <p className="text-[13px] font-bold text-blue-700">
                                                {new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Products */}
                            <h3 className="font-bold text-gray-900 mb-3.5 flex items-center gap-2 text-[14px]">
                                <Package size={16} className="text-blue-600"/> Sản phẩm đã mua
                                <span className="bg-gray-100 text-gray-500 text-[11px] py-0.5 px-2 rounded-full font-bold ml-1">
                                    {selectedOrder.items?.length || 0}
                                </span>
                            </h3>
                            
                            <div className="border border-gray-100 rounded-[16px] overflow-hidden bg-white mb-5 p-1">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={item.id} className={`flex gap-3.5 items-center p-3 ${idx !== selectedOrder.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <div className="w-[48px] h-[48px] bg-[#F8F9FA] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {item.productImageUrl ? (
                                                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply" />
                                            ) : (
                                                <span className="text-gray-400 text-[8px] uppercase font-bold tracking-wider">No img</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-[13px] truncate pr-2">{item.productName}</h4>
                                            <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Số lượng: <span className="text-gray-900">{item.quantity}</span></p>
                                        </div>
                                        <div className="font-bold text-gray-900 text-[13px] whitespace-nowrap pl-2">
                                            {(item.price * item.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                    <div className="text-[13px] text-gray-500 italic p-4 text-center">Không có thông tin sản phẩm.</div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="bg-[#F8F9FA] rounded-[16px] p-4 sm:p-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500 font-medium">Phương thức thanh toán</span>
                                        <span className="font-bold text-gray-900">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500 font-medium">Phí vận chuyển</span>
                                        <span className="font-bold text-gray-900">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="font-black text-gray-900 text-[14px]">Tổng cộng</span>
                                    <span className="text-[18px] font-black text-blue-600 tracking-tight">{(selectedOrder.totalAmount + (selectedOrder.shippingFee || 0)).toLocaleString()}đ</span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-[480px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                <Receipt size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-900 mb-1.5">Chưa chọn đơn hàng</h3>
                            <p className="text-gray-500 text-[13px] max-w-[220px]">Vui lòng chọn một đơn hàng từ danh sách bên trái để xem chi tiết.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
