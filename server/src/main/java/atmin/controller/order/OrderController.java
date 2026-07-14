package atmin.controller.order;

import atmin.common.response.ApiResponse;
import atmin.controller.order.dto.OrderRequest;
import atmin.controller.order.dto.OrderResponse;
import atmin.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        
        // Ensure authentication gets user id (depends on your JWT setup)
        // Assuming the name is the user ID or email. Let's assume we extract ID from principal
        String userId = authentication.getName(); // Or custom extraction logic if needed
        
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công", response));
    }
}
