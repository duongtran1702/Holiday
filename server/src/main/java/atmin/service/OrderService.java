package atmin.service;

import atmin.controller.order.dto.OrderRequest;
import atmin.controller.order.dto.OrderResponse;

public interface OrderService {
    OrderResponse createOrder(String username, OrderRequest request);
}
