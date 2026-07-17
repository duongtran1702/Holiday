package atmin.modules.payment.service;

import atmin.modules.order.entity.Order;
import com.fasterxml.jackson.databind.node.ObjectNode;

public interface PaymentService {
    String createPaymentLink(Order order);
    void handlePayOSWebhook(ObjectNode webhookBody);
}
