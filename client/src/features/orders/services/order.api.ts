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
}

export interface OrderResponse {
    id: string;
    orderCode: number;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentUrl?: string;
    createdAt: string;
    items: OrderItemResponse[];
}

export const orderApi = {
    createOrder: (data: CreateOrderRequest) => {
        return callApi<ApiResponse<OrderResponse>>('/orders', 'POST', data);
    },
    getMyOrders: () => {
        return callApi<ApiResponse<OrderResponse[]>>('/orders/my-orders', 'GET');
    }
};
