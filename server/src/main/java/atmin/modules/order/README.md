# Module Order (Quản lý Đơn hàng)

Module này đóng vai trò lõi trong hệ thống E-commerce, quản lý toàn bộ vòng đời của một Đơn hàng từ lúc tạo, thanh toán, đến lúc cập nhật trạng thái giao hàng.

## Các thành phần chính

### 1. Controllers
- **`OrderController`**: Xử lý các HTTP request từ người dùng (Tạo đơn hàng, Xem lịch sử đơn hàng, Admin duyệt đơn).

### 2. Services (Nghiệp vụ chính)
- **`OrderServiceImpl`**:
  - Hàm `createOrder(...)`: Xử lý logic tính toán tổng tiền, lưu dữ liệu Đơn hàng (`Order`) và các chi tiết sản phẩm (`OrderItem`) vào Database.
  - Hàm `updateOrderStatus(...)`: Dành cho nhân viên cập nhật trạng thái đơn (Đang giao, Hoàn thành, Đã hủy).
  - Hàm `getOrdersByUser(...)` / `getAllOrders(...)`: Truy xuất dữ liệu đơn hàng.
- **`OrderEmailServiceImpl`**:
  - Hàm `sendOrderConfirmationEmail`: Gửi email báo đặt hàng thành công (dành cho đơn COD).
  - Hàm `sendPaymentSuccessEmail`: Gửi biên lai thanh toán (khi thanh toán Online thành công).
  - Hàm hỗ trợ `buildOrderItemsHtml`: (Vừa được Refactor) Tạo ra bảng HTML chứa danh sách sản phẩm để nhúng vào Email, tránh lặp lại code.

### 3. Events & Listeners (Xử lý Bất đồng bộ)
- **`PaymentEventListener`**: 
  - Lắng nghe sự kiện `PaymentSuccessEvent` (được phát ra từ Module Payment khi khách thanh toán xong).
  - Khi bắt được sự kiện, nó tự động cập nhật trạng thái Đơn hàng thành "ĐÃ THANH TOÁN" và gọi `OrderEmailServiceImpl` để gửi biên lai mà không làm gián đoạn luồng request chính.

### 4. API Nội bộ (Inter-module API)
- **`OrderInternalApiImpl`**: 
  - Cung cấp các hàm cho các Module khác gọi tới (VD: Module Payment cần lấy thông tin số tiền của Order để tạo link thanh toán). Giao tiếp lỏng lẻo giúp tránh phụ thuộc vòng (Circular Dependency).
