# Module Media (Quản lý đa phương tiện)

Module này chuyên trách việc xử lý lưu trữ và tải lên các file media (hình ảnh, video, tài liệu) lên dịch vụ đám mây Cloudinary.

## Các thành phần chính

### 1. Controllers
- **`MediaController`**: Cung cấp API endpoint (`POST /media/upload`) để client gửi file multipart lên hệ thống.

### 2. Services (Nghiệp vụ chính)
- **`UploadService`** (Implement `IMediaUploadService`):
  - Hàm `uploadFile(...)`: Nhận file từ Controller, tương tác với API của Cloudinary để đẩy file lên cloud.
  - Hàm hỗ trợ tự động sinh tên file hoặc định dạng thư mục lưu trữ trên Cloudinary.
  - Trả về URL an toàn (HTTPS) của file sau khi tải lên thành công để các module khác (như Product, User) có thể lưu URL này vào Database.

### 3. Cấu hình (Config)
- **`CloudinaryConfig`**: Đọc các cấu hình từ `CloudinaryProperties` (như api_key, api_secret, cloud_name) để khởi tạo Bean `Cloudinary` kết nối an toàn đến dịch vụ.

### Luồng hoạt động tiêu biểu
- **Cập nhật Avatar / Thêm ảnh Sản phẩm**: Client gọi API upload ảnh -> `UploadService` gửi ảnh lên Cloudinary -> Nhận về URL `https://res.cloudinary.com/...` -> Trả URL về cho Client hoặc lưu trực tiếp vào cơ sở dữ liệu.
