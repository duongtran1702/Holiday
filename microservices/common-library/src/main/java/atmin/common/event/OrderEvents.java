package atmin.common.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public class OrderEvents {

    public record OrderItemEventDto(
            String productId,
            String productName,
            String variant,
            Integer quantity,
            BigDecimal price
    ) implements Serializable {}

    public record OrderCreatedEvent(
            String sagaId,
            String orderId,
            Long orderCode,
            String userId,
            String customerEmail,
            String customerName,
            String customerPhone,
            BigDecimal totalAmount,
            String voucherCode,
            String paymentMethod,
            List<OrderItemEventDto> items
    ) implements Serializable {}

    public record OrderCancelledEvent(
            String sagaId,
            String orderId,
            Long orderCode,
            String userId,
            String reason
    ) implements Serializable {}

    public record OrderStatusUpdatedEvent(
            String orderId,
            Long orderCode,
            String oldStatus,
            String newStatus
    ) implements Serializable {}
}
