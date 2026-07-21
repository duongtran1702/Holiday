# 🏷️ Holiday Fashion — Code Review & Quality Assessment

> **Ngày đánh giá**: 21/07/2026  
> **Reviewer**: Antigravity AI  
> **Phạm vi**: Toàn bộ Server (Spring Boot) + Client (React/Vite)

---

## 📊 Tổng quan đánh giá

| Hạng mục | Điểm | Ghi chú |
|----------|------|---------|
| Kiến trúc tổng thể | ⭐⭐⭐⭐ | Modular tốt, SOLID cơ bản đạt |
| Bảo mật (Auth/Token) | ⭐⭐⭐⭐⭐ | Xuất sắc: Refresh Token Rotation + Reuse Attack Detection |
| Xử lý lỗi (Error Handling) | ⭐⭐⭐ | Tốt ở server, client còn dùng `alert()` |
| Email System | ⭐⭐⭐⭐ | Retry + Job + Notification, thiếu template engine |
| Payment (PayOS) | ⭐⭐⭐⭐ | Event-driven, tốt. Thiếu idempotency check |
| Client-side Code Quality | ⭐⭐⭐ | Hook pattern tốt, còn mock data, alert() |
| Production Readiness | ⭐⭐⭐ | Nhiều hardcode localhost, chưa env-driven |

---

## ✅ Phần Đã Tốt (Giữ Nguyên)

### 1. Kiến trúc Module hóa — Server

Cấu trúc server chia module rõ ràng (`auth`, `order`, `payment`, `notification`, `product`, `user`, `media`) với mỗi module có đầy đủ:
- `controller/` → REST API endpoints
- `service/` → Business logic (Interface + Impl)
- `entity/` → JPA entities
- `repository/` → Data access
- `dto/` → Request/Response objects
- `api/` → Internal API cho cross-module communication

> Đây là pattern **SOLID** chuẩn. Internal API (`NotificationInternalApi`, `UserInternalApi`, `ProductInternalApi`) giúp các module giao tiếp mà không phụ thuộc trực tiếp vào nhau → **Dependency Inversion** tốt.

### 2. Hệ thống Authentication — Xuất sắc

```
AuthenticationServiceImpl → TokenManagementServiceImpl → TwoFactorAuthServiceImpl
```

**Điểm mạnh nổi bật:**
- ✅ **Refresh Token Rotation**: Mỗi lần refresh, token cũ bị revoke, token mới được cấp
- ✅ **Reuse Attack Detection**: Nếu token đã revoke bị dùng lại → revoke TOÀN BỘ token của user đó
- ✅ **JWT Blacklist** khi logout (Redis TTL theo thời gian hết hạn token)
- ✅ **2FA cho Admin/Staff** qua OTP email với rate limiting (60s cooldown)
- ✅ **Google OAuth2** tích hợp tốt, xử lý cả user mới và user cũ
- ✅ **Portal separation**: Chặn Admin login vào portal Customer và ngược lại

### 3. Event-Driven Architecture cho Payment

```
PayOS Webhook → PaymentServiceImpl → publish PaymentSuccessEvent  
                                          ↓  
                              PaymentEventListener  
                              → Update Order status  
                              → Send receipt email  
```

> Sử dụng Spring `ApplicationEventPublisher` để decouple Payment module khỏi Order module → **Open/Closed Principle** tốt.

### 4. Email Retry System — Resilient Design

```
Email gửi lỗi → EmailStatus = FAILED → emailRetryCount++
     ↓
OrderEmailRetryJob (mỗi 5 phút) → Retry tối đa 5 lần
     ↓ (nếu vẫn fail)
Tạo Notification cho Admin → Admin gửi lại thủ công
```

**Điểm mạnh:**
- ✅ Async email gửi (không block user)
- ✅ Scheduled retry job tự động
- ✅ Admin manual resend endpoint
- ✅ Batch resend tất cả email failed
- ✅ Notification cảnh báo khi hết retry

