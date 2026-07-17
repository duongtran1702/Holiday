import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock } from 'lucide-react';
import { useOrderHistory } from '../hooks/useOrderHistory';

export function OrderHistoryPage() {
    const navigate = useNavigate();
    const { orders, loading, selectedOrder, setSelectedOrder } = useOrderHistory();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-700 bg-green-100 border-green-200';
            case 'PENDING': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'CANCELLED': return 'text-red-700 bg-red-100 border-red-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
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

    const renderOrderList = () => {
        if (loading) {
            return <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>;
        }
        if (orders.length === 0) {
            return (
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                    Chưa có đơn hàng nào
                </div>
            );
        }
        return orders.map((order) => (
            <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 hover:border-gray-300'}`}
            >
                <span className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                        #{order.orderCode}
                    </span>
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusStyle(order.status)}`}
                    >
                        {getStatusText(order.status)}
                    </span>
                </span>
                <span className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} />{' '}
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="font-bold text-blue-600">
                        {order.totalAmount.toLocaleString()}đ
                    </span>
                </span>
            </button>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            Lịch sử đơn hàng
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Danh sách đơn hàng */}
                <div className="md:col-span-1 flex flex-col gap-3">
                    {renderOrderList()}
                </div>

                {/* Chi tiết đơn hàng */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    {selectedOrder ? (
                        <div>
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Đơn hàng #{selectedOrder.orderCode}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <span className={`text-sm px-3 py-1.5 rounded-full font-medium border ${getStatusStyle(selectedOrder.status)}`}>
                                    {getStatusText(selectedOrder.status)}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Package size={18} /> Sản phẩm đã mua ({selectedOrder.items?.length || 0})
                            </h3>
                            
                            <div className="space-y-4 mb-8">
                                {selectedOrder.items?.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                            {item.productImageUrl ? (
                                                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            {(item.price * item.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                    <div className="text-sm text-gray-500 italic">Không có thông tin sản phẩm.</div>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <div className="flex justify-between items-center mb-3 text-sm">
                                    <span className="text-gray-600">Phương thức thanh toán</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Tổng cộng</span>
                                    <span className="text-xl font-bold text-blue-600">{selectedOrder.totalAmount.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                            <Package size={48} className="text-gray-300 mb-4" />
                            <p>Chọn một đơn hàng bên trái để xem chi tiết</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
