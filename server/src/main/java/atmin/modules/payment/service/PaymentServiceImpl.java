package atmin.modules.payment.service;

import atmin.modules.payment.entity.Invoice;
import atmin.modules.payment.repository.InvoiceRepository;
import atmin.modules.order.api.OrderDto;
import atmin.modules.order.api.OrderInternalApi;
import atmin.common.event.PaymentSuccessEvent;
import org.springframework.context.ApplicationEventPublisher;
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
    private final OrderInternalApi orderInternalApi;
    private final InvoiceRepository invoiceRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public String createPaymentLink(atmin.modules.order.entity.Order order) {
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
                OrderDto order = orderInternalApi.getOrderByCode(orderCode);

                Invoice invoice = Invoice.builder()
                        .orderId(order.getId())
                        .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .issuedDate(LocalDateTime.now())
                        .totalAmount(order.getTotalAmount())
                        .paymentStatus("PAID")
                        .transactionReference(data.getReference())
                        .build();
                invoiceRepository.save(invoice);
                
                // Publish Event so Order Module can update its status and send email
                eventPublisher.publishEvent(new PaymentSuccessEvent(
                        orderCode, 
                        data.getReference(), 
                        invoice.getInvoiceNumber(), 
                        invoice.getIssuedDate(), 
                        invoice.getTotalAmount()
                ));
                
                log.info("PaymentSuccessEvent published and Invoice created for orderCode {}", orderCode);
            }
        } catch (Exception e) {
            log.error("Webhook processing failed: ", e);
        }
    }
}