### 5. Client-side API Layer

- ✅ `callApi.ts` với **Axios interceptor** tự động refresh token
- ✅ **Failed request queue** khi đang refresh → tránh race condition
- ✅ Feature-based folder structure (`features/orders/services/`, `features/orders/hooks/`)
- ✅ Custom hooks tách biệt logic (`useOrderHistory`)
- ✅ Redux store cho state management

### 6. Validation & Security

- ✅ `@Valid @RequestBody` với Jakarta validation (`@NotBlank`, `@NotNull`, `@NotEmpty`)
- ✅ Soft delete pattern (`@SQLDelete`, `@SQLRestriction`)
- ✅ Phone number regex validation
- ✅ Duplicate check trước khi tạo user/staff

### 7. UI Components tốt

- ✅ `AlertDialog` cho confirm actions (cancel order) → UX tốt
- ✅ `StatusBadge` component tái sử dụng
- ✅ Order list + Detail split-pane layout trên desktop

---

## ⚠️ Phần Cần Cải Thiện (Nên Fix Sớm)

### 1. 🔴 Hardcode `localhost` — CRITICAL cho Production

**Vấn đề**: URL `localhost:5173` và `localhost:8080` xuất hiện ở nhiều nơi:

| File | Vị trí | URL hardcode |
|------|--------|--------------|
| `OrderEmailServiceImpl.java` | Line 164, 167, 306 | `http://localhost:5173/b2c/orders` |
| `PaymentServiceImpl.java` | Line 39-40 | `http://localhost:5173/payment/success` và `/cancel` |
| `callApi.ts` | Line 5 | `http://localhost:8080/api/v1` |

**Khuyến nghị**: Dùng environment variables:
```java
// application.properties
app.frontend.url=${FRONTEND_URL:http://localhost:5173}

// Inject vào service
@Value("${app.frontend.url}")
private String frontendUrl;
```
```typescript
// Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
```

### 2. 🔴 Duplicate Order API files — Client

Có **2 file order API** với cách gọi khác nhau:

| File | Cách gọi | Auth |
|------|----------|------|
| `features/orders/services/order.api.ts` | `callApi()` (dùng interceptor) | ✅ Tự động |
| `core/api/order.api.ts` | `axios.post()` trực tiếp | ❌ Lấy `localStorage.getItem("token")` |

**Vấn đề**:
- `core/api/order.api.ts` **KHÔNG** dùng Axios instance đã cấu hình → sẽ **KHÔNG** tự refresh token khi hết hạn
- Lấy token từ `localStorage` thay vì Redux store → không đồng bộ
- URL không dùng `baseURL` đã configured

**Khuyến nghị**: Hợp nhất tất cả API calls vào `features/orders/services/order.api.ts` sử dụng `callApi()`.

### 3. 🟡 `alert()` thay vì Toast — Client UX

Trong `OrderHistoryPage.tsx` (line 48-51):
```tsx
alert('Đã hủy đơn hàng thành công!'); // ← Nên dùng toast
alert('Có lỗi xảy ra khi hủy đơn hàng.');
```

**Khuyến nghị**: Đã có `sonner` trong project (dùng ở `AdminOrders.tsx`), nên thống nhất:
```tsx
import { toast } from 'sonner';
toast.success('Đã hủy đơn hàng thành công!');
toast.error('Có lỗi xảy ra khi hủy đơn hàng.');
```

### 4. 🟡 FQCN (Fully Qualified Class Name) trong code body

Vi phạm **Clean Imports Rule**:

