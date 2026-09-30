package atmin.modules.payment.client;

import atmin.modules.order.api.OrderDto;
import atmin.modules.order.api.OrderInternalApi;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "order-service", path = "/api/v1/internal/orders")
public interface OrderInternalClient extends OrderInternalApi {

    @Override
    @GetMapping("/code/{orderCode}")
    OrderDto getOrderByCode(@PathVariable("orderCode") Long orderCode);
}
