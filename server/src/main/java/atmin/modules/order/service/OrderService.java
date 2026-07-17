package atmin.modules.order.service;

import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;

public interface OrderService {
    OrderResponse createOrder(String username, OrderRequest request);
}
