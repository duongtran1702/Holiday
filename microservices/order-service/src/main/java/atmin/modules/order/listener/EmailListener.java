package atmin.modules.order.listener;

import atmin.modules.order.event.OrderCreatedEvent;
import atmin.modules.order.service.IOrderEmailService;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailListener {

    private final IOrderEmailService orderEmailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for order: {}", event.getOrder().getOrderCode());
        if (event.getOrder().getPaymentMethod() == PaymentMethod.COD) {
            org.hibernate.Hibernate.initialize(event.getOrder().getOrderItems()); // Force Hibernate to initialize the collection
            orderEmailService.sendOrderConfirmationEmail(event.getOrder(), null);
        }
    }
}
