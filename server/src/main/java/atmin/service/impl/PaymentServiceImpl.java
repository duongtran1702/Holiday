package atmin.service.impl;

import atmin.entity.Invoice;
import atmin.entity.Order;
import atmin.entity.enums.OrderStatus;
import atmin.repository.InvoiceRepository;
import atmin.repository.OrderRepository;
import atmin.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PayOS payOS;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public String createPaymentLink(Order order) {
        try {
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(order.getOrderCode())
                    .amount(order.getTotalAmount().longValue())
                    .description("Thanh toan don " + order.getOrderCode())
                    .returnUrl("http://localhost:5173/payment/success")
                    .cancelUrl("http://localhost:5173/payment/cancel")
                    .build();

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);
            return data.getCheckoutUrl();
        } catch (Exception e) {
            log.error("Error creating PayOS payment link: ", e);
            throw new RuntimeException("Không thể tạo link thanh toán: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void handlePayOSWebhook(ObjectNode webhookBody) {
        try {
            // Convert ObjectNode to string or use it directly depending on verify method
            WebhookData data = payOS.webhooks().verify(webhookBody);
            
            if ("00".equals(data.getCode())) {
                Long orderCode = data.getOrderCode();
                Order order = orderRepository.findByOrderCode(orderCode)
                        .orElseThrow(() -> new RuntimeException("Order not found"));

                if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);

                    Invoice invoice = Invoice.builder()
                            .order(order)
                            .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .issuedDate(LocalDateTime.now())
                            .totalAmount(order.getTotalAmount())
                            .paymentStatus("PAID")
                            .transactionReference(data.getReference())
                            .build();
                    invoiceRepository.save(invoice);
                    
                    log.info("Order {} marked as PAID and Invoice created", orderCode);
                }
            }
        } catch (Exception e) {
            log.error("Webhook processing failed: ", e);
        }
    }
}
