package atmin.common.event;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public record PaymentSuccessEvent(
        Long orderCode,
        String transactionReference,
        String invoiceNumber,
        LocalDateTime issuedDate,
        BigDecimal totalAmount
) {}
