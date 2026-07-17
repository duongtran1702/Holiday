package atmin.modules.order.dto;

import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private String id;
    private Long orderCode;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl; // Optional: PayOS checkout URL

    public static OrderResponse fromEntity(Order order, String paymentUrl) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentUrl(paymentUrl)
                .build();
    }
}