| File | Line | FQCN sử dụng |
|------|------|---------------|
| `OrderEmailServiceImpl.java` | 123 | `java.time.format.DateTimeFormatter.ofPattern(...)` |
| `OrderEmailServiceImpl.java` | 271 | `java.time.format.DateTimeFormatter.ofPattern(...)` |
| `OrderEmailServiceImpl.java` | 323 | `atmin.modules.order.entity.OrderItem` |
| `OrderController.java` | 46, 48 | `java.util.List` |
| `AuthenticationServiceImpl.java` | 81 | `org.springframework.security.core.AuthenticationException` |
| `AuthenticationServiceImpl.java` | 112 | `io.jsonwebtoken.JwtException` |
| `OrderRepository.java` | 20 | `atmin.modules.order.entity.EmailStatus` |

**Khuyến nghị**: Import ở đầu file, dùng tên đơn giản trong code.

### 5. 🟡 HTML Email Template — Inline String Concatenation

`OrderEmailServiceImpl.java` chứa ~200 dòng HTML concatenation bằng `+`. Điều này:
- Khó maintain và debug
- Dễ gây lỗi XSS (không escape customer name/address)
- Duplicate code giữa COD email và Payment email (header, footer giống nhau)

**Khuyến nghị**: Sử dụng Thymeleaf template engine:
```java
@Autowired
private TemplateEngine templateEngine;

Context ctx = new Context();
ctx.setVariable("order", order);
ctx.setVariable("customer", user);
String html = templateEngine.process("email/order-confirmation", ctx);
```

### 6. 🟡 NotificationService — Stub/TODO chưa implement

`NotificationServiceImpl.java` trả về empty data và có TODO:
```java
@Override
public NotificationListResponse getNotifications() {
    return NotificationListResponse.builder()
            .unresolvedCount(0)
            .unreadCount(0)
            .notifications(new ArrayList<>())
            .build();
}

@Override
public void markAsRead(List<String> notificationIds) {
    // TODO: Implement markAsRead
}
```

Trong khi `NotificationInternalApiImpl` **đã tạo notification thật** vào DB → client sẽ không bao giờ hiển thị được chúng.

### 7. 🟡 OrderResponse thiếu fields cho Client

`OrderResponse.java` không chứa:
- `createdAt` (ngày đặt hàng)
- `items` (danh sách sản phẩm)

Nhưng client `OrderHistoryPage.tsx` cần cả hai. Đây có thể đang hoạt động qua Jackson serialization mặc định (vì Order entity có `@Getter`), nhưng nên **explicitly** map trong DTO để kiểm soát data exposure.

### 8. 🟡 `OrderEmailRetryJob` inject concrete class thay vì interface

```java
private final OrderEmailServiceImpl orderEmailService; // ← Concrete class
```

**Khuyến nghị**: Inject interface `IOrderEmailService` thay thế → tuân thủ **Dependency Inversion Principle**.

---

## 🚀 Phần Có Thể Tối Ưu (Nice-to-have)

### 1. Order Code Generation — Race Condition Risk

```java
long orderCode = System.currentTimeMillis() % 10000000000L * 100 + (long)(Math.random() * 100);
```

**Rủi ro**: Hai request đồng thời có thể tạo ra cùng `orderCode` → `UNIQUE constraint violation`.

**Khuyến nghị**: Dùng Database sequence hoặc retry logic khi gặp `DataIntegrityViolationException`.

### 2. Admin Dashboard & Promotions — Mock Data Only

`AdminOverview.tsx` và `AdminPromotions.tsx` đang dùng **100% hardcoded/mock data**:
- Revenue charts → mock `REVENUE_DATA`
- Order status counts → hardcoded
- Voucher data → inline hardcoded array

**Khuyến nghị**: Tạo API endpoints và services thật để fetch dashboard statistics.

### 3. `AdminOrders.tsx` — Dùng Mock Data thay vì Real API

```tsx
import { ORDERS_DATA } from "../../../core/utils/mockData";
```

Admin đang xem **fake orders**, không phải đơn hàng thật từ database.

### 4. ProductService — Thiếu tính năng

