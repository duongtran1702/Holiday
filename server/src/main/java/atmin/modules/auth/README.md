# Module Auth (Xác thực và Phân quyền)

Module này quản lý việc bảo mật cốt lõi: Xác thực danh tính (Login/Register), Cấp phát và Quản lý Token (JWT/Refresh Token), Đăng nhập mạng xã hội (OAuth2 Google) và Xác thực 2 bước (2FA).

## 1. Tổng quan (Overview)

Mọi yêu cầu truy cập vào hệ thống đều phải đi qua chốt chặn bảo mật. Module này tách biệt hoàn toàn khỏi logic người dùng thông thường (User Module) để tập trung duy nhất vào Authentication & Authorization. Thiết kế này giúp dễ dàng thay thế công nghệ bảo mật (VD: đổi JWT sang Session) mà không ảnh hưởng đến toàn bộ ứng dụng, đồng thời tập trung xử lý các rủi ro bảo mật như chiếm quyền điều khiển (Token theft) thông qua Token Blacklisting.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

Dưới đây là luồng Đăng nhập nâng cao kết hợp Xác minh 2 bước (2FA), cho thấy cách Server và Client phối hợp với nhau.

**Luồng Login có 2FA:**
```text
[Client: useAdminLogin.ts] 
    1. Gọi authApi.login({ email, password })
    ↓ 
[Server: AuthController] → [AuthenticationServiceImpl.authenticate()]
    2. Spring Security: Xác thực email/password.
        ❌ Sai → Throw BadCredentialsException
    3. Kiểm tra 2FA
        ⚠️ Bật 2FA → Server trả về HTTP 200: { user, require2fa: true }
    ↓
[Client: useAdminLogin.ts]
    4. Nhận response, nếu `require2fa` === true:
        - Đổi state sang nhập OTP (`setAdminStep("otp")`)
        - Không lưu Access Token, không chuyển trang.
    5. User nhập mã OTP trên UI → Gọi authApi.verify2fa({ email, otpCode })
    ↓
[Server: AuthController] → [TwoFactorAuthServiceImpl.verifyOtp()]
    6. Kiểm tra mã OTP. Nếu đúng → Cấp AccessToken.
    ↓
[Client: useAdminLogin.ts]
    7. Lưu JWT vào Redux, điều hướng vào `/admin`.
```

### Core Code Snippet (Client)

*File: `client/src/features/auth/hooks/useAdminLogin.ts`*
```typescript
const handleAdminCreds = async () => {
    try {
        const response = await authApi.login({ email: adminEmail, password: adminPw, portal: 'admin' });
        const { user, require2fa, accessToken } = response.data;
        
        // Nếu user có bật 2FA, backend sẽ không cấp token ngay mà trả về require2fa = true
        if (require2fa) {
            setAdminStep("otp"); // Chuyển UI sang màn hình nhập OTP
            setCountdown(60);
        } else {
            // Không có 2FA, đăng nhập thành công ngay
            dispatch(setCredentials({ user, accessToken, role: roleStr }));
            navigate("/admin");
        }
    } catch (err: any) {
        // Xử lý lỗi (sai pass, locked, ...)
    }
};

const handleOtpVerify = async () => {
    const code = otp.join("");
    try {
        const response = await authApi.verify2fa({ email: adminEmail, otpCode: code });
        const { user, accessToken } = response.data;
        
        // Cập nhật Redux sau khi verify thành công
        dispatch(setCredentials({ user, accessToken, role: roleStr }));
        navigate("/admin");
    } catch (err: any) {
        // Xử lý sai mã OTP
    }
};
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
- Cơ chế Rate Limiting chống Brute-force Login đã được triển khai ở Client (Lock sau 5 lần), nhưng ở tầng API/Server chưa có giới hạn IP (Cần thêm filter nếu đưa lên production).

## 8. Cách test / kiểm tra thủ công (How to verify)

1. **Test Login 2FA Flow**: Login tài khoản có bật 2FA → Màn hình đổi sang nhập OTP, check Network tab sẽ thấy `/login` trả về `require2fa: true`. Nhập OTP → Chuyển vào dashboard.
2. **Test Blacklist (Logout)**: Lấy Token gửi `/logout`. Sau đó dùng lại Token đó gửi request lấy profile `/users/me`. Expect: Bị từ chối (401 Unauthorized).
