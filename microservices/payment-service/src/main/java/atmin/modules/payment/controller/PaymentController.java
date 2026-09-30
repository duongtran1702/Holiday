package atmin.modules.payment.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.payment.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handlePayOSWebhook(@RequestBody String webhookBody) {
        ObjectNode node;
        try {
            node = objectMapper.readValue(webhookBody, ObjectNode.class);
        } catch (Exception e) {
            log.error("PayOS Webhook JSON parse error: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Dữ liệu JSON Webhook PayOS không hợp lệ: " + e.getMessage(), e);
        }

        try {
            paymentService.handlePayOSWebhook(node);
            return ResponseEntity.ok(ApiResponse.success("Webhook received and processed", null));
        } catch (IllegalArgumentException e) {
            log.error("PayOS Webhook invalid signature or payload: {}", e.getMessage(), e);
            throw e; // Trả về HTTP 400 để PayOS biết request sai, không retry lặp lại
        } catch (Exception e) {
            log.error("PayOS Webhook internal processing error: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi xử lý nội bộ Webhook PayOS: " + e.getMessage(), e); // Trả về HTTP 500 để PayOS có thể retry
        }
    }
}
