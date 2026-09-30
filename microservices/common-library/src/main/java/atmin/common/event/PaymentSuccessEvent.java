package atmin.common.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentSuccessEvent(
        Long orderCode,
        String transactionReference,
        String invoiceNumber,
        LocalDateTime issuedDate,
        BigDecimal totalAmount
) implements Serializable {}
