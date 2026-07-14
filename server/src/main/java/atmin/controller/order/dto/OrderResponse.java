package atmin.controller.order.dto;

import atmin.entity.Order;
import atmin.entity.enums.OrderStatus;
import atmin.entity.enums.PaymentMethod;
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
