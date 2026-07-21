package atmin.modules.order.dto;

import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.entity.ShippingStatus;
import lombok.Data;

@Data
public class OrderUpdateRequest {
    private OrderStatus status;
    private ShippingStatus shippingStatus;
}
