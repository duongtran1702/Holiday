package atmin.modules.order.api;

public interface OrderInternalApi {
    OrderDto getOrderByCode(Long orderCode);
}
