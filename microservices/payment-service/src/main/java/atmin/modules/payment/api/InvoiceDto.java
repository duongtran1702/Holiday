package atmin.modules.payment.api;

import atmin.modules.payment.entity.Invoice;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceDto {
    private String id;
    private String orderId;
    private String invoiceNumber;
    private LocalDateTime issuedDate;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String transactionReference;

    public static InvoiceDto fromEntity(Invoice entity) {
        return InvoiceDto.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .invoiceNumber(entity.getInvoiceNumber())
                .issuedDate(entity.getIssuedDate())
                .totalAmount(entity.getTotalAmount())
                .paymentStatus(entity.getPaymentStatus())
                .transactionReference(entity.getTransactionReference())
                .build();
    }
}
