package atmin.modules.payment.service;

import atmin.modules.payment.dto.PaymentRequestDto;
import com.fasterxml.jackson.databind.node.ObjectNode;

public interface PaymentService {
    String createPaymentLink(PaymentRequestDto request);
    void handlePayOSWebhook(ObjectNode webhookBody);
}
