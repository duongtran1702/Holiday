package atmin.modules.order.dto;

import atmin.modules.order.entity.OrderItem;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private String id;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private String selectedColor;
    private String selectedSize;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .productImageUrl(item.getProductImageUrl()) 
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .selectedColor(item.getSelectedColor())
                .selectedSize(item.getSelectedSize())
                .build();
    }
}
