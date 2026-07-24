import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { orderApi } from '../../orders/services/order.api';

export function PaymentResultPage({ status }: Readonly<{ status: 'success' | 'cancel' }>) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verifiedStatus, setVerifiedStatus] = useState<'success' | 'cancel' | 'invalid'>(status);

    const orderCode = searchParams.get('orderCode');
    
    useEffect(() => {
        if (!orderCode) {
            setVerifying(false);
            setVerifiedStatus('invalid');
            return;
        }

        const verify = async () => {
            try {
                const res = await orderApi.getMyOrders();
                const order = res.data.find((o: any) => String(o.orderCode) === String(orderCode));
                if (!order) {
                    setVerifiedStatus('invalid');
                } else if (order.status === 'PAID') {
                    setVerifiedStatus('success');
                } else if (order.status === 'CANCELED' || status === 'cancel') {
                    setVerifiedStatus('cancel');
                } else {
                    setVerifiedStatus('success');
                }
            } catch (err) {
                console.error(err);
                setVerifiedStatus(status);
            } finally {
                setVerifying(false);
            }
        };

        verify();
    }, [orderCode, status]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Đang xác minh giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${verifiedStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {verifiedStatus === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-500" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {verifiedStatus === 'success' ? 'Thanh toán thành công!' : verifiedStatus === 'invalid' ? 'Giao dịch không hợp lệ' : 'Thanh toán bị hủy'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {verifiedStatus === 'success' ? (
                            <>Đơn hàng <strong>#{orderCode}</strong> đã được ghi nhận. Cảm ơn bạn đã mua sắm!</>
                        ) : verifiedStatus === 'invalid' ? (
                            <>Không tìm thấy thông tin cho đơn hàng <strong>#{orderCode}</strong>. Vui lòng kiểm tra lại.</>
                        ) : (
                            <>Giao dịch thanh toán cho đơn hàng <strong>#{orderCode}</strong> đã bị hủy. Vui lòng thử lại sau.</>
                        )}
                    </p>
                </div>
                
                <button
                    onClick={() => navigate('/b2c')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    Quay lại Cửa hàng
                </button>
            </div>
        </div>
    );
}

