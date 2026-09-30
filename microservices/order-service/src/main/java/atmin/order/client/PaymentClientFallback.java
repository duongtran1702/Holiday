package atmin.order.client;

import atmin.modules.payment.api.InvoiceDto;
import atmin.modules.payment.dto.PaymentRequestDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PaymentClientFallback implements PaymentClient {

    @Override
    public InvoiceDto getInvoiceByOrderId(String orderId) {
        log.warn("[Circuit Breaker Fallback] payment-service không phản hồi khi getInvoiceByOrderId: {}", orderId);
        return null;
    }

    @Override
    public String createPaymentLink(PaymentRequestDto request) {
        log.error("[Circuit Breaker Fallback] payment-service không phản hồi khi tạo payment link cho đơn: {}", request != null ? request.getOrderCode() : "null");
        throw new IllegalStateException("Cổng thanh toán tạm thời không khả dụng, vui lòng thử lại sau.");
    }
}
