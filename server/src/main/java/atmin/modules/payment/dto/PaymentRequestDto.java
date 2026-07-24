package atmin.modules.payment.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentRequestDto {
    private Long orderCode;
    private BigDecimal amount;
}
