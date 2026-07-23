# Module Promotion (Quản lý Khuyến mãi & Voucher)

Module này chịu trách nhiệm khởi tạo các mã giảm giá (Voucher), quản lý Ví Voucher của từng người dùng, và phân phối mã giảm giá đến các tập khách hàng mục tiêu.

## 1. Tổng quan (Overview)

Khác với mã giảm giá dùng chung (nhập mã là được giảm), hệ thống thiết kế theo dạng **Ví Voucher (Wallet)**. Khi Admin tạo một Promotion mới, tuỳ thuộc vào đối tượng mục tiêu (`targetType`: Tất cả, Đại lý, Khách lẻ, hoặc Email cụ thể), hệ thống sẽ chủ động "nhét" voucher này vào ví của từng user tương ứng (`UserVoucherWallet`). Lúc này khách hàng không cần nhớ mã, chỉ cần vào giỏ hàng và chọn voucher từ ví của mình.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

**Luồng Tạo và Phân phối Voucher:**
```text
[Client Admin: PromotionForm.tsx]
    1. Nhập thông tin Voucher (Mã, % Giảm, Đối tượng: AGENT)
    2. Gọi `promotionApi.createPromotion()`
    ↓
[Server: AdminPromotionController] → [PromotionService.createPromotion()]
    3. Lưu `Promotion` vào DB.
    4. Dựa vào `targetType` (AGENT), query danh sách User thoả điều kiện.
    5. Loop qua từng User:
        - Insert 1 record vào `UserVoucherWallet` (Ví voucher).
        - Insert 1 record vào `Notification` (Báo cho user có voucher mới).
    6. Trả về kết quả thành công.
    ↓
[Client User: CheckoutPage.tsx]
    7. User mở giỏ hàng, gọi `promotionApi.getMyVouchers()`.
    8. Client gọi lên API `/api/v1/promotions/my-vouchers`.
    9. Server truy vấn `UserVoucherWallet` theo `userId`, trả về danh sách Voucher.
    10. User click chọn 1 Voucher, Client apply mã đó vào Payload tạo đơn.
```

### Core Code Snippet (Server)

*File: `server/.../promotion/service/PromotionService.java`*
```java
@Transactional
public PromotionDTO createPromotion(PromotionCreateReq req) {
    // 1. Tạo core Promotion
    Promotion promotion = promotionRepository.save(new Promotion(...));

    // 2. Tìm tập khách hàng mục tiêu
    List<User> targetUsers;
    if ("SPECIFIC_EMAILS".equals(req.getTargetType())) {
        targetUsers = userRepository.findByEmailInAndDeletedAtIsNull(emails);
    } else if ("CUSTOMER".equals(req.getTargetType()) || "AGENT".equals(req.getTargetType())) {
        targetUsers = userRepository.findByRoles_NameAndDeletedAtIsNull(req.getTargetType());
    } else {
        targetUsers = userRepository.findAll(); 
    }

    // 3. Đưa vào ví (Wallet) & Báo Notification
    for (User user : targetUsers) {
        UserVoucherWallet wallet = UserVoucherWallet.builder()
                .user(user)
                .promotion(promotion)
                .status("AVAILABLE")
                .build();
        userVoucherWalletRepository.save(wallet);

        Notification notification = Notification.builder()
                .title("🎉 Bạn nhận được Voucher mới: " + promotion.getCode())
                .targetUserId(user.getId())
                .build();
        notificationRepository.save(notification);
    }

    return mapToDto(promotion);
}
```

### Core Code Snippet (Client)

*File: `client/src/features/promotions/services/promotion.api.ts`*
```typescript
export const promotionApi = {
    // Admin dùng
    createPromotion: (data: PromotionCreateReq) => callApi('/admin/promotions', 'POST', data),
    
    // User dùng
    getMyVouchers: () => callApi('/promotions/my-vouchers', 'GET'),
    applyVoucher: (code: string, totalAmount: number) => callApi(`/promotions/apply?code=${code}&totalAmount=${totalAmount}`, 'POST')
};
```

## 3. Bảng trạng thái (State transition table - UserVoucherWallet)

| Từ | Sang | Ý nghĩa / Điều kiện |
| :--- | :--- | :--- |
| `—` | `AVAILABLE` | Voucher mới được thêm vào ví |
| `AVAILABLE` | `USED` | Người dùng đã áp dụng mã và thanh toán đơn hàng thành công |
| `AVAILABLE` | `EXPIRED` | Quá hạn sử dụng |

## 4. API / Interface liên quan

**Admin:**
- `POST /api/v1/admin/promotions` (Tạo Voucher)
- `GET /api/v1/admin/promotions` (Xem DS)

**User (B2C):**
- `GET /api/v1/promotions/my-vouchers` (Lấy ví)
- `POST /api/v1/promotions/apply` (Check tính hợp lệ của mã trước khi đặt đơn)

## 5. Danh sách thành phần + đường dẫn file cụ thể

| Thành phần | File | Vai trò |
| :--- | :--- | :--- |
| **AdminController** | [`AdminPromotionController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/promotion/controller/AdminPromotionController.java) | API cho Admin |
| **UserController** | [`UserPromotionController.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/promotion/controller/UserPromotionController.java) | API cho Khách hàng |
| **PromotionService** | [`PromotionService.java`](file:///d:/Holiday/server/src/main/java/atmin/modules/promotion/service/PromotionService.java) | Core logic phân phối Voucher |

## 6. Rủi ro đã biết / Chưa xử lý (Known limitations)

- N+1 Query & Performance Insert: Ở hàm `createPromotion`, nếu có 100,000 user, vòng lặp `for` insert từng `UserVoucherWallet` và `Notification` sẽ gây quá tải Database và Time-out HTTP Request. Cần tối ưu bằng `saveAll()` (Batch Insert) hoặc đưa tác vụ phân phối vào một Async Queue/Job (RabbitMQ/Kafka).
- Hiện tại chưa xử lý logic trả lại Voucher (Restock) vào ví nếu khách huỷ đơn hàng.
