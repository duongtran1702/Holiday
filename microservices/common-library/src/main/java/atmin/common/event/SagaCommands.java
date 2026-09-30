package atmin.common.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

public class SagaCommands {

    public record StockItemDto(
            String productId,
            String variant,
            Integer quantity
    ) implements Serializable {}

    // Stock Reservation Commands & Events
    public record StockReserveCommand(
            String sagaId,
            String orderId,
            List<StockItemDto> items
    ) implements Serializable {}

    public record StockReservedEvent(
            String sagaId,
            String orderId
    ) implements Serializable {}

    public record StockReservationFailedEvent(
            String sagaId,
            String orderId,
            String reason
    ) implements Serializable {}

    public record StockRollbackCommand(
            String sagaId,
            String orderId,
            List<StockItemDto> items
    ) implements Serializable {}

    // Voucher Commands & Events
    public record VoucherApplyCommand(
            String sagaId,
            String orderId,
            String voucherCode,
            String userId,
            BigDecimal orderAmount
    ) implements Serializable {}

    public record VoucherAppliedEvent(
            String sagaId,
            String orderId,
            String voucherCode,
            BigDecimal discountAmount
    ) implements Serializable {}

    public record VoucherApplicationFailedEvent(
            String sagaId,
            String orderId,
            String voucherCode,
            String reason
    ) implements Serializable {}

    public record VoucherRollbackCommand(
            String sagaId,
            String orderId,
            String voucherCode,
            String userId
    ) implements Serializable {}
}
