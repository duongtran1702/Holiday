package atmin.modules.payment.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.payment.service.PaymentService;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handlePayOSWebhook(@RequestBody String webhookBody) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ObjectNode node = objectMapper.readValue(webhookBody, ObjectNode.class);
            paymentService.handlePayOSWebhook(node);
        } catch (Exception e) {
            // Ignore parse errors for test webhooks
        }
        return ResponseEntity.ok(ApiResponse.success("Webhook received", null));
    }
}
