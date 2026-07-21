# Module Media (Quản lý Tệp Tin)

Module này chuyên trách việc nhận tệp tin (Ảnh, Video) từ Client và đẩy lên lưu trữ đám mây (Cloudinary) thay vì lưu tại server cục bộ.

## 1. Tổng quan (Overview)

Tất cả các tính năng cần tải ảnh lên (Ảnh đại diện User, Ảnh Sản phẩm, Ảnh gửi trong tin nhắn Chat) đều dùng chung một hệ thống Media Upload. Bằng cách dùng Interface `IMediaUploadService`, hệ thống dễ dàng thay đổi Cloud Provider (từ Cloudinary sang AWS S3) mà không ảnh hưởng code các Module khác.

## 2. Sơ đồ luồng chi tiết (Sequence-level flow)

```text
[Bất kỳ Client nào] → POST /api/v1/media/upload (Multipart File)
    ↓ 
[MediaController] → [IMediaUploadService.uploadFile()]
    ↓
    1. Kiểm tra định dạng (Ảnh/Video), dung lượng.
    2. Đẩy Stream file lên Cloudinary API
    3. Nhận về URL Public.
    4. Trả URL về cho Client
    ↓
[Client] ← Nhận URL và gửi kèm vào payload của các API tạo User/Product.
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái

(Không áp dụng State Machine cho tệp tĩnh).

## 4. API / Interface liên quan

**Upload:**
`POST /api/v1/media/upload`
- **Request**: Form Data `file` (Binary)
- **Response**: `{ secure_url: "https://res.cloudinary.com/..." }`

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **MediaController** | [`MediaController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/media/controller/MediaController.java) | API chung cho mọi request upload |
| **CloudinaryUpload** | [`CloudinaryUploadServiceImpl.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/media/service/CloudinaryUploadServiceImpl.java) | Triển khai upload lên Cloudinary |

## 6. Cấu hình liên quan (Configuration)

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 7. Rủi ro đã biết / Chưa xử lý (Known limitations)

- Nếu người dùng Upload ảnh nhưng sau đó huỷ form (không tạo sản phẩm), ảnh rác vẫn còn nằm mãi trên Cloudinary. Chưa có cơ chế dọn rác (Orphan Files Cleanup).

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Dùng Postman, chọn Body > form-data, Key: `file` (loại File), chọn 1 ảnh bất kỳ.
2. Bắn POST vào `/api/v1/media/upload`.
3. Kiểm tra xem Response trả về link ảnh có mở được trên trình duyệt không.
