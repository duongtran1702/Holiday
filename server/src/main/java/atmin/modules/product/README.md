# Module Product (Quản lý Sản phẩm & Tồn kho)

Module này quản lý danh mục (Categories), sản phẩm (Products), biến thể (Variants - Màu sắc, Kích cỡ) và quản lý số lượng tồn kho nhằm hỗ trợ cho nghiệp vụ Bán hàng.

## 1. Tổng quan (Overview)

Mọi dữ liệu để hiển thị gian hàng B2C đều xuất phát từ đây. Hệ thống cho phép gán thuộc tính nhiều chiều (VD: Áo có Size L, Màu Đỏ với số lượng tồn riêng biệt). Khi khách hàng đặt mua, Module Order sẽ kiểm tra kho thông qua Internal API của Module này và trừ tồn kho tự động.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

**Luồng Giảm Tồn Kho (Khi tạo Order):**
```text
[OrderService] → Gọi API Nội bộ: ProductInternalApi.decreaseStock()
    ↓ (Đồng bộ, trong cùng Transaction của Order)
    1. Kiểm tra tồn kho hiện tại của Variant X
        ❌ Nếu Stock < Số lượng đặt → Throw OutOfStockException (Rollback toàn bộ Order)
    2. Cập nhật Stock = Stock - Số lượng đặt
    3. Trả về kết quả Thành công
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái (State transition table)

| Từ | Sang | Điều kiện | Ai thực hiện |
| :--- | :--- | :--- | :--- |
| `—` | `DRAFT` | Mới tạo, chưa đăng lên shop | `ProductService` (Admin) |
| `DRAFT` | `ACTIVE` | Admin duyệt / Đăng bán | `ProductService` |
| `ACTIVE` | `OUT_OF_STOCK` | Hết hàng (Hệ thống tự nhận diện qua Stock) | (Tự động) |

## 4. API / Interface liên quan

**Lấy Danh Sách Sản Phẩm (B2C):**
`GET /api/v1/products`
- **Response**: Trả về danh sách sản phẩm `ACTIVE`, phân trang và bộ lọc giá/danh mục.

**Internal API:**
`ProductInternalApi.getProductById(String id)` (Order cần lấy Tên và Giá để in hoá đơn)
`ProductInternalApi.decreaseStock(String productId, String color, String size, int qty)`

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **ProductController** | [`ProductController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/product/controller/ProductController.java) | Endpoint CRUD sản phẩm |
| **ProductService** | [`ProductServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/product/service/ProductServiceImpl.java) | Xử lý logic và hình ảnh |
| **ProductInternalApi** | [`ProductInternalApiImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/product/api/ProductInternalApiImpl.java) | Cung cấp Data cho Order |

## 6. Cấu hình liên quan (Configuration)

(Không có)

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Hệ thống trừ tồn kho khi TẠO đơn (để tránh bán vượt lố), nhưng nếu đơn bị HUỶ hoặc KHÁCH KHÔNG THANH TOÁN, hiện tại hệ thống chưa tự động "trả lại" tồn kho (Restock). Cần một Job quét các đơn Cancelled để Restock.

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Cập nhật tồn kho sản phẩm A = 1 chiếc.
2. Dùng 2 tài khoản cùng lúc đặt mua sản phẩm A.
3. Người đầu tiên mua thành công.
4. Người thứ 2 sẽ nhận được thông báo lỗi "Hết hàng" (Tránh Over-selling).
