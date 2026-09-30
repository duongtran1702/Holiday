package atmin.modules.payment.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto implements Serializable {
    private String id;
    private String orderId;
    private String invoiceNumber;
    private LocalDateTime issuedDate;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String transactionReference;
}
