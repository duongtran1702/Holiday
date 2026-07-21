# Module Order (Quản lý Đơn hàng)

Module này đóng vai trò lõi trong hệ thống E-commerce, quản lý toàn bộ vòng đời của một Đơn hàng từ lúc tạo, thanh toán, đến lúc cập nhật trạng thái giao hàng.

## 1. Tổng quan (Overview)

Khi khách đặt hàng, hệ thống phải gửi email xác nhận. Ban đầu việc gửi mail được gọi trực tiếp trong luồng đặt hàng, nhưng gây lỗi khi SMTP service down — đơn vẫn lưu nhưng khách không nhận được mail, và không có cơ chế gửi bù. Feature này redesign lại theo hướng tách rời việc "ghi nhận đơn hàng" khỏi "gửi mail", đảm bảo không mất mail dù hệ thống lỗi tạm thời bằng **Cơ chế Outbox Pattern nhúng (Embedded State)** kết hợp **Spring Events**.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

Luồng xử lý được tách bạch rõ ràng giữa phần lưu dữ liệu (đồng bộ) và phần gửi mail (bất đồng bộ).

```text
[Client] → POST /api/orders
    ↓ (đồng bộ, trong 1 transaction)
[OrderController] → [OrderService.createOrder()]
    ↓
    1. Validate request
    2. Save Order (status=PENDING, email_status=PENDING)
    3. Transaction COMMIT
    ↓ (transaction đã đóng, an toàn)
[Response trả về client ngay] ← Client KHÔNG chờ bước gửi mail

--- Ranh giới đồng bộ/bất đồng bộ ---

[TransactionalEventListener AFTER_COMMIT] (@Async, thread riêng)
    ↓
[EmailListener.onOrderCreated()] / [PaymentEventListener.onPaymentSuccess()]
    ↓
    Try: EmailService.send(order)
        ✅ Success → update email_status = SENT
        ❌ Exception → giữ nguyên PENDING/FAILED, log lỗi, KHÔNG throw lên trên
                        (vì đã async, throw lên cũng không ai catch được)

--- Lưới an toàn dự phòng (chạy độc lập, không phụ thuộc luồng trên) ---

[OrderEmailRetryJob] (@Scheduled, mỗi 5 phút)
    ↓
    SELECT * FROM orders WHERE email_status IN ('PENDING','FAILED') 
                          AND email_retry_count < 3
                          AND created_at < now() - 5 phút   -- tránh đụng độ với luồng chính đang xử lý
    ↓
    Với mỗi order: gọi lại OrderService.resendOrderEmail(), update status tương ứng
```

> **Lưu ý quan trọng**: Điều kiện `created_at < now() - 5 phút` là để tránh trường hợp job retry chạy đúng lúc luồng chính (event listener) đang xử lý dòng đó, gây ra gửi trùng mail. Tuyệt đối không xoá điều kiện này.

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái (State transition table)

| Từ | Sang | Điều kiện | Ai thực hiện |
| :--- | :--- | :--- | :--- |
| `—` | `PENDING` | Đơn hàng vừa tạo | `OrderService.createOrder()` |
| `PENDING` | `SENT` | Gửi mail thành công | `EmailListener` hoặc `OrderEmailRetryJob` |
| `PENDING` | `FAILED` | Gửi mail lỗi, tăng `email_retry_count` | `EmailListener` hoặc `OrderEmailRetryJob` |
| `FAILED` | `SENT` | Retry thành công | `OrderEmailRetryJob` |
| `FAILED` | `FAILED (vĩnh viễn)` | `email_retry_count` >= 3 | `OrderEmailRetryJob` — cần xử lý thủ công |

## 4. API / Interface liên quan

**Tạo Đơn Hàng:**
`POST /api/v1/orders`
- **Request**: `{ items: [...], paymentMethod, shippingAddress, ... }`
- **Response**: `{ orderId, status, paymentUrl }` ← trả ngay, KHÔNG chờ email

**Gửi Lại Email (Thủ Công):**
`POST /api/v1/orders/{id}/resend-email`
- **Request**: Trống
- **Response**: `{ message: "Đã yêu cầu gửi lại email" }`

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **OrderController** | [`OrderController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/controller/OrderController.java) | Nhận request API từ FE |
| **OrderService** | [`OrderServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/service/OrderServiceImpl.java) | Nghiệp vụ tạo đơn, publish event |
| **OrderCreatedEvent** | [`OrderCreatedEvent.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/event/OrderCreatedEvent.java) | Event nội bộ báo hiệu đơn hàng đã tạo |
| **EmailListener** | [`EmailListener.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/listener/EmailListener.java) | Xử lý gửi mail (cùng EmailService) khi bắt event |
| **OrderEmailRetryJob**| [`OrderEmailRetryJob.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/job/OrderEmailRetryJob.java) | Job quét retry định kỳ (5 phút) |
| **OrderEmailService** | [`OrderEmailServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/service/OrderEmailServiceImpl.java) | Logic gọi SMTP thực tế và update DB status |

## 6. Cấu hình liên quan (Configuration)

Các hằng số sau đang được sử dụng (hardcode trong `@Scheduled` hoặc config file):
- `spring.mail.*`: Thông tin tài khoản SMTP.
- `fixedDelay`: `300000` (5 phút) - tần suất chạy `OrderEmailRetryJob`.
- Max Retry Limit: `3` (giới hạn thử lại để tránh gửi liên tục vào hòm thư chết).
- Grace Period: `5` phút (độ trễ khi query DB để tránh conflict với Async listener).

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Chưa có cơ chế cảnh báo (alert) tự động khi 1 đơn hàng đạt `email_retry_count = 3` mà vẫn `FAILED` — hiện tại Admin phải xem trạng thái DB hoặc giao diện (nếu có).
- Chưa xử lý trường hợp gửi mail thành công nhưng việc update DB sang `SENT` thất bại (chết server đúng lúc đó). Lúc này DB vẫn là `PENDING` và Job sẽ gửi trùng thêm 1 lần nữa ở lần quét tới.

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Tắt mạng / Đổi mật khẩu cấu hình SMTP tạm thời (`spring.mail.password=sai`).
2. Mua hàng và đặt đơn thành công. Trạng thái phản hồi về FE là bình thường.
3. Vào DB kiểm tra, `email_status` lúc này là `FAILED` (do Async thread thử gửi nhưng chết).
4. Khôi phục lại đúng mật khẩu SMTP.
5. Đợi tối đa 5 phút cho Job quét, hoặc chủ động gọi API `POST /api/v1/orders/{id}/resend-email`.
6. Kiểm tra lại hộp thư và trạng thái `SENT` trong DB.
