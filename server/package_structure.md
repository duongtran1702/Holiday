# Server Package Structure

Cấu trúc mã nguồn của Server hiện tại đã được tái cấu trúc thành công theo chuẩn kiến trúc **Modular Monolith** (Package-by-Feature), đồng thời loại bỏ các mã nguồn dư thừa nhờ tận dụng thư viện `atmin-library`.

Dưới đây là cây thư mục (chỉ hiển thị các package, không bao gồm các file con) giúp bạn dễ dàng theo dõi:

```
src/main/java/atmin/
├── core/                               # Các lớp dùng chung cốt lõi của toàn hệ thống
│   ├── base/                           # Base classes (VD: BaseEntity)
│   ├── config/                         # Các cấu hình chung
│   └── security/                       # Cấu hình bảo mật Spring Security
│       ├── jwt/                        # Xử lý JWT
│       └── principal/                  # Quản lý UserDetailsService
│
└── modules/                            # Các phân hệ tính năng (Feature Modules)
    ├── auth/                           # Phân hệ Xác thực & Quyền
    │   ├── controller/
    │   ├── dto/
    │   ├── redis/
    │   ├── repository/
    │   └── service/
    │
    ├── media/                          # Phân hệ Quản lý File/Media (Cloudinary)
    │   ├── config/
    │   ├── controller/
    │   └── service/
    │
    ├── order/                          # Phân hệ Quản lý Đơn hàng
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/
    │   ├── repository/
    │   └── service/
    │
    ├── payment/                        # Phân hệ Thanh toán (PayOS)
    │   ├── controller/
    │   ├── entity/
    │   ├── repository/
    │   └── service/
    │
    ├── product/                        # Phân hệ Quản lý Sản phẩm
    │   ├── controller/
    │   ├── dto/
    │   ├── entity/
    │   ├── mapper/
    │   ├── repository/
    │   └── service/
    │
    └── user/                           # Phân hệ Quản lý Người dùng
        ├── controller/
        ├── dto/
        ├── entity/
        ├── repository/
        └── service/
```

### 💡 Lợi ích của kiến trúc mới:
1. **Tuân thủ SOLID & Cohesion cao**: Các mã nguồn liên quan đến cùng một tính năng được đặt chung vào một thư mục (module), giúp dễ dàng bảo trì và sửa lỗi thay vì phải tìm kiếm trên toàn bộ project.
2. **Dễ dàng chuyển đổi sang Microservices**: Sau này khi hệ thống lớn lên, bạn có thể dễ dàng tách từng module trong thư mục `modules/` (ví dụ `modules/auth`, `modules/order`) thành một Microservice riêng biệt với rất ít công sức sửa đổi.
3. **Tái sử dụng thư viện chung**: Bằng cách sử dụng `atmin-library`, project hiện tại đã gọn gàng hơn rất nhiều (tất cả exception handler, common classes đều được đóng gói và import trực tiếp).
