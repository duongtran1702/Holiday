# Module Product (Quản lý Sản phẩm)

Module này chịu trách nhiệm cho các chức năng CRUD (Tạo, Đọc, Sửa, Xóa) liên quan đến Sản phẩm, Danh mục, và Biến thể (Màu sắc, Kích thước) của kho hàng.

## Các thành phần chính

### 1. Controllers
- **`ProductController`**: Tiếp nhận request xem danh sách sản phẩm, chi tiết sản phẩm từ khách hàng, cũng như các thao tác thêm, sửa, xóa sản phẩm từ Nhân viên quản trị (Admin).

### 2. Services (Nghiệp vụ chính)
- **`ProductServiceImpl`**:
  - Hàm `getAllProducts(...)`: Hỗ trợ phân trang, tìm kiếm và lọc sản phẩm (theo danh mục, giá cả) để hiển thị lên Website.
  - Hàm `createProduct(...)`, `updateProduct(...)`: Cập nhật thông tin sản phẩm, quản lý số lượng tồn kho của từng biến thể (VD: Áo màu đỏ size L còn bao nhiêu cái).
  - Hàm `deleteProduct(...)`: Xử lý xóa mềm (soft delete) hoặc vô hiệu hóa sản phẩm để không hiển thị cho người dùng nhưng vẫn giữ dữ liệu thống kê.

### 3. Mapper
- **`ProductMapper`**: Nơi đảm nhận việc chuyển đổi qua lại giữa Entity lưu trong DB (`Product`) và định dạng dữ liệu trả về cho API (`ProductDto`). Việc này giúp đảm bảo nguyên tắc SRP (tránh để Service ôm đồm việc mapping).

### 4. API Nội bộ (Inter-module Api)
- **`ProductInternalApiImpl`**: Cung cấp hàm `checkStock(...)` hoặc `decreaseStock(...)` cho các module khác (như Order) gọi tới để trừ kho an toàn khi có khách đặt hàng.
