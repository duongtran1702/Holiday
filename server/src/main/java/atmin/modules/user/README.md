# Module User (Quản lý Người dùng & Phân quyền)

Module này đảm nhận mọi chức năng liên quan đến hồ sơ cá nhân của người dùng, cũng như cấu trúc phân quyền động (Role-Based Access Control) cho nhân viên quản trị (Admin/Staff).

## Các thành phần chính

### 1. Controllers
- **`UserController`**: Dành cho khách hàng (B2C) để cập nhật thông tin cá nhân (Tên, SDT, Địa chỉ) và Đổi mật khẩu.
- **`AdminUserController`**: Dành cho quản trị viên (Admin) để xem danh sách khách hàng, tạo tài khoản cho nhân viên mới, khóa/mở khóa tài khoản nhân viên.
- **`AdminRoleController`**: Cung cấp các API để tạo và phân vai trò (Role) cho hệ thống (VD: Tạo vai trò "Nhân viên Sale" với quyền xem Đơn hàng, không có quyền xóa Sản phẩm).

### 2. Services (Nghiệp vụ chính)
- **`UserServiceImpl`**:
  - Hàm `updateProfile(...)`: Xác thực người dùng hiện tại và cập nhật Database.
  - Hàm `changePassword(...)`: Kiểm tra mật khẩu cũ, mã hóa mật khẩu mới (Bcrypt) và lưu trữ.
- **`AdminUserServiceImpl`**:
  - Hàm `createStaff(...)`: Tạo tài khoản nội bộ cho nhân viên với Role cụ thể.
  - Hàm `getAllCustomers(...)`: Truy xuất danh sách khách lẻ hoặc đại lý.
- **`AdminRoleServiceImpl`**:
  - Quản lý các phân hệ `Role` và `Permission` (Tạo role mới, gắn quyền cho role, lấy danh sách role để gán cho nhân viên).

### 3. API Nội bộ (Inter-module Api)
- **`UserInternalApiImpl`**: Cung cấp hàm `getUserById(...)` hoặc `getUserEmail(...)` để các module khác gọi. 
  - *Ví dụ:* Module **Order** cần lấy địa chỉ Email của khách hàng để gửi hóa đơn, nó sẽ không kết nối thẳng vào `UserRepository` mà sẽ gọi qua `UserInternalApi` này (Đảm bảo kiến trúc phân tách - Low Coupling).