`ProductServiceImpl` chỉ có `getAllProducts()` → Thiếu:
- `getProductById()` (đã có trong Internal API nhưng không có trong service)
- CRUD operations
- Pagination (`Pageable`)
- Search/Filter
- Stock management

### 5. Payment — Thiếu Idempotency Check

`handlePayOSWebhook()` không kiểm tra payment đã xử lý chưa → Nếu PayOS gửi webhook 2 lần (retry), sẽ tạo **2 Invoice** cho cùng 1 đơn.

**Khuyến nghị**: Thêm `invoiceRepository.existsByOrderId(order.getId())` check trước khi tạo invoice.

### 6. `Double` cho tiền → Nên dùng `BigDecimal`

`Order.totalAmount` và `OrderItem.price` đang dùng `Double` → floating point precision issues.
```
199999.99999999998 thay vì 200000
```

### 7. `useOrderHistory` — Thiếu Error UX

Hook không expose `error` cho UI hiển thị → User thấy trang trống khi API lỗi, không biết lý do.

### 8. Missing Loading States

- `PaymentResultPage.tsx` useEffect trống → Không verify payment status với server
- `OrderHistoryPage.tsx` loading indicator quá đơn giản ("Đang tải dữ liệu..." text)

### 9. `new Random()` cho OTP — Nên dùng `SecureRandom`

```java
// Hiện tại (predictable)
String otpCode = String.format("%06d", new Random().nextInt(999999));

// Khuyến nghị (cryptographically secure)
String otpCode = String.format("%06d", new SecureRandom().nextInt(999999));
```

### 10. `sendNewStaffEmail` — Log mật khẩu plaintext

```java
log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Mật khẩu cho {} là: {}", toEmail, rawPassword);
```

Dù chỉ trong dev mode, log mật khẩu plaintext là **security risk** nếu log bị leak.

---

## 📋 Checklist Ưu Tiên Hành Động

| # | Ưu tiên | Hạng mục | Effort |
|---|---------|----------|--------|
| 1 | 🔴 P0 | Thay thế hardcode `localhost` bằng env variables | Thấp |
| 2 | 🔴 P0 | Gộp duplicate `order.api.ts`, dùng `callApi()` thống nhất | Thấp |
| 3 | 🔴 P0 | Implement `NotificationServiceImpl` thật (đọc từ DB) | Trung bình |
| 4 | 🟡 P1 | Fix FQCN → Clean imports | Thấp |
| 5 | 🟡 P1 | Thay `alert()` bằng `toast()` ở `OrderHistoryPage` | Thấp |
| 6 | 🟡 P1 | Fix `OrderEmailRetryJob` inject interface thay vì concrete | Thấp |
| 7 | 🟡 P1 | Thêm idempotency check cho webhook | Thấp |
| 8 | 🟡 P1 | Dùng `SecureRandom` thay `Random` cho OTP | Thấp |
| 9 | 🟠 P2 | Thay HTML string concatenation bằng Thymeleaf template | Trung bình |
| 10 | 🟠 P2 | Kết nối Admin Dashboard/Orders/Promotions với API thật | Cao |
| 11 | 🟠 P2 | Chuyển `Double` → `BigDecimal` cho money fields | Trung bình |
| 12 | 🟠 P2 | Xử lý race condition orderCode generation | Trung bình |

---

## 🏆 Kết Luận

**Đánh giá tổng thể: 7.5/10** — Codebase có nền tảng kiến trúc tốt, đặc biệt là hệ thống Auth/Security và Email Retry. Các vấn đề chính tập trung vào:

1. **Production readiness** (hardcode localhost, mock data)
2. **Code consistency** (duplicate API, FQCN, alert vs toast)
3. **Incomplete features** (NotificationService stub, Dashboard mock)

> **Khuyến nghị tốt nhất**: Ưu tiên fix 3 item P0 trước (env variables, gộp API, implement notification) → sẽ tăng đáng kể chất lượng production-ready của project.
