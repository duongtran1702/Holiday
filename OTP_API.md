# OTP API
Tài liệu API miễn phí để tích hợp chức năng xác minh otp vào dự án

## Thông tin chung

```text
Base URL: https://otp-service-beta.vercel.app
Content-Type: application/json
```

## Gửi OTP

```http
POST /api/otp/generate
```

Request:

```json
{
  "email": "user@example.com",
  "type": "numeric",
  "organization": "Hệ thống Kiểm tra Trùng lặp",
  "subject": "Mã xác minh đặt lại mật khẩu"
}
```

Response thành công (cấu trúc có thể thay đổi tùy OTP Service):

```json
{
  "success": true,
  "message": "OTP generated successfully"
}
```

## Xác minh OTP

```http
POST /api/otp/verify
```

Request:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response thành công:

```json
{
  "message": "OTP is verified"
}
```

Response lỗi thường có dạng:

```json
{
  "success": false,
  "error": "Invalid or expired OTP"
}
```

## Tích hợp backend Java (Spring Boot)

Backend nên cung cấp hai API nội bộ cho frontend:

```text
POST /api/auth/send-otp
POST /api/auth/verify-otp
```

Ví dụ dùng `RestClient` (Spring Boot 3.2+):

```java
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class OtpService {
    private final RestClient client = RestClient.create(
        "https://otp-service-beta.vercel.app"
    );

    public Map sendOtp(String email) {
        return client.post()
            .uri("/api/otp/generate")
            .body(Map.of(
                "email", email,
                "type", "numeric",
                "organization", "Hệ thống Kiểm tra Trùng lặp",
                "subject", "Mã xác minh đặt lại mật khẩu"
            ))
            .retrieve()
            .body(Map.class);
    }

    public Map verifyOtp(String email, String otp) {
        return client.post()
            .uri("/api/otp/verify")
            .body(Map.of("email", email, "otp", otp))
            .retrieve()
            .body(Map.class);
    }
}
```

Frontend chỉ gửi `email` hoặc `email + otp` tới API nội bộ. Backend cần kiểm tra dữ liệu đầu vào và giới hạn số lần gửi OTP theo email/IP để tránh spam.
