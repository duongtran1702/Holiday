package atmin.modules.order.api;

import atmin.modules.order.entity.OrderStatus;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private String id;
    private Long orderCode;
    private String userId;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
}
