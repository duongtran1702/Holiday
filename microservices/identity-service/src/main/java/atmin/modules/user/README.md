# Module User (Quản lý Người dùng)

Module này chịu trách nhiệm quản lý hồ sơ cá nhân, cấp quyền (Roles), thông tin liên lạc (địa chỉ, số điện thoại) và giao tiếp nội bộ để cung cấp Dữ liệu Người dùng cho các Module khác.

## 1. Tổng quan (Overview)

Tất cả các hành động liên quan đến Thông tin cá nhân nằm ở đây. Thay vì trộn lẫn logic xác thực (mật khẩu) với thông tin hồ sơ, Module User chỉ thuần tuý lưu trữ `name`, `avatar`, `address`. Nếu Order Module cần tên người mua để in hoá đơn, nó không được chọc vào Database của User mà phải gọi qua `UserInternalApi`.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

**Luồng Admin vô hiệu hoá User:**
```text
[Admin] → PUT /api/v1/users/{id}/status (status=LOCKED)
    ↓
[UserController] → [UserService.updateStatus()]
    ↓
    1. Tìm User trong DB
    2. Cập nhật isLocked = true
    3. (Tuỳ chọn) Bắn event ra để TokenManagementService khoá toàn bộ Token hiện tại của User này.
    4. Transaction COMMIT
    ↓
[Response trả về Admin]
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái (State transition table)

| Từ | Sang | Điều kiện | Ai thực hiện |
| :--- | :--- | :--- | :--- |
| `—` | `ACTIVE` | Đăng ký thành công | `AuthModule` (Tạo User) |
| `ACTIVE` | `LOCKED` | Admin phát hiện vi phạm | `UserService` |
| `LOCKED` | `ACTIVE` | Admin mở khoá lại | `UserService` |

## 4. API / Interface liên quan

**Lấy Thông Tin Cá Nhân:**
`GET /api/v1/users/me`
- **Request**: (Cần JWT Token hợp lệ)
- **Response**: `{ id, email, fullName, role, avatar... }`

**Internal API (Dùng cho module khác):**
`UserInternalApi.getUserById(String userId)`
`UserInternalApi.updateUserContactInfo(...)` (Order Module tự lưu địa chỉ nếu khách chọn "Lưu thông tin")

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **UserController** | [`UserController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/user/controller/UserController.java) | API cho FE |
| **UserService** | [`UserServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/user/service/UserServiceImpl.java) | Logic quản lý Users |
| **UserEntity** | [`User.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/user/entity/User.java) | Lưu DB |
| **UserInternalApi** | [`UserInternalApiImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/user/api/UserInternalApiImpl.java) | Expose dữ liệu cho Order/Chat... |

## 6. Cấu hình liên quan (Configuration)

(Không có cấu hình đặc thù)

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Hệ thống phân quyền hiện tại vẫn cứng (Hardcoded Roles: ADMIN, STAFF, USER). Chưa hỗ trợ phân quyền động theo từng chức năng nhỏ (Dynamic Permissions/ACL).

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Dùng tài khoản Admin gọi API khoá User X.
2. Dùng JWT cũ của User X thử truy cập lấy thông tin cá nhân. Expect: Security filter báo bị khoá và từ chối.
