package atmin.modules.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto implements Serializable {
    private Long orderCode;
    private BigDecimal amount;
    private String description;
    private String returnUrl;
    private String cancelUrl;
}
