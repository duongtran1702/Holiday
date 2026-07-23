# Module Order (Quản lý Đơn hàng)

Module này đóng vai trò lõi trong hệ thống E-commerce, quản lý toàn bộ vòng đời của một Đơn hàng từ lúc tạo, thanh toán, đến lúc cập nhật trạng thái giao hàng.

## 1. Tổng quan (Overview)

Khi khách đặt hàng, hệ thống phải gửi email xác nhận. Ban đầu việc gửi mail được gọi trực tiếp trong luồng đặt hàng, nhưng gây lỗi khi SMTP service down — đơn vẫn lưu nhưng khách không nhận được mail, và không có cơ chế gửi bù. Feature này redesign lại theo hướng tách rời việc "ghi nhận đơn hàng" khỏi "gửi mail", đảm bảo không mất mail dù hệ thống lỗi tạm thời bằng **Cơ chế Outbox Pattern nhúng (Embedded State)** kết hợp **Spring Events**.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

Luồng xử lý được tách bạch rõ ràng giữa phần lưu dữ liệu (đồng bộ) và phần gửi mail (bất đồng bộ).

**Tương tác Client - Backend khi Tạo Đơn:**
```text
[Client: CheckoutPage.tsx]
    1. Validate giỏ hàng, gọi `orderApi.createOrder()`
    ↓
[Server: OrderController] → [OrderService.createOrder()]
    2. Validate stock, tính tổng tiền.
    3. Save Order (status=PENDING, email_status=PENDING).
    4. Trừ Stock thông qua `ProductInternalApi`.
    5. Transaction COMMIT.
    6. Trả về `OrderResponse` (Kèm `paymentUrl` nếu chọn PAYOS).
    ↓
[Client: CheckoutPage.tsx]
    7. Nhận response ngay lập tức (Không phải chờ BE gửi mail).
    8. Nếu `paymentUrl` có tồn tại → Chuyển hướng (window.location.href).
       Nếu COD → Chuyển tới trang "Cảm ơn".

--- Ranh giới đồng bộ/bất đồng bộ (Phía Server) ---

[TransactionalEventListener AFTER_COMMIT] (@Async, thread riêng)
    ↓
[EmailListener.onOrderCreated()]
    ↓
    Try: EmailService.send(order)
        ✅ Success → update email_status = SENT
        ❌ Exception → giữ nguyên PENDING/FAILED, log lỗi.
```

### Core Code Snippet (Client)

*File: `client/src/features/orders/services/order.api.ts`*
```typescript
export const orderApi = {
    createOrder: (data: CreateOrderRequest) => {
        // Gửi lên BE: Giỏ hàng, Địa chỉ, SĐT, Phương thức (COD/PAYOS)
        return callApi<ApiResponse<OrderResponse>>('/orders', 'POST', data);
    },
    // Chức năng cho Admin khi Mail bị lỗi
    resendOrderEmail: (orderId: string) => {
        return callApi<ApiResponse<string>>(`/orders/${orderId}/resend-email`, 'POST');
    }
};
```

*File: `client/src/features/checkout/pages/CheckoutPage.tsx` (Ví dụ xử lý)*
```tsx
const handleCheckout = async () => {
    try {
        const response = await orderApi.createOrder(orderData);
        const { paymentUrl } = response.data;
        
        // Nếu chọn thanh toán qua PayOS thì BE sẽ trả về link cổng thanh toán
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            // COD thì báo thành công ngay
            navigate('/thank-you');
        }
    } catch (error) {
        toast.error("Không thể tạo đơn hàng");
    }
};
```

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

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **OrderController** | [`OrderController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/controller/OrderController.java) | Nhận request API từ FE |
| **OrderService** | [`OrderServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/service/OrderServiceImpl.java) | Nghiệp vụ tạo đơn, publish event |
| **OrderCreatedEvent** | [`OrderCreatedEvent.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/event/OrderCreatedEvent.java) | Event nội bộ báo hiệu đơn hàng đã tạo |
| **EmailListener** | [`EmailListener.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/listener/EmailListener.java) | Xử lý gửi mail (cùng EmailService) khi bắt event |
| **OrderEmailRetryJob**| [`OrderEmailRetryJob.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/order/job/OrderEmailRetryJob.java) | Job quét retry định kỳ (5 phút) |

## 6. Cấu hình liên quan (Configuration)

Các hằng số sau đang được sử dụng (hardcode trong `@Scheduled` hoặc config file):
- `spring.mail.*`: Thông tin tài khoản SMTP.
- `fixedDelay`: `300000` (5 phút) - tần suất chạy `OrderEmailRetryJob`.
- Max Retry Limit: `3` (giới hạn thử lại để tránh gửi liên tục vào hòm thư chết).
- Grace Period: `5` phút (độ trễ khi query DB để tránh conflict với Async listener).

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Chưa có cơ chế cảnh báo (alert) tự động khi 1 đơn hàng đạt `email_retry_count = 3` mà vẫn `FAILED` — hiện tại Admin phải xem trạng thái DB hoặc giao diện.
- Chưa xử lý trường hợp gửi mail thành công nhưng việc update DB sang `SENT` thất bại (chết server đúng lúc đó). Lúc này DB vẫn là `PENDING` và Job sẽ gửi trùng thêm 1 lần nữa ở lần quét tới.

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Tắt mạng / Đổi mật khẩu cấu hình SMTP tạm thời (`spring.mail.password=sai`).
2. Mua hàng và đặt đơn thành công. Trạng thái phản hồi về FE là bình thường.
3. Vào DB kiểm tra, `email_status` lúc này là `FAILED` (do Async thread thử gửi nhưng chết).
4. Khôi phục lại đúng mật khẩu SMTP.
5. Đợi tối đa 5 phút cho Job quét, hoặc chủ động gọi API `POST /api/v1/orders/{id}/resend-email`.
6. Kiểm tra lại hộp thư và trạng thái `SENT` trong DB.
