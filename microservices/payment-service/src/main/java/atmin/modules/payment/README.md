# Module Payment (Thanh toán)

Module này chuyên trách việc tích hợp với các cổng thanh toán bên thứ 3 (cụ thể là PayOS) để tạo link thanh toán bằng mã QR và xử lý kết quả trả về.

## 1. Tổng quan (Overview)

Khi khách hàng chọn phương thức thanh toán Online, hệ thống cần tạo một phiên giao dịch (Invoice) và kết nối với đối tác thanh toán. Thay vì để module Order xử lý luôn việc này, Module Payment được thiết kế độc lập nhằm: cô lập logic gọi API bên thứ 3, quản lý bảo mật Webhook (xác thực chữ ký), và phát sinh sự kiện nội bộ để các hệ thống khác lắng nghe. Nếu sau này có thêm VNPay hay MoMo, chỉ cần mở rộng module này.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

```text
[Order Module] → Gọi API Nội bộ: PaymentService.createPaymentLink()
    ↓ (đồng bộ)
    1. Tạo Invoice (status=PENDING)
    2. Gọi PayOS SDK tạo Checkout URL
    3. Trả URL về cho Order Module
    ↓
[Client] ← Nhận URL và mở trang quét QR PayOS

--- Webhook từ bên thứ 3 (Bất đồng bộ với luồng đặt hàng) ---

[PayOS Server] → POST /api/v1/payment/webhook
    ↓
[PaymentController] → [PaymentServiceImpl.handleWebhook()]
    ↓
    Try: Xác thực chữ ký (Signature/MAC)
        ✅ Hợp lệ → Tiếp tục
        ❌ Không hợp lệ → Throw Exception, trả 400 (Chống giả mạo)
    ↓
    Tìm Invoice theo transaction reference
    Cập nhật status = PAID
    ↓
[ApplicationEventPublisher] → Publish `PaymentSuccessEvent`
    ↓ (đồng bộ hoặc bất đồng bộ tuỳ cấu hình Listener)
[Order Module Listener] ← Lắng nghe và cập nhật trạng thái đơn, gửi mail
```

> **Lưu ý quan trọng**: Webhook là public endpoint, bất kỳ ai cũng có thể gọi. Do đó bước xác thực chữ ký (Signature) bằng `PAYOS_CHECKSUM_KEY` là bắt buộc để đảm bảo an toàn tuyệt đối.

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái (State transition table)

| Từ | Sang | Điều kiện | Ai thực hiện |
| :--- | :--- | :--- | :--- |
| `—` | `PENDING` | Bắt đầu tạo link thanh toán | `PaymentService.createPaymentLink()` |
| `PENDING` | `PAID` | Nhận được Webhook báo thành công hợp lệ | `PaymentServiceImpl.handleWebhook()` |
| `PENDING` | `CANCELLED` | Khách huỷ thanh toán / Hết hạn | (Chưa implement, cần gọi API xoá) |

## 4. API / Interface liên quan

**Webhook Nhận Kết Quả:**
`POST /api/v1/payment/webhook`
- **Request**: Payload chuẩn của PayOS chứa `data` và `signature`.
- **Response**: `{ success: true }` (Yêu cầu của PayOS để không gọi lại).

**Internal API (Dùng trong code, không gọi từ ngoài):**
`PaymentService.createPaymentLink(Order order)`
`PaymentInternalApi.getInvoiceByOrderId(String orderId)`

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **PaymentController** | [`PaymentController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/payment/controller/PaymentController.java) | Endpoint nhận Webhook từ PayOS |
| **PaymentService** | [`PaymentServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/payment/service/PaymentServiceImpl.java) | Core logic gọi SDK và check signature |
| **PaymentInternalApi** | [`PaymentInternalApiImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/payment/api/PaymentInternalApiImpl.java) | Cung cấp thông tin Invoice cho Order Module |
| **Invoice Entity** | [`Invoice.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/payment/entity/Invoice.java) | Lưu trạng thái giao dịch |
| **PaymentSuccessEvent**| [`PaymentSuccessEvent.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/payment/event/PaymentSuccessEvent.java) | Event bắn ra khi tiền đã về |

## 6. Cấu hình liên quan (Configuration)

Các biến môi trường bắt buộc (thiết lập trong `.env`):
```env
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
```

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Phụ thuộc 100% vào Webhook của đối tác: Nếu ngắt mạng hoặc PayOS rớt webhook, Invoice sẽ nằm ở `PENDING` vĩnh viễn. Hiện tại chưa có CronJob để chủ động (polling) gọi PayOS check trạng thái giao dịch định kỳ.
- Chưa có cơ chế đối soát (Reconciliation) cuối ngày giữa Database của mình và báo cáo của đối tác.

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Tự đặt một đơn hàng PayOS trên UI, quét mã QR thanh toán bằng App ngân hàng thật (hoặc test).
2. Kiểm tra log Server xem Webhook có nhảy vào không.
3. Nếu muốn test Webhook trên Local: Dùng ngrok (`ngrok http 8080`) và cấu hình URL ngrok lên trang Dashboard của PayOS.
4. Test chống giả mạo: Tự dùng Postman bắn POST vào Webhook với payload bừa bãi, server PHẢI báo lỗi chữ ký không hợp lệ.
