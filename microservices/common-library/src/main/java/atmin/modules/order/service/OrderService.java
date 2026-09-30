package atmin.modules.order.service;

import java.util.List;
import java.util.Map;

public interface OrderService {
    Map<String, Long> getOrderCountsByUserIds(List<String> userIds);
}
