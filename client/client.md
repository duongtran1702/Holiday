
```
ReferenceError: onLogout is not defined
    at B2CPortal (http://localhost:5173/src/pages/user/B2CPortal.tsx:124:87)
    at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:11596:26)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:14974:21)
    at beginWork (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:15962:22)
    at beginWork$1 (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19806:22)
    at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19251:20)
    at workLoopSync (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19190:13)
    at renderRootSync (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19169:15)
    at recoverFromConcurrentError (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:18786:28)
    at performConcurrentWorkOnRoot (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:18734:30)
```

```
ReferenceError: onLogout is not defined
    at B2CPortal (http://localhost:5173/src/pages/user/B2CPortal.tsx:124:87)
    at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:11596:26)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:14974:21)
    at beginWork (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:15962:22)
    at beginWork$1 (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19806:22)
    at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19251:20)
    at workLoopSync (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19190:13)
    at renderRootSync (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:19169:15)
    at recoverFromConcurrentError (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:18786:28)
    at performConcurrentWorkOnRoot (http://localhost:5173/node_modules/.vite/deps/chunk-H3PJ7QJC.js?v=0e833384:18734:30)
```

# Hướng dẫn sử dụng Toast (Sonner)

Dự án sử dụng `sonner` để hiển thị thông báo thay vì `react-toastify`.

**Cách sử dụng:**

```tsx
import { toast } from 'sonner';

// Gọi trong các sự kiện:
toast.success("Thành công!");
toast.error("Thất bại!");
toast.info("Thông tin!");
```

---

# Bản đồ Đường dẫn (Routing Map) - ABC Fashion

Dưới đây là toàn bộ cấu trúc URL (đường dẫn) của dự án sau khi chuyển đổi sang React Router. Hệ thống đã được phân quyền chặt chẽ, nếu truy cập sai quyền sẽ bị đẩy về trang Đăng nhập.

## 1. Mạch Mở (Public Routes)

Bất kỳ ai cũng có thể truy cập các đường dẫn này:

| Đường dẫn (URL) | Chức năng (Dẫn đến đâu?)                                                                                                                                                                                            | Tệp xử lý (Component)       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `/`               | **Trang điều phối**. Tự động đá người dùng về đúng trang tương ứng với quyền của họ (ví dụ khách thì về `/b2c`, admin thì về `/admin`). Nếu chưa đăng nhập sẽ vào `/login`. | `App.tsx`                    |
| `/login`          | **Đăng nhập** dành cho Khách hàng lẻ và Đại lý.                                                                                                                                                           | `pages/user/userLogin.tsx`   |
| `/admin-login`    | **Đăng nhập nội bộ** dành cho Admin và Staff.                                                                                                                                                                 | `pages/admin/adminLogin.tsx` |
| `/register`       | **Đăng ký** tài khoản mới.                                                                                                                                                                                     | `pages/user/register.tsx`    |
| `/*` (Gõ sai)    | **Trang lỗi 404** (Với ảnh SVG chiếc ghế và cột đèn).                                                                                                                                                       | `pages/NotFoundPage.tsx`     |

---

## 2. Mạch Khách hàng Lẻ (B2C)

Yêu cầu quyền: `customer`

| Đường dẫn (URL) | Chức năng (Dẫn đến đâu?)                                                      | Tệp xử lý (Component)     |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| `/b2c`            | Giao diện hiển thị danh sách sản phẩm, bộ lọc, xem chi tiết và giỏ hàng. | `pages/user/b2cPortal.tsx` |

---

## 3. Mạch Đại Lý (B2B)

Yêu cầu quyền: `agent` (Sử dụng Layout chung: `LayoutB2B.tsx`)

| Đường dẫn (URL) | Chức năng (Dẫn đến đâu?)                                                                   | Tệp xử lý (Component)        |
| ------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| `/b2b`            | Tự động chuyển hướng vào`/b2b/portal`.                                                   | -                               |
| `/b2b/portal`     | **Đặt hàng Matrix**. Bảng đặt hàng sỉ ma trận theo phân loại size/màu.          | `pages/user/orderTab.tsx`     |
| `/b2b/tier`       | **Tiến trình thăng hạng**. Xem bậc đại lý (Sói Đói, Báo Đen...) và ưu đãi. | `pages/user/tierProgress.tsx` |
| `/b2b/history`    | **Lịch sử đơn hàng** nhập sỉ, công nợ.                                             | `pages/user/historyTab.tsx`   |

---

## 4. Mạch Quản Trị Hệ Thống (Admin/Staff)

Yêu cầu quyền: `admin` hoặc `staff` (Sử dụng Layout chung: `LayoutAtmin.tsx` với thanh `AdminSidebar`)

| Đường dẫn (URL)   | Chức năng (Dẫn đến đâu?)                                                                  | Tệp xử lý (Component)       |
| --------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| `/admin`            | Tự động chuyển hướng vào`/admin/dashboard`.                                             | -                              |
| `/admin/dashboard`  | **Tổng quan**. Biểu đồ doanh thu, số liệu báo cáo thống kê.                      | `pages/admin/overview.tsx`   |
| `/admin/orders`     | **Quản lý đơn hàng**. Bảng kiểm duyệt, thay đổi trạng thái đơn.              | `pages/admin/orders.tsx`     |
| `/admin/products`   | **Kho & Sản phẩm**. Xem danh sách tồn kho, thêm/sửa/xóa sản phẩm.                 | `pages/admin/products.tsx`   |
| `/admin/agents`     | **Quản lý đại lý**. Duyệt hồ sơ, điều chỉnh hạn mức công nợ.                | `pages/admin/agents.tsx`     |
| `/admin/promotions` | **Khuyến mãi**. Cài đặt voucher, chương trình giảm giá.                          | `pages/admin/promotions.tsx` |
| `/admin/inbox`      | **Hỗ trợ**. Đọc và trả lời tin nhắn từ khách hàng/đại lý.                    | `pages/admin/inbox.tsx`      |
| `/admin/users`      | **Quản lý nhân viên**. (*Độc quyền Admin*): Cấp quyền, khóa tài khoản staff. | `pages/admin/users.tsx`      |
