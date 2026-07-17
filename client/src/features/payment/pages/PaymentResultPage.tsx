import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

export function PaymentResultPage({ status }: Readonly<{ status: 'success' | 'cancel' }>) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const orderCode = searchParams.get('orderCode');
    
    useEffect(() => {
        // Optional: you can clear some states or trigger an API call if needed
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {status === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-500" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán bị hủy'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {status === 'success' ? (
                            <>Đơn hàng {orderCode ? <strong>#{orderCode}</strong> : "của bạn"} đã được thanh toán qua PayOS. Cảm ơn bạn đã mua sắm!</>
                        ) : (
                            <>Giao dịch thanh toán cho đơn hàng {orderCode ? <strong>#{orderCode}</strong> : "của bạn"} đã bị hủy. Vui lòng thử lại sau.</>
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
