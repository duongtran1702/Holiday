package atmin.order.saga;

import atmin.common.event.OrderEvents.*;
import atmin.common.event.SagaCommands.*;
import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderItem;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderSagaOrchestrator {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderRepository orderRepository;

    public String startOrderSaga(Order order, List<OrderItem> items, String voucherCode, String userEmail) {
        String sagaId = UUID.randomUUID().toString();
        log.info("[Saga {}] Starting Checkout Saga for order {} ({})", sagaId, order.getId(), order.getOrderCode());

        // 1. Prepare and send StockReserveCommand
        List<StockItemDto> stockItems = items.stream()
                .map(i -> new StockItemDto(i.getProductId(), i.getSelectedSize() + "-" + i.getSelectedColor(), i.getQuantity()))
                .collect(Collectors.toList());
        kafkaTemplate.send("stock-reserve-topic", sagaId, new StockReserveCommand(sagaId, order.getId(), stockItems));

        // 2. If voucher exists, send VoucherApplyCommand
        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            kafkaTemplate.send("voucher-apply-topic", sagaId,
                    new VoucherApplyCommand(sagaId, order.getId(), voucherCode, order.getUserId(), order.getTotalAmount()));
        }

        // 3. Publish OrderCreatedEvent
        List<OrderItemEventDto> eventItems = items.stream()
                .map(i -> new OrderItemEventDto(i.getProductId(), i.getProductName(), i.getSelectedSize() + "-" + i.getSelectedColor(), i.getQuantity(), i.getPrice()))
                .collect(Collectors.toList());
        kafkaTemplate.send("order-created-topic", sagaId,
                new OrderCreatedEvent(sagaId, order.getId(), order.getOrderCode(), order.getUserId(), userEmail, "", order.getPhoneNumber(), order.getTotalAmount(), voucherCode, order.getPaymentMethod().name(), eventItems));

        return sagaId;
    }

    @KafkaListener(topics = "stock-reservation-failed-topic", groupId = "order-service-group")
    @Transactional
    public void handleStockReservationFailed(StockReservationFailedEvent event) {
        log.warn("[Saga {}] Stock reservation failed for order {}: {}. Triggering Compensation...", event.sagaId(), event.orderId(), event.reason());
        compensateOrder(event.sagaId(), event.orderId(), "Hết hàng tồn kho: " + event.reason());
    }

    @KafkaListener(topics = "voucher-application-failed-topic", groupId = "order-service-group")
    @Transactional
    public void handleVoucherApplicationFailed(VoucherApplicationFailedEvent event) {
        log.warn("[Saga {}] Voucher application failed for order {}: {}. Triggering Compensation...", event.sagaId(), event.orderId(), event.reason());
        compensateOrder(event.sagaId(), event.orderId(), "Mã giảm giá không hợp lệ: " + event.reason());
    }

    @Transactional
    public void compensateOrder(String sagaId, String orderId, String reason) {
        orderRepository.findById(orderId).ifPresent(order -> {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                log.info("[Saga {}] Order {} compensated to CANCELLED. Reason: {}", sagaId, orderId, reason);

                // Publish OrderCancelledEvent
                kafkaTemplate.send("order-cancelled-topic", sagaId,
                        new OrderCancelledEvent(sagaId, order.getId(), order.getOrderCode(), order.getUserId(), reason));
            }
        });
    }
}
