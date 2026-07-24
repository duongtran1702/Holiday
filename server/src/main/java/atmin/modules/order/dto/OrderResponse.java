package atmin.modules.order.dto;

import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.payment.entity.PaymentMethod;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class OrderResponse {
    private String id;
    private Long orderCode;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl; // Optional: PayOS checkout URL
    private LocalDateTime createdAt;
    private atmin.modules.order.entity.ShippingStatus shippingStatus;
    private java.time.LocalDate estimatedDeliveryDate;
    private List<OrderItemResponse> items;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    public static OrderResponse fromEntity(Order order, String paymentUrl, String customerName, String customerEmail, String customerPhone) {
        List<OrderItemResponse> itemResponses = null;
        if (order.getOrderItems() != null) {
            itemResponses = order.getOrderItems().stream()
                    .map(OrderItemResponse::fromEntity)
                    .collect(Collectors.toList());
        }
        
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentUrl(paymentUrl)
                .shippingStatus(order.getShippingStatus())
                .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .build();
    }
}
