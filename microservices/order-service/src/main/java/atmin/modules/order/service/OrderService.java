package atmin.modules.order.service;

import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(String username, OrderRequest request);
    void resendOrderEmail(String orderId, boolean isManual);
    int resendAllFailedEmails();
    List<OrderResponse> getMyOrders(String username);
    OrderResponse cancelOrder(String username, String orderId);
    
    // Admin methods
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrder(String orderId, atmin.modules.order.dto.OrderUpdateRequest request);
    java.util.Map<String, Long> getOrderCountsByUserIds(List<String> userIds);
}

