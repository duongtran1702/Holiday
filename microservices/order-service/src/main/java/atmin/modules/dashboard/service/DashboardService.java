package atmin.modules.dashboard.service;

import atmin.modules.dashboard.api.DashboardResponse;
import atmin.modules.order.dto.OrderResponse;
import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final atmin.modules.product.api.ProductInternalApi productInternalApi;
    private final atmin.modules.user.api.UserInternalApi userInternalApi;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        
        List<Order> todayOrders = orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);
        
        BigDecimal todayRevenue = todayOrders.stream()
                .filter(this::isRevenueOrder)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        int newOrdersCount = todayOrders.size();
        
        List<Order> recentOrdersEntities = orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        List<OrderResponse> recentOrders = recentOrdersEntities.stream()
                .map(o -> {
                    atmin.modules.user.api.UserDto u = null;
                    try {
                        u = userInternalApi.getUserById(o.getUserId());
                    } catch (Exception e) {}
                    String cName = u != null ? u.getFullName() : "Unknown";
                    String cEmail = u != null ? u.getEmail() : "";
                    String cPhone = u != null ? u.getPhoneNumber() : o.getPhoneNumber();
                    return OrderResponse.fromEntity(o, null, cName, cEmail, cPhone);
                })
                .collect(Collectors.toList());
                
        // Calculate lowStockSkuCount and lowStockProducts
        List<atmin.modules.product.api.ProductDto> products = productInternalApi.getAllProducts();
        List<Map<String, Object>> lowStockProducts = new ArrayList<>();
        long lowStockSkuCount = 0;
        
        for (atmin.modules.product.api.ProductDto p : products) {
            if (p.getStock() != null) {
                for (Map.Entry<String, Integer> entry : p.getStock().entrySet()) {
                    if (entry.getValue() <= 5) {
                        lowStockSkuCount++;
                        Map<String, Object> map = new HashMap<>();
                        map.put("sku", entry.getKey());
                        map.put("stock", entry.getValue());
                        lowStockProducts.add(map);
                    }
                }
            }
        }
        
        lowStockProducts.sort(Comparator.comparing(m -> (Integer) m.get("stock")));
        if (lowStockProducts.size() > 5) {
            lowStockProducts = lowStockProducts.subList(0, 5);
        }

        // Calculate activeAgents
        List<atmin.modules.user.api.UserDto> users = userInternalApi.getAllUsers();
        long activeAgents = 0;
        long totalCustomers = 0;
        long newCustomersToday = 0;
        try {
            activeAgents = users.stream()
                .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()) && u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.equalsIgnoreCase("AGENT")))
                .count();
                
            List<atmin.modules.user.api.UserDto> customers = users.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.equalsIgnoreCase("CUSTOMER")))
                .collect(Collectors.toList());
                
            totalCustomers = customers.size();
            newCustomersToday = customers.stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(startOfDay) && !u.getCreatedAt().isAfter(endOfDay))
                .count();
        } catch (Exception e) {
            // Fallback
        }

        Set<String> agentUserIds = users.stream()
                .filter(user -> user.getRoles() != null && user.getRoles().stream()
                        .anyMatch(role -> "AGENT".equalsIgnoreCase(role)))
                .map(atmin.modules.user.api.UserDto::getId)
                .collect(Collectors.toSet());

        // Revenue Chart Data (Last 7 months)
        List<Map<String, Object>> revenueChartData = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        List<Order> allOrders = orderRepository.findAll();
        
        for (int i = 6; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime endOfMonth = targetMonth.atEndOfMonth().atTime(23, 59, 59);
            
            List<Order> revenueOrders = allOrders.stream()
                    .filter(o -> !o.getCreatedAt().isBefore(startOfMonth) && !o.getCreatedAt().isAfter(endOfMonth))
                    .filter(this::isRevenueOrder)
                    .toList();

            BigDecimal b2cRevenue = sumRevenue(revenueOrders, agentUserIds, false);
            BigDecimal b2bRevenue = sumRevenue(revenueOrders, agentUserIds, true);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", "T" + targetMonth.getMonthValue());
            monthData.put("b2c", b2cRevenue.divide(BigDecimal.valueOf(1000000), 2, RoundingMode.HALF_UP));
            monthData.put("b2b", b2bRevenue.divide(BigDecimal.valueOf(1000000), 2, RoundingMode.HALF_UP));
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
                .totalCustomers((int) totalCustomers)
                .newCustomersToday((int) newCustomersToday)
                .revenueChartData(revenueChartData)
                .orderStatusData(orderStatusData)
                .lowStockProducts(lowStockProducts)
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

    private boolean isRevenueOrder(Order order) {
        return order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.COMPLETED;
    }

    private BigDecimal sumRevenue(List<Order> orders, Set<String> agentUserIds, boolean b2b) {
        return orders.stream()
                .filter(order -> agentUserIds.contains(order.getUserId()) == b2b)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
