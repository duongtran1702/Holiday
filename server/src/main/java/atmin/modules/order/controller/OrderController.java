package atmin.modules.order.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;
import atmin.modules.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

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

    @PostMapping("/{id}/resend-email")
    public ResponseEntity<ApiResponse<String>> resendEmail(@PathVariable String id) {
        orderService.resendOrderEmail(id, true);
        return ResponseEntity.ok(ApiResponse.success("Đã yêu cầu gửi lại email thành công", null));
    }
    
    @PostMapping("/resend-all-failed-emails")
    public ResponseEntity<ApiResponse<Integer>> resendAllFailedEmails() {
        int successCount = orderService.resendAllFailedEmails();
        return ResponseEntity.ok(ApiResponse.success("Đã gửi lại thành công " + successCount + " email lỗi", successCount));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication authentication) {
        String username = authentication.getName();
        List<OrderResponse> responses = orderService.getMyOrders(username);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", responses));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable String id, Authentication authentication) {
        String username = authentication.getName();
        OrderResponse response = orderService.cancelOrder(username, id);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> responses = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tất cả đơn hàng thành công", responses));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable String id,
            @RequestBody atmin.modules.order.dto.OrderUpdateRequest request) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng thành công", response));
    }
}
