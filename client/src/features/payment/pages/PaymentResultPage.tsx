import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { orderApi } from '../../orders/services/order.api';

export function PaymentResultPage({ status }: Readonly<{ status: 'success' | 'cancel' }>) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verifiedStatus, setVerifiedStatus] = useState<'success' | 'cancel' | 'invalid' | 'pending'>(status);

    const orderCode = searchParams.get('orderCode');
    
    useEffect(() => {
        if (!orderCode) {
            setVerifying(false);
            setVerifiedStatus('invalid');
            return;
        }

        let isMounted = true;
        const verify = async () => {
            try {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    const res = await orderApi.getMyOrders();
                    const order = res.data.find((o: any) => String(o.orderCode) === String(orderCode));
                    
                    if (!order) {
                        if (isMounted) setVerifiedStatus('invalid');
                        break;
                    }

                    if (order.status === 'PAID') {
                        if (isMounted) setVerifiedStatus('success');
                        break;
                    } else if (order.status === 'CANCELLED') {
                        if (isMounted) setVerifiedStatus('cancel');
                        break;
                    } else if (status === 'cancel' && order.status === 'PENDING_PAYMENT') {
                        await orderApi.cancelOrder(order.id);
                        if (isMounted) setVerifiedStatus('cancel');
                        break;
                    } else {
                        if (attempt < 3) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        } else {
                            if (isMounted) setVerifiedStatus('pending');
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
                if (isMounted) setVerifiedStatus('pending');
            } finally {
                if (isMounted) setVerifying(false);
            }
        };

        verify();
        return () => {
            isMounted = false;
        };
    }, [orderCode, status]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Đang kiểm tra giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                        verifiedStatus === 'success' ? 'bg-green-100' :
                        verifiedStatus === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                        {verifiedStatus === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        ) : verifiedStatus === 'pending' ? (
                            <Clock className="w-12 h-12 text-yellow-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-500" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {verifiedStatus === 'success' ? 'Thanh toán thành công!' : 
                         verifiedStatus === 'pending' ? 'Đơn hàng đang chờ xác nhận' :
                         verifiedStatus === 'invalid' ? 'Giao dịch không hợp lệ' : 'Thanh toán bị hủy'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {verifiedStatus === 'success' ? (
                            <>Đơn hàng <strong>#{orderCode}</strong> đã được ghi nhận. Cảm ơn bạn đã mua sắm!</>
                        ) : verifiedStatus === 'pending' ? (
                            <>Đơn hàng <strong>#{orderCode}</strong> đang chờ hệ thống thanh toán PayOS xác nhận giao dịch. Vui lòng kiểm tra lại trạng thái trong danh sách đơn hàng sau ít phút.</>
                        ) : verifiedStatus === 'invalid' ? (
                            <>Không tìm thấy thông tin cho đơn hàng <strong>#{orderCode}</strong>. Vui lòng kiểm tra lại.</>
                        ) : (
                            <>Giao dịch thanh toán cho đơn hàng <strong>#{orderCode}</strong> đã bị hủy. Vui lòng thử lại sau.</>
                        )}
                    </p>
                </div>
                
                <div className="flex flex-col gap-3">
                    {verifiedStatus === 'pending' && (
                        <button
                            onClick={() => navigate('/b2c/orders')}
                            className="w-full py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors"
                        >
                            Xem đơn hàng của tôi
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/b2c')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Quay lại Cửa hàng
                    </button>
                </div>
            </div>
        </div>
    );
}
