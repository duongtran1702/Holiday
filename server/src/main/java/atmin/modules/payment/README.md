# Module Payment (Thanh toán)

Module này chuyên trách việc tích hợp với các cổng thanh toán bên thứ 3 (cụ thể là PayOS) để tạo link thanh toán bằng mã QR và xử lý kết quả trả về.

## Các thành phần chính

### 1. Controllers
- **`PaymentController`**: 
  - Cung cấp API tạo Link thanh toán (`POST /payment/create`).
  - Điểm tiếp nhận Webhook từ PayOS (`POST /payment/webhook`) báo cáo giao dịch thành công.

### 2. Services (Nghiệp vụ chính)
- **`PaymentServiceImpl`**:
  - Hàm `createPaymentLink(...)`: Lấy thông tin giá trị đơn hàng thông qua `OrderInternalApi`, sau đó gọi SDK của PayOS để khởi tạo mã QR / Link thanh toán, lưu thông tin Giao dịch (Invoice) vào Database với trạng thái `PENDING`.
  - Hàm `handleWebhook(...)`: Khi người dùng chuyển khoản xong, PayOS sẽ gọi vào hàm này. Hàm sẽ xác thực chữ ký (Signature) để chống giả mạo, cập nhật trạng thái Invoice thành `PAID`.
  - Phát sinh sự kiện (Event Publisher): Khi `Invoice` được cập nhật thành `PAID`, hàm này sẽ dùng `ApplicationEventPublisher` bắn ra sự kiện `PaymentSuccessEvent` để module Order có thể bắt lấy và gửi Email tự động.

### Luồng hoạt động tiêu biểu
1. User nhấn "Thanh toán Online" -> Gọi `createPaymentLink` -> Trả về URL của PayOS.
2. User quét mã QR bằng App Ngân hàng -> Chuyển khoản thành công.
3. PayOS gửi tín hiệu về `handleWebhook` -> Xác thực an toàn -> Lưu hóa đơn -> Bắn `PaymentSuccessEvent` -> Module Order lắng nghe và tự động chuyển trạng thái đơn + gửi biên lai Email.
