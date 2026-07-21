# Module Auth (Xác thực và Phân quyền)

Module này quản lý việc bảo mật cốt lõi: Xác thực danh tính (Login/Register), Cấp phát và Quản lý Token (JWT/Refresh Token), Đăng nhập mạng xã hội (OAuth2 Google) và Xác thực 2 bước (2FA).

## 1. Tổng quan (Overview)

Mọi yêu cầu truy cập vào hệ thống đều phải đi qua chốt chặn bảo mật. Module này tách biệt hoàn toàn khỏi logic người dùng thông thường (User Module) để tập trung duy nhất vào Authentication & Authorization. Thiết kế này giúp dễ dàng thay thế công nghệ bảo mật (VD: đổi JWT sang Session) mà không ảnh hưởng đến toàn bộ ứng dụng, đồng thời tập trung xử lý các rủi ro bảo mật như chiếm quyền điều khiển (Token theft) thông qua Token Blacklisting.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

**Luồng Login cơ bản:**
```text
[Client] → POST /api/v1/auth/login
    ↓ 
[AuthController] → [AuthenticationServiceImpl.authenticate()]
    ↓
    1. Spring Security: Xác thực email/password.
        ❌ Sai → Throw BadCredentialsException
    2. Kiểm tra trạng thái User (Đã bị khoá? Đã xác thực email chưa?)
    3. Kiểm tra 2FA
        ⚠️ Nếu bật 2FA → Trả về thông báo yêu cầu nhập mã OTP
    4. Nếu OK hết → Gọi TokenManagementService tạo AccessToken & RefreshToken
    5. Trả JWT về cho Client.
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái (State transition table)

(Riêng cho Refresh Token Lifecycle)
| Từ | Sang | Điều kiện | Ai thực hiện |
| :--- | :--- | :--- | :--- |
| `—` | `ACTIVE` | Cấp token mới khi Login | `TokenManagementService` |
| `ACTIVE` | `REVOKED` | User tự Logout | `TokenManagementService` |
| `ACTIVE` | `EXPIRED` | Quá thời gian sống định sẵn | (Tự động do cơ chế JWT/DB) |
| `ACTIVE` | `BLACKLISTED` | Admin khoá tài khoản/Force Logout | `TokenManagementService` |

## 4. API / Interface liên quan

**Đăng nhập / Cấp Token:**
`POST /api/v1/auth/login`
- **Request**: `{ email, password }`
- **Response**: `{ accessToken, refreshToken, requires2FA }`

**Lấy lại Token mới (Refresh):**
`POST /api/v1/auth/refresh-token`
- **Request**: `{ refreshToken }`
- **Response**: `{ accessToken, refreshToken }`

**Logout:**
`POST /api/v1/auth/logout` (Yêu cầu JWT)

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **AuthController** | [`AuthController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/auth/controller/AuthController.java) | Nhận các request đăng nhập, logout, 2fa |
| **AuthenticationService** | [`AuthenticationServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/auth/service/AuthenticationServiceImpl.java) | Logic chính xác thực |
| **TokenManagement** | [`TokenManagementServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/auth/service/TokenManagementServiceImpl.java) | Quản lý vòng đời Token, Blacklist |
| **TwoFactorAuth** | [`TwoFactorAuthServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/auth/service/TwoFactorAuthServiceImpl.java) | Xử lý OTP, QR Code |
| **OAuth2Service** | [`OAuth2ServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/auth/service/OAuth2ServiceImpl.java) | Xử lý đăng nhập qua Google |

## 6. Cấu hình liên quan (Configuration)

Các biến môi trường:
```env
JWT_SECRET_KEY=...
JWT_EXPIRATION_MS=...
JWT_REFRESH_EXPIRATION_MS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Nếu lộ JWT Access Token, kẻ gian có thể truy cập hệ thống cho đến khi token hết hạn (hiện tại chưa quét blacklist liên tục với Access Token để tối ưu performance, chỉ quét lúc Refresh).
- Chưa có cơ chế Rate Limiting chống Brute-force Login (ví dụ khoá 15 phút nếu sai password 5 lần liên tiếp).

## 8. Cách test / kiểm tra thủ công (How to verify)

1. **Test Login**: Dùng Postman gửi POST `/login` với email/pass sai → Expect 401. Gửi đúng → Expect nhận Access Token.
2. **Test Blacklist (Logout)**: Lấy Token gửi `/logout`. Sau đó dùng lại Token đó gửi request lấy profile `/users/me`. Expect: Bị từ chối (401 Unauthorized).
