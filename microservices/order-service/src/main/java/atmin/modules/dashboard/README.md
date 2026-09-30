# Module Dashboard (Bảng Điều Khiển Tổng Quan)

Module này đóng vai trò như một bộ tổng hợp (Aggregator). Nó không có bảng cơ sở dữ liệu riêng, mà làm nhiệm vụ truy vấn, thống kê, và tính toán số liệu từ nhiều module khác nhau (Order, Product, User) để phục vụ cho màn hình báo cáo của Admin.

## 1. Tổng quan (Overview)

Mục đích chính của module này là cung cấp một API duy nhất (`/api/v1/dashboard/metrics`) trả về toàn bộ dữ liệu cần thiết cho trang chủ của Admin Panel. Việc này giúp giảm số lượng network request từ Client (thay vì Client phải tự gọi API lấy số lượng Đơn hàng, Doanh thu, Tồn kho riêng lẻ, nay chỉ cần 1 request).

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

**Luồng lấy thống kê Dashboard:**
```text
[Client: Dashboard.tsx] 
    1. useEffect gọi `dashboardApi.getMetrics()`
    ↓ 
[Server: DashboardController] 
    2. Gọi `DashboardService.getDashboardMetrics()`
    ↓
[Server: DashboardService]
    3. Truy vấn OrderRepository: Lấy tổng doanh thu, đơn mới hôm nay, doanh thu 7 tháng gần nhất.
    4. Truy vấn ProductRepository: Lọc các sản phẩm có Stock <= 5 (sắp hết hàng).
    5. Truy vấn UserRepository: Lấy số lượng Agent đang hoạt động.
    6. Tập hợp lại thành `DashboardResponse` và trả về.
    ↓
[Client: Dashboard.tsx]
    7. Parse dữ liệu và truyền vào các Component (RevenueChart, StatsCard, v.v.)
```

### Core Code Snippet (Server)

*File: `server/.../dashboard/service/DashboardService.java`*
```java
@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics() {
        // 1. Doanh thu hôm nay
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        List<Order> todayOrders = orderRepository.findByCreatedAtBetween(startOfDay, ...);
        BigDecimal todayRevenue = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.PAID)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Thống kê sản phẩm sắp hết hàng
        List<Product> products = productRepository.findAll();
        long lowStockSkuCount = products.stream()
                .filter(p -> p.getStock() != null)
                .flatMap(p -> p.getStock().values().stream())
                .filter(qty -> qty <= 5) // Ngưỡng hết hàng
                .count();

        // 3. Tính toán Chart (7 tháng) & Trạng thái Đơn hàng...
        
        return DashboardResponse.builder()
                .todayRevenue(todayRevenue)
                .newOrders(todayOrders.size())
                .lowStockSkuCount((int) lowStockSkuCount)
                .build();
    }
}
```

### Core Code Snippet (Client)

*Ví dụ phía Client (giả định theo luồng chuẩn):*
```tsx
const { data: metrics, isLoading } = useQuery(['dashboardMetrics'], dashboardApi.getMetrics);

if (isLoading) return <Skeleton />;

return (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard title="Doanh thu hôm nay" value={formatVND(metrics.todayRevenue)} />
    <StatsCard title="Đơn hàng mới" value={metrics.newOrders} />
    <StatsCard title="Cảnh báo tồn kho" value={metrics.lowStockSkuCount} />
  </div>
);
```

## 3. API / Interface liên quan

**Lấy Thống kê Tổng Hợp:**
`GET /api/v1/dashboard/metrics`
- **Response Model**: `DashboardResponse` (Bao gồm Doanh thu, số lượng đơn, data vẽ Chart, danh sách đơn hàng gần đây).

## 4. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **Controller** | [`DashboardController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/dashboard/controller/DashboardController.java) | API Endpoint |
| **Service** | [`DashboardService.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/dashboard/service/DashboardService.java) | Tính toán logic, Aggregate data từ nhiều Repo |
| **Response DTO**| [`DashboardResponse.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/dashboard/api/DashboardResponse.java) | Định dạng Payload trả về Client |

## 5. Rủi ro đã biết / Chưa xử lý (Known limitations)

- **Performance Bảng Order**: Hiện tại `DashboardService` gọi `findAll()` và tính toán bằng Java Stream trên Server (ví dụ: vòng lặp tính doanh thu 7 tháng). Nếu số lượng Order lên hàng chục ngàn, RAM sẽ phình to và thời gian response sẽ rất chậm.
- **Giải pháp đề xuất (Tương lai)**: Nên chuyển các phép tính Sum/Count xuống tầng Database bằng Native Query SQL (Group by Month, Sum(Total)) hoặc Criteria API, thay vì lôi toàn bộ Entity lên bộ nhớ.
- **Cache**: Hiện tại dữ liệu Dashboard tính toán realtime trên mỗi Request. Nên dùng `@Cacheable` (Redis) với TTL 5-10 phút để giảm tải Database khi nhiều Admin cùng truy cập.
