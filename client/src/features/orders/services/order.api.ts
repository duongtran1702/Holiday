import { callApi } from '../../../core/utils/callApi';
import { ApiResponse } from '../../../core/types';

export interface OrderItemRequest {
    productId: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
}

export interface CreateOrderRequest {
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: 'COD' | 'PAYOS';
    items: OrderItemRequest[];
}

export interface OrderItemResponse {
    id: string;
    productName: string;
    productImageUrl: string;
    quantity: number;
    price: number;
    selectedColor?: string;
    selectedSize?: string;
}

export interface OrderResponse {
    id: string;
    orderCode: number;
    totalAmount: number;
    shippingFee?: number;
    status: string;
    paymentMethod: string;
    paymentUrl?: string;
    createdAt: string;
    shippingStatus?: 'NOT_SHIPPED' | 'SHIPPING' | 'DELIVERED';
    estimatedDeliveryDate?: string;
    items: OrderItemResponse[];
}

export const orderApi = {
    createOrder: (data: CreateOrderRequest) => {
        return callApi<ApiResponse<OrderResponse>>('/orders', 'POST', data);
    },
    getMyOrders: () => {
        return callApi<ApiResponse<OrderResponse[]>>('/orders/my-orders', 'GET');
    },
    cancelOrder: (orderId: string) => {
        return callApi<ApiResponse<OrderResponse>>(`/orders/${orderId}/cancel`, 'POST');
    },
    resendOrderEmail: (orderId: string) => {
        return callApi<ApiResponse<string>>(`/orders/${orderId}/resend-email`, 'POST');
    },
    resendAllFailedEmails: () => {
        return callApi<ApiResponse<number>>('/orders/resend-all-failed-emails', 'POST');
    },
    getAllOrders: () => {
        return callApi<ApiResponse<OrderResponse[]>>('/orders/all', 'GET');
    },
    updateOrder: (orderId: string, data: { status?: string, shippingStatus?: string }) => {
        return callApi<ApiResponse<OrderResponse>>(`/orders/${orderId}`, 'PATCH', data);
    }
};
