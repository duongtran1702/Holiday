# Module Media (Quản lý Tệp Tin)

Module này chuyên trách việc nhận tệp tin (Ảnh, Video) từ Client và đẩy lên lưu trữ đám mây (Cloudinary) thay vì lưu tại server cục bộ.

## 1. Tổng quan (Overview)

Tất cả các tính năng cần tải ảnh lên (Ảnh đại diện User, Ảnh Sản phẩm, Ảnh gửi trong tin nhắn Chat) đều dùng chung một hệ thống Media Upload. Bằng cách dùng Interface `IMediaUploadService`, hệ thống dễ dàng thay đổi Cloud Provider (từ Cloudinary sang AWS S3) mà không ảnh hưởng code các Module khác.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

```text
[Client: Form Upload] 
    1. Người dùng chọn file trên UI (Ví dụ: Thêm Sản phẩm)
    2. Gọi API `POST /api/v1/media/upload` (multipart/form-data)
    ↓ 
[Server: MediaController] → [IMediaUploadService.uploadFile()]
    3. Kiểm tra định dạng (Ảnh/Video), dung lượng.
    4. Đẩy Stream file lên Cloudinary API.
    5. Cloudinary trả về URL Public.
    6. Trả `{ mediaUrl: "..." }` về cho Client.
    ↓
[Client: Form Upload]
    7. Nhận URL và lưu vào State của Form (ví dụ `imageUrl`).
    8. Gửi data JSON tạo Sản phẩm (kèm URL ảnh vừa nhận) lên API `/products`.
```

### Core Code Snippet (Client)

*File: `client/src/features/products/services/productService.ts`*
```typescript
uploadImage: (file: File) => {
    // 1. Khởi tạo FormData để chứa Binary data
    const formData = new FormData();
    formData.append('file', file);
    
    // 2. Gửi file lên BE với header multipart/form-data
    return callApi<{ mediaUrl: string }>('/media/upload', 'POST', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
```

*Trong Component:*
```tsx
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Upload ảnh lên Cloudinary qua Backend
        const res = await productService.uploadImage(file);
        // Nhận lại link ảnh public và gán vào form
        setFormData({ ...formData, imageUrl: res.data.mediaUrl });
    }
};
```

## 3. Bảng trạng thái đầy đủ + điều kiện chuyển trạng thái

(Không áp dụng State Machine cho tệp tĩnh).

## 4. API / Interface liên quan

**Upload:**
`POST /api/v1/media/upload`
- **Request**: Form Data `file` (Binary)
- **Response**: `{ mediaUrl: "https://res.cloudinary.com/..." }`

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
- Khi Client upload các file lớn (>10MB), có thể bị timeout hoặc chặn bởi cấu hình tối đa của Tomcat/Spring (`spring.servlet.multipart.max-file-size`).

## 8. Cách test / kiểm tra thủ công (How to verify)

1. Dùng Postman, chọn Body > form-data, Key: `file` (loại File), chọn 1 ảnh bất kỳ.
2. Bắn POST vào `/api/v1/media/upload`.
3. Kiểm tra xem Response trả về link ảnh có mở được trên trình duyệt không.
