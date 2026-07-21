package atmin.modules.order.api;

import atmin.modules.order.entity.OrderStatus;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private String id;
    private Long orderCode;
    private String userId;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private atmin.modules.order.entity.ShippingStatus shippingStatus;
    private java.time.LocalDate estimatedDeliveryDate;
}
