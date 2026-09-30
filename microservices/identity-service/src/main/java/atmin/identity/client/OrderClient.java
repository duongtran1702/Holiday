package atmin.identity.client;

import atmin.modules.order.service.OrderService;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "order-service", path = "/api/v1/internal/orders")
public interface OrderClient extends OrderService {

    @Override
    @PostMapping("/counts")
    Map<String, Long> getOrderCountsByUserIds(@RequestBody List<String> userIds);
}
