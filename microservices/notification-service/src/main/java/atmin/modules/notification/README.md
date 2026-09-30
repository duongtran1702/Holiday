# Module Notification (Thông báo Hệ thống)

Module này quản lý hệ thống thông báo cho Quản trị viên (Admin/Staff), dùng để báo hiệu khi có sự kiện quan trọng xảy ra trong hệ thống (VD: Đơn hàng mới, Sản phẩm sắp hết hàng, Khách hàng yêu cầu hỗ trợ).

## 1. Tổng quan (Overview)

Hiện tại, hệ thống thông báo hoạt động dưới dạng "Pull" (Client chủ động gọi API định kỳ hoặc khi load trang) thay vì "Push" (WebSocket) để đơn giản hoá kiến trúc và tiết kiệm tài nguyên kết nối dài hạn cho những luồng không đòi hỏi tính Realtime tính bằng mili-giây như Chat. Các Module khác (như Order) khi có sự kiện sẽ gọi `NotificationRepository` để insert thông báo vào DB, và Client sẽ hiển thị lên chuông thông báo.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

**Luồng nhận thông báo:**
```text
[Bất kỳ Module nào (VD: OrderService)]
    1. Có đơn hàng mới → Gọi `NotificationRepository.save(new Notification(...))`
    ↓ 
[Client: LayoutAtmin.tsx / NotificationBell.tsx] 
    2. Mỗi 30-60 giây hoặc khi load trang, gọi `GET /api/v1/notifications`
    ↓
[Server: NotificationController] → [NotificationServiceImpl]
    3. Đếm `unresolvedCount` (chưa xử lý) và `unreadCount` (chưa đọc).
    4. Lấy 50 thông báo mới nhất.
    5. Trả về `NotificationListResponse`.
    ↓
[Client: UI Chuông thông báo]
    6. Nhận dữ liệu, hiển thị số badge màu đỏ (`unreadCount`).
    7. Khi user click vào xem → Gọi API `POST /api/v1/notifications/read`
```

### Core Code Snippet (Server)

*File: `server/.../notification/service/NotificationServiceImpl.java`*
```java
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications() {
        // Gom nhóm data để Client đỡ phải gọi nhiều API
        long unresolvedCount = notificationRepository.countByIsResolvedFalse();
        long unreadCount = notificationRepository.countByIsReadFalse();
        
        List<Notification> latestNotifications = notificationRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50));
        
        return NotificationListResponse.builder()
                .unresolvedCount(unresolvedCount)
                .unreadCount(unreadCount)
                .notifications(latestNotifications)
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(List<String> notificationIds) {
        // Cập nhật trạng thái bằng Native Query / Bulk Update để tối ưu
        notificationRepository.markAsRead(ids);
    }
}
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái

| Từ | Sang | Ý nghĩa / Điều kiện |
| :--- | :--- | :--- |
| `isRead = false` | `isRead = true` | Admin click mở menu chuông thông báo và nhìn thấy |
| `isResolved = false` | `isResolved = true` | Admin đã nhấp vào thông báo để đi tới trang chi tiết (xử lý đơn) |

## 4. API / Interface liên quan

**Lấy danh sách thông báo:**
`GET /api/v1/notifications`
- **Response**: `{ unreadCount: int, unresolvedCount: int, notifications: [...] }`

**Đánh dấu đã đọc:**
`POST /api/v1/notifications/read`
- **Request Body**: `{ ["uuid-1", "uuid-2"] }` (Mảng các ID)

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **Controller** | [`NotificationController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/notification/controller/NotificationController.java) | Endpoint API |
| **Service** | [`NotificationServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/notification/service/NotificationServiceImpl.java) | Logic lấy thống kê và cập nhật trạng thái |

## 6. Rủi ro đã biết / Chưa xử lý (Known limitations)

- **Scalability**: Bảng Notification sẽ phình to rất nhanh theo thời gian (vì mỗi hành động đều sinh ra 1 record). Nên có một CronJob dọn dẹp các thông báo đã đọc/đã xử lý và cũ hơn 30 ngày.
- **Trải nghiệm Realtime**: Vì Client đang dùng cơ chế Polling hoặc fetch on load, thông báo sẽ không xuất hiện ngay lập tức mà bị delay. Nếu sau này cần realtime, có thể tích hợp chung vào luồng WebSocket STOMP của Chat Module (Ví dụ: publish lên `/topic/admin`).
