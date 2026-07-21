import { useState, useEffect, useCallback } from 'react';
import { orderApi, OrderResponse } from '../services/order.api';

export const useOrderHistory = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await orderApi.getMyOrders();
            if (res.data) {
                setOrders(res.data);
            }
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await orderApi.cancelOrder(orderId);
            if (res.data) {
                // Refetch orders after successful cancellation
                await fetchOrders();
                // Update selected order if it was the one cancelled
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(res.data);
                }
                return true;
            }
            return false;
        } catch (err: any) {
            console.error("Error cancelling order:", err);
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchOrders, selectedOrder]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { 
        orders, 
        loading, 
        error, 
        selectedOrder, 
        setSelectedOrder, 
        refetch: fetchOrders,
        cancelOrder
    };
};
