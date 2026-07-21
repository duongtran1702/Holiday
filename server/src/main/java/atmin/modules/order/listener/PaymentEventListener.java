package atmin.modules.order.listener;

import atmin.common.event.PaymentSuccessEvent;
import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.repository.OrderRepository;
import atmin.modules.order.service.IOrderEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.event.EventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final OrderRepository orderRepository;
    private final IOrderEmailService orderEmailService;

    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received PaymentSuccessEvent for orderCode {}", event.orderCode());
        
        Order order = orderRepository.findByOrderCode(event.orderCode())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.orderCode()));

        if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            log.info("Order {} status updated to PAID", event.orderCode());
            
            // Send email
            org.hibernate.Hibernate.initialize(order.getOrderItems()); // Force Hibernate to initialize the collection
            orderEmailService.sendPaymentSuccessEmail(
                    order, 
                    event.invoiceNumber(), 
                    event.issuedDate(), 
                    event.totalAmount(), 
                    event.transactionReference()
            );
        } else {
            log.warn("Order {} is not in PENDING_PAYMENT status, it is {}", event.orderCode(), order.getStatus());
        }
    }
}
