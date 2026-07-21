package atmin.modules.dashboard.api;

import atmin.modules.order.dto.OrderResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal todayRevenue;
    private int newOrders;
    private int lowStockSkuCount;
    private int activeAgents;
    
    // Using Object to keep it flexible, or create specific classes
    private Object revenueChartData;
    private Object orderStatusData;
    
    private List<OrderResponse> recentOrders;
}
