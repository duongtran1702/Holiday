# Module Authentication (Xác thực & Phân quyền)

Module này chịu trách nhiệm cho tất cả các nghiệp vụ liên quan đến xác thực người dùng, cấp phát token (JWT), và xử lý đăng nhập qua bên thứ ba (Google).

## Các thành phần chính

### 1. Controllers
- **`AuthController`**: Nhận các request từ phía Client (đăng nhập, đăng ký, quên mật khẩu, v.v.).

### 2. Services (Nghiệp vụ chính)
- **`AuthenticationServiceImpl`**: 
  - Xử lý Đăng nhập (kiểm tra username/password).
  - Xử lý Đăng ký tài khoản mới.
  - Tạo accessToken và refreshToken trả về cho người dùng.
- **`OAuth2ServiceImpl`**: 
  - Xử lý luồng đăng nhập bằng Google (nhận AccessToken từ Google, xác minh thông tin, tạo/liên kết tài khoản trong hệ thống).
- **`TwoFactorAuthServiceImpl`**: 
  - Xử lý nghiệp vụ xác thực 2 bước (2FA) (sinh mã OTP, kiểm tra mã).
- **`TokenManagementServiceImpl`**: 
  - Quản lý lifecycle của token (refresh token khi hết hạn, thu hồi token, đưa token vào blacklist khi đăng xuất).
- **`AuthEmailServiceImpl`**: 
  - Hàm hỗ trợ gửi các email hệ thống như: OTP xác minh, Email đặt lại mật khẩu.

### 3. Redis & Repository
- **`RefreshTokenRedis` / `RefreshTokenRepository`**: Lưu trữ và truy xuất các Refresh Token đang hoạt động.
- **`TokenBlacklistRepository`**: Quản lý các token đã bị thu hồi để chặn quyền truy cập.

### Luồng hoạt động tiêu biểu
- **Đăng nhập**: User gửi `LoginRequest` -> `AuthenticationServiceImpl` kiểm tra -> Nếu đúng, gọi `TokenManagementServiceImpl` tạo JWT -> Trả về `AuthResponse`.
- **Google Login**: User gửi Google Token -> `OAuth2ServiceImpl` verify qua Google API -> Lấy thông tin Email -> Đăng nhập hoặc Tạo mới User -> Trả về JWT.
