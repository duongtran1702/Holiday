package atmin.modules.order.controller;

import atmin.modules.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/orders")
@RequiredArgsConstructor
public class InternalOrderController {

    private final OrderService orderService;
    private final atmin.modules.order.api.OrderInternalApi orderInternalApi;

    @PostMapping("/counts")
    public Map<String, Long> getOrderCountsByUserIds(@RequestBody List<String> userIds) {
        return orderService.getOrderCountsByUserIds(userIds);
    }

    @GetMapping("/code/{orderCode}")
    public atmin.modules.order.api.OrderDto getOrderByCode(@PathVariable Long orderCode) {
        return orderInternalApi.getOrderByCode(orderCode);
    }
}
