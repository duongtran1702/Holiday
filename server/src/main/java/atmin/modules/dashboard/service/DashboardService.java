package atmin.modules.dashboard.service;

import atmin.modules.dashboard.api.DashboardResponse;
import atmin.modules.order.dto.OrderResponse;
import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.repository.OrderRepository;
import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        
        List<Order> todayOrders = orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);
        
        BigDecimal todayRevenue = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.PAID) 
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        int newOrdersCount = todayOrders.size();
        
        List<Order> recentOrdersEntities = orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        List<OrderResponse> recentOrders = recentOrdersEntities.stream()
                .map(o -> OrderResponse.fromEntity(o, null))
                .collect(Collectors.toList());
                
        // Calculate lowStockSkuCount
        List<Product> products = productRepository.findAll();
        long lowStockSkuCount = products.stream()
                .filter(p -> p.getStock() != null)
                .flatMap(p -> p.getStock().values().stream())
                .filter(qty -> qty <= 5)
                .count();

        // Calculate activeAgents
        List<User> users = userRepository.findAll(); // Caution: might trigger lazy loading if roles are accessed.
        long activeAgents = 0;
        try {
            activeAgents = users.stream()
                .filter(u -> u.isEnabled() && u.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase("AGENT")))
                .count();
        } catch (Exception e) {
            // Fallback if lazy loading fails
        }

        // Revenue Chart Data (Last 7 months)
        List<Map<String, Object>> revenueChartData = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        List<Order> allOrders = orderRepository.findAll();
        
        for (int i = 6; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = targetMonth.atEndOfMonth().atTime(23, 59, 59);
            
            BigDecimal b2cRevenue = allOrders.stream()
                .filter(o -> !o.getCreatedAt().isBefore(startOfMonth) && !o.getCreatedAt().isAfter(endOfMonth))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal b2bRevenue = BigDecimal.ZERO;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", "T" + targetMonth.getMonthValue());
            monthData.put("b2c", b2cRevenue.divide(BigDecimal.valueOf(1000000), 2, java.math.RoundingMode.HALF_UP));
            monthData.put("b2b", b2bRevenue);
            revenueChartData.add(monthData);
        }

        // Order Status Data
        List<Map<String, Object>> orderStatusData = new ArrayList<>();
        long totalOrders = allOrders.size();
        
        long pendingCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.PENDING_PAYMENT).count();
        long processingCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PAID).count();
        long completedCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count();
        long cancelledCount = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();
        
        orderStatusData.add(createStatusMap("Chờ xử lý", pendingCount, "bg-amber-400", totalOrders));
        orderStatusData.add(createStatusMap("Đang giao", processingCount, "bg-blue-400", totalOrders));
        orderStatusData.add(createStatusMap("Hoàn thành", completedCount, "bg-emerald-400", totalOrders));
        orderStatusData.add(createStatusMap("Đã hủy", cancelledCount, "bg-red-400", totalOrders));

        return DashboardResponse.builder()
                .todayRevenue(todayRevenue)
                .newOrders(newOrdersCount)
                .lowStockSkuCount((int) lowStockSkuCount)
                .activeAgents((int) activeAgents)
                .revenueChartData(revenueChartData)
                .orderStatusData(orderStatusData)
                .recentOrders(recentOrders)
                .build();
    }
    
    private Map<String, Object> createStatusMap(String label, long count, String color, long total) {
        Map<String, Object> map = new HashMap<>();
        map.put("label", label);
        map.put("count", count);
        map.put("color", color);
        long pct = total > 0 ? (count * 100 / total) : 0;
        map.put("pct", pct);
        return map;
    }
}
