import { callApi } from '../util/callApi';
import { ApiResponse } from '../types';

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

export interface OrderResponse {
    id: string;
    orderCode: number;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentUrl?: string;
}

export const orderApi = {
    createOrder: (data: CreateOrderRequest) => {
        return callApi<ApiResponse<OrderResponse>>('/orders', 'POST', data);
    }
};
