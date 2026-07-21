package atmin.modules.order.job;

import atmin.modules.notification.api.NotificationInternalApi;
import atmin.modules.order.entity.EmailStatus;
import atmin.modules.order.entity.Order;
import atmin.modules.order.repository.OrderRepository;
import atmin.modules.order.service.IOrderEmailService;
import atmin.modules.payment.api.PaymentInternalApi;
import atmin.modules.payment.api.InvoiceDto;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEmailRetryJob {

    private final OrderRepository orderRepository;
    private final IOrderEmailService orderEmailService;
    private final NotificationInternalApi notificationInternalApi;
    private final PaymentInternalApi paymentInternalApi;

    @Scheduled(fixedDelay = 300000) // Runs every 5 minutes
    @Transactional
    public void retryFailedEmails() {
        log.info("Starting scheduled job: Retry failed emails...");
        List<Order> failedOrders = orderRepository.findByEmailStatus(EmailStatus.FAILED);
        
        if (failedOrders.isEmpty()) {
            log.info("No failed emails to retry.");
            return;
        }
        
        log.info("Found {} emails to retry.", failedOrders.size());
        
        for (Order order : failedOrders) {
            if (order.getEmailRetryCount() >= 5) {
                log.warn("Order {} has reached max email retries (5). Skipping.", order.getOrderCode());
                // Ensure notification exists if we missed it
                notificationInternalApi.createNotification(
                        "ORDER_EMAIL_FAILED", "ORDER", order.getId(),
                        "Lỗi gửi email đơn hàng",
                        "Gửi email đơn hàng #" + order.getOrderCode() + " thất bại sau 5 lần thử",
                        "WARNING", "ADMIN", null, "/admin/orders?id=" + order.getId(), null
                );
                continue;
            }
            
            log.info("Retrying email for order: {}", order.getOrderCode());
            try {
                if (order.getPaymentMethod() == PaymentMethod.COD) {
                    org.hibernate.Hibernate.initialize(order.getOrderItems());
                    orderEmailService.sendOrderConfirmationEmailSync(order, null);
                } else if (order.getPaymentMethod() == PaymentMethod.PAYOS) {
                    org.hibernate.Hibernate.initialize(order.getOrderItems());
                    InvoiceDto invoice = paymentInternalApi.getInvoiceByOrderId(order.getId());
                    orderEmailService.sendPaymentSuccessEmailSync(order, invoice.getInvoiceNumber(), invoice.getIssuedDate(), invoice.getTotalAmount(), invoice.getTransactionReference());
                }
                
                order.setEmailStatus(EmailStatus.SENT);
                orderRepository.save(order);
                log.info("Successfully retried email for order {}", order.getOrderCode());
            } catch (Exception e) {
                log.error("Retry failed for order {}: {}", order.getOrderCode(), e.getMessage());
                int newCount = order.getEmailRetryCount() + 1;
                order.setEmailRetryCount(newCount);
                orderRepository.save(order);
                
                if (newCount >= 5) {
                    notificationInternalApi.createNotification(
                            "ORDER_EMAIL_FAILED", "ORDER", order.getId(),
                            "Lỗi gửi email đơn hàng",
                            "Gửi email đơn hàng #" + order.getOrderCode() + " thất bại sau 5 lần thử",
                            "WARNING", "ADMIN", null, "/admin/orders?id=" + order.getId(), null
                    );
                }
            }
        }
        log.info("Completed scheduled job: Retry failed emails.");
    }
}
