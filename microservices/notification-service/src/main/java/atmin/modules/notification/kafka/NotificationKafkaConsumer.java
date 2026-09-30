package atmin.modules.notification.kafka;

import atmin.common.event.PaymentSuccessEvent;
import atmin.modules.notification.api.NotificationInternalApi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationKafkaConsumer {

    private final NotificationInternalApi notificationInternalApi;

    @KafkaListener(topics = "payment-success-topic", groupId = "notification-service-group")
    public void handlePaymentSuccessEvent(PaymentSuccessEvent event) {
        log.info("Received PaymentSuccessEvent for orderCode: {}, amount: {}", event.orderCode(), event.totalAmount());
        try {
            notificationInternalApi.createNotification(
                    "ORDER_PAYMENT_SUCCESS",
                    "ORDER",
                    String.valueOf(event.orderCode()),
                    "Thanh toán đơn hàng thành công",
                    "Đơn hàng #" + event.orderCode() + " đã được thanh toán thành công với số tiền " + event.totalAmount() + "đ.",
                    "INFO",
                    "ADMIN",
                    null,
                    "/admin/orders/" + event.orderCode(),
                    null
            );
        } catch (Exception e) {
            log.error("Failed to process payment success notification for orderCode {}: {}", event.orderCode(), e.getMessage());
        }
    }
}
