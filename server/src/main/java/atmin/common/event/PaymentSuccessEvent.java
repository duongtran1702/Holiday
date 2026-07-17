package atmin.common.event;

import java.time.LocalDateTime;

public record PaymentSuccessEvent(
        Long orderCode,
        String transactionReference,
        String invoiceNumber,
        LocalDateTime issuedDate,
        Double totalAmount
) {}
