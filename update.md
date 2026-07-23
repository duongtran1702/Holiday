## [22/07/2026] - Phát triển chức năng Quản lý Voucher & Ví Voucher
- Thêm module backend `promotion` với các entity `Promotion` và `UserVoucherWallet`.
- Phát triển `PromotionService` với logic cấp voucher theo 4 loại giới hạn và đối tượng cụ thể (Khách hàng, Đại lý, Email cụ thể).
- Tích hợp `NotificationRepository` để bắn thông báo tự động khi có voucher mới.
- Xây dựng giao diện Client (chia theo micro client & service):
  - `promotionService.ts`: Xử lý call API.
  - `PromotionFormModal.tsx`: Giao diện form Admin để tạo Voucher.
  - `AdminPromotions.tsx`: Giao diện hiển thị danh sách voucher của Admin.
  - `MyPromotions.tsx`: Giao diện Ví Voucher cho B2C và B2B với hiệu ứng UI hiện trạng thái (dùng ngay, đã dùng, hết hạn/xám, xoá).
- Áp dụng chuẩn SOLID và OCD Zero-warning.

# NhÃ¡ÂºÂ­t kÃƒÂ½ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t hÃ¡Â»â€¡ thÃ¡Â»â€˜ng (Changelog)

File nÃƒÂ y ghi lÃ¡ÂºÂ¡i toÃƒÂ n bÃ¡Â»â„¢ cÃƒÂ¡c thay Ã„â€˜Ã¡Â»â€¢i, tÃƒÂ­nh nÃ„Æ’ng mÃ¡Â»â€ºi vÃƒÂ  cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trong quÃƒÂ¡ trÃƒÂ¬nh phÃƒÂ¡t triÃ¡Â»Æ’n dÃ¡Â»Â± ÃƒÂ¡n.

## [22/07/2026] - Dong bo ten va avatar trong lich su chat

**1. Backend**
- Cap nhat ChatServiceImpl.java: Xu ly dynamic lay avatar va name cua User tu dong theo real-time cho cac cuoc tro chuyen DIRECT thay vi luu cung thoi diem khoi tao.

## [22/07/2026] - Fix loi tinh nang Da doc cho Guest/Admin

**1. Frontend**
- Cap nhat useChatWebSocket.ts: Sua loi tu mark as read va parse JSON tu STOMP.

**2. Backend**
- Cap nhat ChatController.java: Xu ly loi NullPointerException khi Guest goi API read.
- Cap nhat ChatServiceImpl.java: Gui Map JSON cho STOMP message.

## [22/07/2026] - ThÃƒÂªm tÃƒÂ­nh nÃ„Æ’ng cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â» c Realtime

**1. SÃ¡Â»Â­a lÃ¡Â»â€”i frontend (Client)**

- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t useChatWebSocket.ts: ThÃƒÂªm readSubRef Ã„â€˜Ã„Æ’ng kÃƒÂ½ theo dÃƒÂµi topic /topic/conversation/{convId}/read Ã„â€˜Ã¡Â»Æ’ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t trÃ¡ÂºÂ¡ng thÃƒÂ¡i tin nhÃ¡ÂºÂ¯n thÃƒÂ nh READ ngay khi nhÃ¡ÂºÂ­n Ã„â€˜Ã†Â°Ã¡Â»Â£c tÃƒÂ­n hiÃ¡Â»â€¡u ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng khÃƒÂ¡c Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡Â» c.

**2. SÃ¡Â»Â­a lÃ¡Â»â€”i backend (Server)**

- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t ChatServiceImpl.java: ThÃƒÂªm hÃƒÂ m gÃ¡Â»Â­i thÃƒÂ´ng bÃƒÂ¡o qua STOMP tÃ¡Â»â€ºi topic /topic/conversation/{conversationId}/read sau khi gÃ¡Â» i markAsReadForUser.

## [22/07/2026] - SÃ¡Â»Â­a lÃ¡Â»â€”i sÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng tin nhÃ¡ÂºÂ¯n chÃ†Â°a Ã„â€˜Ã¡Â» c

**1. SÃ¡Â»Â­a lÃ¡Â»â€”i frontend (Client)**

- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t useChatWebSocket.ts: ThÃƒÂªm onNewMessage callback Ã„â€˜Ã¡Â»Æ’ xÃ¡Â»Â­ lÃƒÂ½ tin nhÃ¡ÂºÂ¯n mÃ¡Â»â€ºi nhÃ¡ÂºÂ­n tÃ¡Â»Â« WebSocket thay vÃƒÂ¬ dÃ¡Â»Â±a vÃƒÂ o messages.length.
- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t ChatWidget.tsx: XÃƒÂ³a logic lÃ¡Â»â€”i tÃƒÂ­nh sÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng tin nhÃ¡ÂºÂ¯n chÃ†Â°a Ã„â€˜Ã¡Â» c dÃ¡Â»Â±a trÃƒÂªn lÃ¡Â»â€¹ch sÃ¡Â»Â­ tin nhÃ¡ÂºÂ¯n. SÃ¡Â»Â­ dÃ¡Â»Â¥ng onNewMessage Ã„â€˜Ã¡Â»Æ’ chÃ¡Â»â€° tÃ„Æ’ng unreadCount khi cÃƒÂ³ tin nhÃ¡ÂºÂ¯n thÃ¡Â»Â±c sÃ¡Â»Â± mÃ¡Â»â€ºi vÃƒÂ  khung chat Ã„â€˜ang Ã„â€˜ÃƒÂ³ng.

## [14/07/2026] - TÃƒÂ­nh nÃ„Æ’ng Ã„ Ã„Æ’ng nhÃ¡ÂºÂ­p bÃ¡ÂºÂ±ng Google

**1. CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ†Â° viÃ¡Â»â€¡n & CÃ¡ÂºÂ¥u hÃƒÂ¬nh**

- ThÃƒÂªm thÃ†Â° viÃ¡Â»â€¡n `com.google.api-client:google-api-client:2.2.0` vÃƒÂ o `build.gradle` Ã„â€˜Ã¡Â»Æ’ phÃ¡Â»Â¥c vÃ¡Â»Â¥ viÃ¡Â»â€¡c xÃƒÂ¡c minh chÃ¡Â»Â¯ kÃƒÂ½ ID Token tÃ¡Â»Â« Google.
- Khai bÃƒÂ¡o biÃ¡ÂºÂ¿n mÃƒÂ´i trÃ†Â°Ã¡Â» ng `google.client.id` trong file `application.properties`.

**2. TÃ¡ÂºÂ§ng Controller & DTO**

- TÃ¡ÂºÂ¡o mÃ¡Â»â€ºi class `GoogleLoginRequest.java` tÃ¡ÂºÂ¡i `atmin.controller.auth.dto` Ã„â€˜Ã¡Â»Æ’ nhÃ¡ÂºÂ­n yÃƒÂªu cÃ¡ÂºÂ§u tÃ¡Â»Â« Frontend chÃ¡Â»Â©a `idToken`.
- ThÃƒÂªm API endpoint mÃ¡Â»â€ºi `POST /api/v1/auth/google` vÃƒÂ o `AuthController.java`.

**3. TÃ¡ÂºÂ§ng Service (XÃ¡Â»Â­ lÃƒÂ½ nghiÃ¡Â»â€¡p vÃ¡Â»Â¥)**

- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t interface `AuthService.java` vÃƒÂ  class `AuthServiceImpl.java` vÃ¡Â»â€ºi phÃ†Â°Ã†Â¡ng thÃ¡Â»Â©c `loginWithGoogle`.
- XÃƒÂ¢y dÃ¡Â»Â±ng luÃ¡Â»â€œng tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng kiÃ¡Â»Æ’m chÃ¡Â»Â©ng token bÃ¡ÂºÂ±ng `GoogleIdTokenVerifier`.
- XÃƒÂ¢y dÃ¡Â»Â±ng luÃ¡Â»â€œng tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng tÃ¡ÂºÂ¡o ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng mÃ¡Â»â€ºi xuÃ¡Â»â€˜ng Database (vÃ¡Â»â€ºi Role lÃƒÂ  `CUSTOMER` vÃƒÂ  sinh mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u ngÃ¡ÂºÂ«u nhiÃƒÂªn) nÃ¡ÂºÂ¿u email Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p lÃ¡ÂºÂ§n Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn.
- TÃƒÂ­ch hÃ¡Â»Â£p hÃƒÂ m tÃ¡ÂºÂ¡o Access Token vÃƒÂ  Refresh Token giÃ¡Â»â€˜ng nhÃ†Â° luÃ¡Â»â€œng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p thÃ†Â°Ã¡Â» ng.
- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t (15/07): Ã„ Ã¡Â»â€¢i phÃ†Â°Ã†Â¡ng thÃ¡Â»Â©c xÃƒÂ¡c thÃ¡Â»Â±c tÃ¡Â»Â« `GoogleIdTokenVerifier` sang sÃ¡Â»Â­ dÃ¡Â»Â¥ng `RestTemplate` gÃ¡Â» i API `userinfo` cÃ¡Â»Â§a Google bÃ¡ÂºÂ±ng `access_token` Ã„â€˜Ã¡Â»Æ’ cho phÃƒÂ©p tÃƒÂ¹y chÃ¡Â»â€°nh giao diÃ¡Â»â€¡n Frontend.

**4. TÃ¡ÂºÂ§ng Frontend (Client)**

- ThÃ†Â° viÃ¡Â»â€¡n: CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t `@react-oauth/google`.
- CÃ¡ÂºÂ¥u hÃƒÂ¬nh: BÃ¡Â» c `main.tsx` vÃ¡Â»â€ºi `<GoogleOAuthProvider>`.
- API: ThÃƒÂªm hÃƒÂ m `loginWithGoogle` trong `auth.api.ts` (gÃ¡Â»Â­i `accessToken`).
- Giao diÃ¡Â»â€¡n: SÃ¡Â»Â­ dÃ¡Â»Â¥ng Hook `useGoogleLogin` trong `UserLogin.tsx` thay vÃƒÂ¬ nÃƒÂºt chuÃ¡ÂºÂ©n cÃ¡Â»Â§a Google, giÃƒÂºp giÃ¡Â»Â¯ nguyÃƒÂªn 100% giao diÃ¡Â»â€¡n nÃƒÂºt thiÃ¡ÂºÂ¿t kÃ¡ÂºÂ¿ (UI custom) ban Ã„â€˜Ã¡ÂºÂ§u.

## [14/07/2026] - TÃƒÂ­nh nÃ„Æ’ng Ã„ Ã¡ÂºÂ·t hÃƒÂ ng vÃƒÂ  Thanh toÃƒÂ¡n trÃ¡Â»Â±c tuyÃ¡ÂºÂ¿n (PayOS)

**1. CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ†Â° viÃ¡Â»â€¡n & CÃ¡ÂºÂ¥u hÃƒÂ¬nh**

- ThÃƒÂªm thÃ†Â° viÃ¡Â»â€¡n `vn.payos:payos-java:2.0.1` vÃƒÂ o `build.gradle` Ã„â€˜Ã¡Â»Æ’ sÃ¡Â»Â­ dÃ¡Â»Â¥ng SDK mÃ¡Â»â€ºi nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a PayOS.
- Khai bÃƒÂ¡o cÃƒÂ¡c biÃ¡ÂºÂ¿n mÃƒÂ´i trÃ†Â°Ã¡Â» ng `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` trong file `application.properties`.
- TÃ¡ÂºÂ¡o class cÃ¡ÂºÂ¥u hÃƒÂ¬nh `PayOSConfig.java` Ã„â€˜Ã¡Â»Æ’ nÃ¡ÂºÂ¡p thÃƒÂ´ng tin kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i PayOS.

**2. TÃ¡ÂºÂ§ng Entity & Enum**

- ThÃƒÂªm bÃ¡ÂºÂ£ng dÃ¡Â»Â¯ liÃ¡Â»â€¡u `Order`, `OrderItem`, `Invoice` cÃƒÂ³ liÃƒÂªn kÃ¡ÂºÂ¿t khoÃƒÂ¡ ngoÃ¡ÂºÂ¡i phÃƒÂ¹ hÃ¡Â»Â£p cho viÃ¡Â»â€¡c thanh toÃƒÂ¡n.
- Ã„ Ã¡Â»â€¹nh nghÃ„Â©a enum `OrderStatus` (PENDING, PENDING_PAYMENT, PAID, v.v.) vÃƒÂ  `PaymentMethod` (COD, PAYOS).

**3. TÃ¡ÂºÂ§ng Controller & DTO**

- Ã„ Ã¡Â»â€¹nh nghÃ„Â©a cÃƒÂ¡c DTO `OrderRequest` vÃƒÂ  `OrderResponse`.
- TÃ¡ÂºÂ¡o `OrderController.java` Ã„â€˜Ã¡Â»Æ’ nhÃ¡ÂºÂ­n yÃƒÂªu cÃ¡ÂºÂ§u Ã„â€˜Ã¡ÂºÂ·t hÃƒÂ ng cÃ¡Â»Â§a khÃƒÂ¡ch hÃƒÂ ng qua API.
- TÃ¡ÂºÂ¡o `PaymentController.java` mÃ¡Â»Å¸ cÃ¡Â»â€¢ng Webhook nhÃ¡ÂºÂ­n trÃ¡ÂºÂ¡ng thÃƒÂ¡i thanh toÃƒÂ¡n tÃ¡Â»Â« hÃ¡Â»â€¡ thÃ¡Â»â€˜ng PayOS.

**4. TÃ¡ÂºÂ§ng Service**

- TÃ¡ÂºÂ¡o `OrderService` xÃ¡Â»Â­ lÃƒÂ½ lÃ†Â°u dÃ¡Â»Â¯ liÃ¡Â»â€¡u Ã„â€˜Ã†Â¡n hÃƒÂ ng vÃƒÂ  kiÃ¡Â»Æ’m tra lÃ¡Â»Â±a chÃ¡Â» n (nÃ¡ÂºÂ¿u chÃ¡Â» n PAYOS thÃƒÂ¬ gÃ¡Â» i tÃ¡Â»â€ºi `PaymentService`).
- TÃ¡ÂºÂ¡o `PaymentService` Ã„â€˜ÃƒÂ³ng vai trÃƒÂ² gÃ¡Â» i PayOS SDK Ã„â€˜Ã¡Â»Æ’ tÃ¡ÂºÂ¡o Payment Link vÃƒÂ  xÃ¡Â»Â­ lÃƒÂ½ Webhook. TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng chuyÃ¡Â»Æ’ trÃ¡ÂºÂ¡ng thÃƒÂ¡i Ã„â€˜Ã†Â¡n hÃƒÂ ng sang `PAID` vÃƒÂ  sinh `Invoice` khi ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng thanh toÃƒÂ¡n thÃƒÂ nh cÃƒÂ´ng.

## [15/07/2026] - KiÃ¡ÂºÂ¿n trÃƒÂºc TÃƒÂ¡ch bÃ¡ÂºÂ¡ch Ã„ Ã„Æ’ng nhÃ¡ÂºÂ­p & PhÃƒÂ¢n quyÃ¡Â» n CÃ¡Â»â€¢ng (Portal)

**1. TÃ¡ÂºÂ§ng Database & Entity**

- BÃ¡Â»â€¢ sung cÃ¡Â»â„¢t `auth_provider` vÃƒÂ o entity `User.java` (mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh `LOCAL`, nÃ¡ÂºÂ¿u tÃ¡ÂºÂ¡o qua Google thÃƒÂ¬ gÃƒÂ¡n `GOOGLE`).

**2. TÃ¡ÂºÂ§ng Controller & DTO**

- BÃ¡Â»â€¢ sung biÃ¡ÂºÂ¿n `portal` (nhÃ¡ÂºÂ­n giÃƒÂ¡ trÃ¡Â»â€¹ `admin` hoÃ¡ÂºÂ·c `customer`) vÃƒÂ o `LoginRequest.java` Ã„â€˜Ã¡Â»Æ’ xÃƒÂ¡c Ã„â€˜Ã¡Â»â€¹nh luÃ¡Â»â€œng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p.

**3. TÃ¡ÂºÂ§ng Service (`AuthServiceImpl.java`)**

- Ãƒ p dÃ¡Â»Â¥ng cÃ†Â¡ chÃ¡ÂºÂ¿ **Strict Separation** (TÃƒÂ¡ch bÃ¡ÂºÂ¡ch hoÃƒÂ n toÃƒÂ n):
  - ChÃ¡ÂºÂ·n tÃƒÂ i khoÃ¡ÂºÂ£n tÃ¡ÂºÂ¡o bÃ¡ÂºÂ±ng MÃ¡ÂºÂ­t khÃ¡ÂºÂ©u khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c dÃƒÂ¹ng nÃƒÂºt Ã„ Ã„Æ’ng nhÃ¡ÂºÂ­p Google.
  - ChÃ¡ÂºÂ·n tÃƒÂ i khoÃ¡ÂºÂ£n tÃ¡ÂºÂ¡o bÃ¡ÂºÂ±ng Google khÃƒÂ´ng Ã„â€˜Ã†Â°Ã¡Â»Â£c dÃƒÂ¹ng form Ã„ Ã„Æ’ng nhÃ¡ÂºÂ­p MÃ¡ÂºÂ­t khÃ¡ÂºÂ©u.
  - ChÃ¡ÂºÂ·n tÃƒÂ i khoÃ¡ÂºÂ£n Google sÃ¡Â»Â­ dÃ¡Â»Â¥ng tÃƒÂ­nh nÃ„Æ’ng "QuÃƒÂªn mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u" vÃƒÂ  "Ã„ Ã¡Â»â€¢i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u" Ã„â€˜Ã¡Â»Æ’ bÃ¡ÂºÂ£o vÃ¡Â»â€¡ luÃ¡Â»â€œng xÃƒÂ¡c thÃ¡Â»Â±c.
- PhÃƒÂ¢n quyÃ¡Â» n CÃ¡Â»â€¢ng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p (Portal):
  - ChÃ¡ÂºÂ·n tÃƒÂ i khoÃ¡ÂºÂ£n `ADMIN` vÃƒÂ  `STAFF` Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p qua cÃ¡Â»â€¢ng Customer (`portal="customer"`).
  - ChÃ¡ÂºÂ·n ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng thÃ†Â°Ã¡Â» ng (Customer) Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p qua cÃ¡Â»â€¢ng Admin (`portal="admin"`).
- CÃ¡ÂºÂ£i thiÃ¡Â»â€¡n UX: RÃƒÂºt ngÃ¡ÂºÂ¯n toÃƒÂ n bÃ¡Â»â„¢ cÃƒÂ¡c thÃƒÂ´ng bÃƒÂ¡o lÃ¡Â»â€”i (Exception messages) Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh hiÃ¡Â»â€¡n tÃ†Â°Ã¡Â»Â£ng vÃ¡Â»Â¡ layout trÃƒÂªn Frontend.

**4. TÃ¡ÂºÂ§ng Frontend**

- BÃ¡Â»â€¢ sung cÃ¡ÂºÂ¥u hÃƒÂ¬nh truyÃ¡Â» n tham sÃ¡Â»â€˜ `portal: 'customer'` trong `UserLogin.tsx`.
- BÃ¡Â»â€¢ sung cÃ¡ÂºÂ¥u hÃƒÂ¬nh truyÃ¡Â» n tham sÃ¡Â»â€˜ `portal: 'admin'` trong `AdminLogin.tsx`.

## [15/07/2026] - HoÃƒÂ n thiÃ¡Â»â€¡n UI & KÃ¡ÂºÂ¿t nÃ¡Â»â€˜i dÃ¡Â»Â¯ liÃ¡Â»â€¡u ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng (Profile)

**1. TÃ¡ÂºÂ§ng Backend**

- BÃ¡Â»â€¢ sung trÃ†Â°Ã¡Â» ng dÃ¡Â»Â¯ liÃ¡Â»â€¡u `authProvider` vÃƒÂ  `phone` vÃƒÂ o trong DTO trÃ¡ÂºÂ£ vÃ¡Â»  `AuthResponse.UserInfo`.
- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t hÃƒÂ m `buildAuthResponse` trong `AuthServiceImpl` Ã„â€˜Ã¡Â»Æ’ truyÃ¡Â» n `authProvider` vÃƒÂ  `phone` xuÃ¡Â»â€˜ng Frontend sau khi ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p thÃƒÂ nh cÃƒÂ´ng.

**2. TÃ¡ÂºÂ§ng Frontend**

- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Interface `User` vÃƒÂ  `UserInfo` trong `types/index.ts` Ã„â€˜Ã¡Â»Æ’ Ã„â€˜Ã¡Â»â€œng bÃ¡Â»â„¢ cÃ¡ÂºÂ¥u trÃƒÂºc dÃ¡Â»Â¯ liÃ¡Â»â€¡u trÃ¡ÂºÂ£ vÃ¡Â»  tÃ¡Â»Â« Backend (thÃƒÂªm `phone` vÃƒÂ  `authProvider`).
- **ProfileModal.tsx (TÃƒÂ i khoÃ¡ÂºÂ£n cÃ¡Â»Â§a tÃƒÂ´i) & UserMenu.tsx (Menu gÃƒÂ³c trÃƒÂªn)**:
  - LoÃ¡ÂºÂ¡i bÃ¡Â»  hoÃƒÂ n toÃƒÂ n dÃ¡Â»Â¯ liÃ¡Â»â€¡u giÃ¡ÂºÂ£ (Mock Data) vÃƒÂ  kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p vÃ¡Â»â€ºi trÃ¡ÂºÂ¡ng thÃƒÂ¡i ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng lÃ†Â°u trong Redux (`state.auth.user`).
  - Giao diÃ¡Â»â€¡n: TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng trÃƒÂ­ch xuÃ¡ÂºÂ¥t chÃ¡Â»Â¯ cÃƒÂ¡i Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn trong tÃƒÂªn thÃ¡ÂºÂ­t cÃ¡Â»Â§a khÃƒÂ¡ch hÃƒÂ ng Ã„â€˜Ã¡Â»Æ’ lÃƒÂ m Ã¡ÂºÂ£nh Ã„â€˜Ã¡ÂºÂ¡i diÃ¡Â»â€¡n (Avatar initial).
  - TrÃ¡ÂºÂ£i nghiÃ¡Â»â€¡m (UX): KhÃƒÂ³a cÃ¡Â»Â©ng trÃ†Â°Ã¡Â» ng `Email` (chÃ¡Â»â€° cho phÃƒÂ©p xem) Ã„â€˜Ã¡Â»Æ’ bÃ¡ÂºÂ£o vÃ¡Â»â€¡ tÃƒÂ­nh vÃ¡ÂºÂ¹n toÃƒÂ n dÃ¡Â»Â¯ liÃ¡Â»â€¡u Ã„â€˜Ã¡Â»â€¹nh danh.
  - BÃ¡ÂºÂ£o vÃ¡Â»â€¡ luÃ¡Â»â€œng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p (Strict Separation): TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng Ã¡ÂºÂ©n hoÃƒÂ n toÃƒÂ n nÃƒÂºt/tab "Ã„ Ã¡Â»â€¢i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u" Ã¡Â»Å¸ mÃ¡Â» i nÃ†Â¡i nÃ¡ÂºÂ¿u hÃ¡Â»â€¡ thÃ¡Â»â€˜ng phÃƒÂ¡t hiÃ¡Â»â€¡n ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng Ã„â€˜ang Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p bÃ¡ÂºÂ±ng Google (`authProvider === "GOOGLE"`).
  - TÃƒÂ­ch hÃ¡Â»Â£p logic upload file Ã¡ÂºÂ£nh lÃƒÂªn Cloudinary thÃƒÂ´ng qua API.
  - CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Redux Store ngay sau khi gÃ¡Â» i API thÃƒÂ nh cÃƒÂ´ng Ã„â€˜Ã¡Â»Æ’ thay thÃ¡ÂºÂ¿ hÃƒÂ¬nh Avatar chÃ¡Â»Â¯ cÃƒÂ¡i bÃ¡ÂºÂ±ng Ã¡ÂºÂ¢nh thÃ¡ÂºÂ­t cÃ¡Â»Â§a User mÃƒÂ  khÃƒÂ´ng cÃ¡ÂºÂ§n reload trang.
  - TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng gÃ¡Â» i API cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t HÃ¡Â»  TÃƒÂªn vÃƒÂ  SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i khi bÃ¡ÂºÂ¥m "LÃ†Â°u thÃƒÂ´ng tin".

## [15/07/2026] - TriÃ¡Â»Æ’n khai luÃ¡Â»â€œng Ã„ Ã¡ÂºÂ·t HÃƒÂ ng (Checkout Flow) & TÃƒÂ­nh nÃ„Æ’ng TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng lÃ†Â°u thÃƒÂ´ng tin

**1. TÃ¡ÂºÂ§ng Database & Backend**

- BÃ¡Â»â€¢ sung trÃ†Â°Ã¡Â» ng `address` (Ã„ Ã¡Â»â€¹a chÃ¡Â»â€° giao hÃƒÂ ng) vÃƒÂ o Entity `User.java` vÃƒÂ  cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t cÃƒÂ¡c luÃ¡Â»â€œng DTO liÃƒÂªn quan (`UpdateProfileRequest`, `AuthResponse.UserInfo`).
- TÃƒÂ­ch hÃ¡Â»Â£p logic **Auto-save** trong `OrderServiceImpl.java`: Khi ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng tÃ¡ÂºÂ¡o mÃ¡Â»â„¢t Ã„â€˜Ã†Â¡n hÃƒÂ ng mÃ¡Â»â€ºi, nÃ¡ÂºÂ¿u hÃ¡Â»  cung cÃ¡ÂºÂ¥p sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i hoÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹a chÃ¡Â»â€° khÃƒÂ¡c vÃ¡Â»â€ºi thÃƒÂ´ng tin cÃƒÂ³ sÃ¡ÂºÂµn trong tÃƒÂ i khoÃ¡ÂºÂ£n, hÃ¡Â»â€¡ thÃ¡Â»â€˜ng sÃ¡ÂºÂ½ tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã„â€˜ÃƒÂ¨ nhÃ¡Â»Â¯ng thÃƒÂ´ng tin nÃƒÂ y vÃƒÂ o Profile cÃ¡Â»Â§a hÃ¡Â»  Ã„â€˜Ã¡Â»Æ’ tiÃ¡ÂºÂ¿t kiÃ¡Â»â€¡m thÃ¡Â» i gian cho lÃ¡ÂºÂ§n mua hÃƒÂ ng sau.

**2. TÃ¡ÂºÂ§ng Frontend (Giao diÃ¡Â»â€¡n & Logic)**

- BÃ¡Â»â€¢ sung ÃƒÂ´ nhÃ¡ÂºÂ­p "Ã„ Ã¡Â»â€¹a chÃ¡Â»â€° nhÃ¡ÂºÂ­n hÃƒÂ ng" vÃƒÂ o form cÃ¡Â»Â§a `ProfileModal.tsx`.
- TÃ¡ÂºÂ¡o mÃ¡Â»â€ºi file `order.api.ts` Ã„â€˜Ã¡Â»Æ’ tÃ†Â°Ã†Â¡ng tÃƒÂ¡c vÃ¡Â»â€ºi cÃƒÂ¡c endpoint Ã„ Ã¡ÂºÂ·t hÃƒÂ ng cÃ¡Â»Â§a Backend.
- XÃƒÂ¢y dÃ¡Â»Â±ng **CheckoutModal.tsx** (Giao diÃ¡Â»â€¡n Thanh toÃƒÂ¡n Pop-up):
  - **Auto-fill**: TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng Ã„â€˜iÃ¡Â» n sÃ¡ÂºÂµn HÃ¡Â»  tÃƒÂªn, SÃ„ T vÃƒÂ  Ã„ Ã¡Â»â€¹a chÃ¡Â»â€° tÃ¡Â»Â« `user` state trong Redux.
  - TÃƒÂ­ch hÃ¡Â»Â£p hai hÃƒÂ¬nh thÃ¡Â»Â©c thanh toÃƒÂ¡n: COD (Thanh toÃƒÂ¡n khi nhÃ¡ÂºÂ­n hÃƒÂ ng) vÃƒÂ  PAYOS (Thanh toÃƒÂ¡n online quÃƒÂ©t mÃƒÂ£ QR).
  - TÃƒÂ­ch hÃ¡Â»Â£p **Validate chÃ¡ÂºÂ·t chÃ¡ÂºÂ½** (Strict Validation) theo chÃƒÂ¢m ngÃƒÂ´n "ThÃ¡Â»Â«a hÃ†Â¡n thiÃ¡ÂºÂ¿u": SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i phÃ¡ÂºÂ£i Ã„â€˜ÃƒÂºng regex ViÃ¡Â»â€¡t Nam (10 sÃ¡Â»â€˜, Ã„â€˜Ã¡ÂºÂ§u 0 hoÃ¡ÂºÂ·c +84), Ã„ Ã¡Â»â€¹a chÃ¡Â»â€° giao hÃƒÂ ng bÃ¡ÂºÂ¯t buÃ¡Â»â„¢c dÃƒÂ i hÃ†Â¡n 10 kÃƒÂ½ tÃ¡Â»Â± Ã„â€˜Ã¡Â»Æ’ hÃ¡ÂºÂ¡n chÃ¡ÂºÂ¿ sai sÃƒÂ³t.
- NÃƒÂ¢ng cÃ¡ÂºÂ¥p `CartDrawer.tsx` & `B2CPortal.tsx`:
  - **BÃ¡ÂºÂ£o vÃ¡Â»â€¡ luÃ¡Â»â€œng thanh toÃƒÂ¡n**: ChÃ¡ÂºÂ·n ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng vÃƒÂ£ng lai (Guest), yÃƒÂªu cÃ¡ÂºÂ§u phÃ¡ÂºÂ£i Ã„ Ã„Æ’ng nhÃ¡ÂºÂ­p mÃ¡Â»â€ºi Ã„â€˜Ã†Â°Ã¡Â»Â£c Ã¡ÂºÂ¥n "TiÃ¡ÂºÂ¿n hÃƒÂ nh thanh toÃƒÂ¡n" (TÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng redirect vÃ¡Â»  `/login`).
  - XÃ¡Â»Â­ lÃƒÂ½ mÃ†Â°Ã¡Â»Â£t mÃƒÂ  quÃƒÂ¡ trÃƒÂ¬nh Ã„â€˜iÃ¡Â» u hÃ†Â°Ã¡Â»â€ºng URL (Ã„â€˜Ã¡Â»â€˜i vÃ¡Â»â€ºi PayOS) vÃƒÂ  lÃƒÂ m trÃ¡Â»â€˜ng giÃ¡Â»  hÃƒÂ ng (Ã„â€˜Ã¡Â»â€˜i vÃ¡Â»â€ºi COD).

**3. CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t AI Custom Rules**

- ThÃƒÂªm nguyÃƒÂªn tÃ¡ÂºÂ¯c `Strict Validation Rule` vÃƒÂ o cÃ¡ÂºÂ¥u hÃƒÂ¬nh `.agents/AGENTS.md` nhÃ¡ÂºÂ±m luÃƒÂ´n Ã†Â°u tiÃƒÂªn xÃ¡Â»Â­ lÃƒÂ½ dÃ¡Â»Â¯ liÃ¡Â»â€¡u ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng cÃ¡ÂºÂ©n thÃ¡ÂºÂ­n, an toÃƒÂ n vÃƒÂ  chÃ¡ÂºÂ·t chÃ¡ÂºÂ½ trong cÃƒÂ¡c tÃƒÂ¡c vÃ¡Â»Â¥ tÃ†Â°Ã†Â¡ng lai.

## [15/07/2026] - KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c sÃ¡Â»Â± cÃ¡Â»â€˜ (Bug Fixes) TÃƒÂ­ch hÃ¡Â»Â£p HÃ¡Â»â€¡ thÃ¡Â»â€˜ng Ã„ Ã¡ÂºÂ·t hÃƒÂ ng & Thanh toÃƒÂ¡n

**1. LÃ¡Â»â€”i Xung Ã„â€˜Ã¡Â»â„¢t CÃ¡ÂºÂ¥u hÃƒÂ¬nh KhÃ¡Â»Å¸i Ã„â€˜Ã¡Â»â„¢ng Spring Boot**

- **SÃ¡Â»Â± cÃ¡Â»â€˜:** Ã¡Â»Â¨ng dÃ¡Â»Â¥ng Spring Boot bÃ¡Â»â€¹ crash liÃƒÂªn tÃ¡Â»Â¥c vÃ¡Â»â€ºi lÃ¡Â»â€”i `Failed to configure a DataSource: 'url' attribute is not specified`.
- **NguyÃƒÂªn nhÃƒÂ¢n:** PhiÃƒÂªn bÃ¡ÂºÂ£n mÃ¡Â»â€ºi cÃ¡Â»Â§a thÃ†Â° viÃ¡Â»â€¡n dÃƒÂ¹ng chung `atmin-library:1.0.4.Beta` vÃƒÂ´ tÃƒÂ¬nh Ã„â€˜ÃƒÂ³ng gÃƒÂ³i kÃƒÂ¨m mÃ¡Â»â„¢t file `application.properties` rÃƒÂ¡c, Ã„â€˜ÃƒÂ¨ lÃƒÂªn cÃ¡ÂºÂ¥u hÃƒÂ¬nh database cÃ¡Â»Â¥c bÃ¡Â»â„¢.
- **KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c:** Ã„ Ã¡Â»â€¢i tÃƒÂªn file cÃ¡ÂºÂ¥u hÃƒÂ¬nh nÃ¡Â»â„¢i bÃ¡Â»â„¢ tÃ¡Â»Â« `application.properties` sang `application-default.properties` Ã„â€˜Ã¡Â»Æ’ nÃƒÂ¢ng Ã„â€˜Ã¡Â»â„¢ Ã†Â°u tiÃƒÂªn nÃ¡ÂºÂ¡p cÃ¡ÂºÂ¥u hÃƒÂ¬nh (ÃƒÂ¡p dÃ¡Â»Â¥ng cho Profile mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh `default`), qua Ã„â€˜ÃƒÂ³ ghi Ã„â€˜ÃƒÂ¨ triÃ¡Â»â€¡t Ã„â€˜Ã¡Â»Æ’ file rÃƒÂ¡c cÃ¡Â»Â§a thÃ†Â° viÃ¡Â»â€¡n.

**2. LÃ¡Â»â€”i TÃƒÂ­nh tÃ¡Â»â€¢ng tiÃ¡Â» n ra `NaN` vÃƒÂ  `An unexpected error occurred` khi Checkout**

- **SÃ¡Â»Â± cÃ¡Â»â€˜:** GiÃ¡Â»  hÃƒÂ ng tÃƒÂ­nh ra tÃ¡Â»â€¢ng tiÃ¡Â» n `NaN Ã„â€˜`, API Ã„â€˜Ã¡ÂºÂ·t hÃƒÂ ng trÃ¡ÂºÂ£ vÃ¡Â»  500.
- **NguyÃƒÂªn nhÃƒÂ¢n:** BÃ¡ÂºÂ¥t Ã„â€˜Ã¡Â»â€œng bÃ¡Â»â„¢ Ã„â€˜Ã¡Â»â€¹nh dÃ¡ÂºÂ¡ng dÃ¡Â»Â¯ liÃ¡Â»â€¡u (Data Type Mismatch). Frontend trong mÃ¡ÂºÂ£ng `cart` lÃ†Â°u sÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£ng lÃƒÂ  `qty`, mÃƒÂ u lÃƒÂ  `color`, kÃƒÂ­ch cÃ¡Â»Â¡ lÃƒÂ  `size`. NhÃ†Â°ng khi map vÃƒÂ o Ã„â€˜Ã¡Â»â€˜i tÃ†Â°Ã¡Â»Â£ng gÃ¡Â»Â­i Ã„â€˜i (`CreateOrderRequest`) lÃ¡ÂºÂ¡i dÃƒÂ¹ng nhÃ¡ÂºÂ§m `item.quantity`, `item.selectedColor`, dÃ¡ÂºÂ«n Ã„â€˜Ã¡ÂºÂ¿n gÃ¡Â»Â­i dÃ¡Â»Â¯ liÃ¡Â»â€¡u `null/undefined` xuÃ¡Â»â€˜ng Backend.
- **KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c:** ChuÃ¡ÂºÂ©n hÃƒÂ³a lÃ¡ÂºÂ¡i viÃ¡Â»â€¡c khÃ¡Â»Å¸i tÃ¡ÂºÂ¡o payload Ã¡Â»Å¸ Frontend: sÃ¡Â»Â­ dÃ¡Â»Â¥ng Ã„â€˜ÃƒÂºng `item.qty || 1`, fallback Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ cho `item.color`, `item.size` Ã¡Â»Å¸ trong file `CheckoutModal.tsx`.

**3. LÃ¡Â»â€”i `User not found` khi tÃ¡ÂºÂ¡o Ã„ Ã†Â¡n HÃƒÂ ng (OrderServiceImpl)**

- **SÃ¡Â»Â± cÃ¡Â»â€˜:** `java.lang.RuntimeException: User not found` vÃ„Æ’ng ra Ã¡Â»Å¸ bÃ†Â°Ã¡Â»â€ºc lÃ†Â°u Database dÃƒÂ¹ ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng Ã„â€˜ÃƒÂ£ Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p.
- **NguyÃƒÂªn nhÃƒÂ¢n:** HÃƒÂ m `createOrder` sÃ¡Â»Â­ dÃ¡Â»Â¥ng tham sÃ¡Â»â€˜ lÃƒÂ  `userId` vÃƒÂ  tÃƒÂ¬m kiÃ¡ÂºÂ¿m bÃ¡ÂºÂ±ng `userRepository.findById()`. Tuy nhiÃƒÂªn, biÃ¡ÂºÂ¿n nÃƒÂ y lÃ¡ÂºÂ¥y giÃƒÂ¡ trÃ¡Â»â€¹ tÃ¡Â»Â« `authentication.getName()` cÃ¡Â»Â§a JWT (thÃ¡Â»Â±c chÃ¡ÂºÂ¥t lÃƒÂ  chuÃ¡Â»â€”i Email cÃ¡Â»Â§a ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng, khÃƒÂ´ng phÃ¡ÂºÂ£i mÃƒÂ£ UUID).
- **KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c:** CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t lÃ¡ÂºÂ¡i logic tÃƒÂ¬m kiÃ¡ÂºÂ¿m trong `OrderServiceImpl.java` thÃƒÂ nh `userRepository.findByEmailAndDeletedAtIsNull(username)` Ã„â€˜Ã¡Â»Æ’ truy xuÃ¡ÂºÂ¥t dÃ¡Â»Â¯ liÃ¡Â»â€¡u chÃƒÂ­nh xÃƒÂ¡c theo Email.

**4. LÃ¡Â»â€”i `Product not found` vÃ¡Â»â€ºi dÃ¡Â»Â¯ liÃ¡Â»â€¡u Mock**

- **SÃ¡Â»Â± cÃ¡Â»â€˜:** BÃƒÂ¡o lÃ¡Â»â€”i `Product not found: p1` Ã¡Â»Å¸ Backend do ngÃ†Â°Ã¡Â» i dÃƒÂ¹ng mua sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m `p1` tÃ¡Â»Â« giao diÃ¡Â»â€¡n hiÃ¡Â»Æ’n thÃ¡Â»â€¹ mÃ¡ÂºÂ«u.
- **NguyÃƒÂªn nhÃƒÂ¢n:** Frontend sÃ¡Â»Â­ dÃ¡Â»Â¥ng ID giÃ¡ÂºÂ£ (`"p1"`) tÃ¡Â»Â« file `mockData.ts`, nhÃ†Â°ng Backend tÃ¡ÂºÂ¡o Database rÃ¡Â»â€”ng vÃ¡Â»â€ºi cÃƒÂ¡c ID sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m Ã„â€˜Ã†Â°Ã¡Â»Â£c sinh tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng bÃ¡ÂºÂ±ng mÃƒÂ£ UUID (random 36 kÃƒÂ½ tÃ¡Â»Â±).
- **KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c:** ViÃ¡ÂºÂ¿t thÃƒÂªm lÃ¡Â»â€¡nh can thiÃ¡Â»â€¡p vÃƒÂ o `DataSeeder.java`. Ãƒâ€°p Spring Boot khÃ¡Â»Å¸i tÃ¡ÂºÂ¡o cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh (hardcode) mÃ¡Â»â„¢t bÃ¡ÂºÂ£n ghi SÃ¡ÂºÂ£n phÃ¡ÂºÂ©m mÃ¡ÂºÂ«u vÃ¡Â»â€ºi tham sÃ¡Â»â€˜ `id = "p1"` ngay khi khÃ¡Â»Å¸i Ã„â€˜Ã¡Â»â„¢ng Ã„â€˜Ã¡Â»Æ’ Ã„â€˜ÃƒÂ¡p Ã¡Â»Â©ng chÃƒÂ­nh xÃƒÂ¡c mÃƒÂ£ ID gÃ¡Â» i tÃ¡Â»Â« Frontend.

**5. LÃ¡Â»â€”i `KhÃƒÂ´ng thÃ¡Â»Æ’ tÃ¡ÂºÂ¡o link thanh toÃƒÂ¡n` qua PayOS**

- **SÃ¡Â»Â± cÃ¡Â»â€˜:** PhÃ†Â°Ã†Â¡ng thÃ¡Â»Â©c Payment bÃƒÂ¡o lÃ¡Â»â€”i do PayOS SDK tÃ¡Â»Â« chÃ¡Â»â€˜i yÃƒÂªu cÃ¡ÂºÂ§u (401 Unauthorized).
- **NguyÃƒÂªn nhÃƒÂ¢n:** Ã¡Â»Â¨ng dÃ¡Â»Â¥ng chÃ¡ÂºÂ¡y trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p bÃ¡ÂºÂ±ng IDE khÃƒÂ´ng tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng Ã„â€˜Ã¡Â» c nÃ¡Â»â„¢i dung file `.env`. Do file `application-default.properties` trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ¢y thiÃ¡ÂºÂ¿t lÃ¡ÂºÂ­p mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh (fallback) bÃ¡ÂºÂ±ng giÃƒÂ¡ trÃ¡Â»â€¹ giÃ¡ÂºÂ£ (`YOUR_CLIENT_ID`), PayOS SDK Ã„â€˜ÃƒÂ£ lÃ¡ÂºÂ¥y giÃƒÂ¡ trÃ¡Â»â€¹ giÃ¡ÂºÂ£ nÃƒÂ y Ã„â€˜Ã¡Â»Æ’ gÃ¡Â»Â­i Ã„â€˜i.
- **KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c:**
  - Hardcode trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p cÃƒÂ¡c cÃ¡ÂºÂ·p Key cÃ¡Â»Â§a PayOS lÃƒÂ m giÃƒÂ¡ trÃ¡Â»â€¹ mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh thÃ¡ÂºÂ³ng vÃƒÂ o file properties (`${PAYOS_CLIENT_ID:37ef7825...}`).
  - BÃ¡Â»â€¢ sung log bÃ¡ÂºÂ¯t ngoÃ¡ÂºÂ¡i lÃ¡Â»â€¡ chi tiÃ¡ÂºÂ¿t (`e.getMessage()`) trong `PaymentServiceImpl` Ã„â€˜Ã¡Â»Æ’ hiÃ¡Â»Æ’n thÃ¡Â»â€¹ tÃ¡ÂºÂ­n gÃ¡Â»â€˜c lÃƒÂ½ do PayOS tÃ¡Â»Â« chÃ¡Â»â€˜i lÃ¡Â»â€¡nh tÃ¡ÂºÂ¡o Payment Link sau nÃƒÂ y.

### 2026-07-15: BÃ¡Â»â€¢ sung tÃƒÂ­nh nÃ„Æ’ng LÃ¡Â»â€¹ch sÃ¡Â»Â­ Ã„â€˜Ã†Â¡n hÃƒÂ ng B2C

- **Thay Ã„â€˜Ã¡Â»â€¢i chÃƒÂ­nh:** ThÃƒÂªm mÃƒÂ n hÃƒÂ¬nh LÃ¡Â»â€¹ch sÃ¡Â»Â­ Ã„ Ã†Â¡n HÃƒÂ ng (Order History) vÃƒÂ  module Ã†Â¯u Ã„â€˜ÃƒÂ£i (Offers) cho cÃ¡Â»Â­a hÃƒÂ ng B2C.
- **Backend:** ThÃƒÂªm field createdAt vÃƒÂ  items vÃƒÂ o OrderResponse.java. ThÃƒÂªm method getMyOrders trong OrderService vÃƒÂ  API GET /api/v1/orders/my-orders.
- **Frontend:** CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t top bar thÃƒÂªm 2 icon (Ã„ Ã†Â¡n hÃƒÂ ng & Ã†Â¯u Ã„â€˜ÃƒÂ£i), tÃ¡ÂºÂ¡o popup hiÃ¡Â»Æ’n thÃ¡Â»â€¹ max 5 Ã„â€˜Ã†Â¡n. TÃ¡ÂºÂ¡o mÃƒÂ n hÃƒÂ¬nh OrderHistoryPage Ã„â€˜Ã¡Â»Æ’ khÃƒÂ¡ch xem Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ chi tiÃ¡ÂºÂ¿t cÃƒÂ¡c mÃƒÂ³n hÃƒÂ ng Ã„â€˜ÃƒÂ£ Ã„â€˜Ã¡ÂºÂ·t.

## [16/07/2026] - NÃƒÂ¢ng cÃ¡ÂºÂ¥p giao diÃ¡Â»â€¡n Email thÃƒÂ´ng bÃƒÂ¡o

**1. TÃ¡ÂºÂ§ng Backend (`EmailService.java`)**

- Thay mÃ¡Â»â€ºi toÃƒÂ n bÃ¡Â»â„¢ mÃƒÂ£ HTML nÃ¡Â»â„¢i bÃ¡Â»â„¢ cÃ¡Â»Â§a cÃƒÂ¡c hÃƒÂ m gÃ¡Â»Â­i mail `sendOrderConfirmationEmail` (COD) vÃƒÂ  `sendPaymentSuccessEmail` (PayOS).
- NÃƒÂ¢ng cÃ¡ÂºÂ¥p giao diÃ¡Â»â€¡n email sang dÃ¡ÂºÂ¡ng thÃ¡ÂºÂ» (Card UI) hiÃ¡Â»â€¡n Ã„â€˜Ã¡ÂºÂ¡i: tÃƒÂ­ch hÃ¡Â»Â£p thanh tiÃƒÂªu Ã„â€˜Ã¡Â»  tÃ¡Â»â€˜i mÃƒÂ u, banner thÃƒÂ´ng bÃƒÂ¡o trÃ¡ÂºÂ¡ng thÃƒÂ¡i bo gÃƒÂ³c vÃ¡Â»â€ºi mÃƒÂ u sÃ¡ÂºÂ¯c Ã„â€˜Ã¡ÂºÂ·c trÃ†Â°ng (xanh lam cho xÃƒÂ¡c nhÃ¡ÂºÂ­n Ã„â€˜Ã†Â¡n hÃƒÂ ng, xanh lÃƒÂ¡ cho thanh toÃƒÂ¡n thÃƒÂ nh cÃƒÂ´ng).
- CÃ¡ÂºÂ¥u trÃƒÂºc lÃ¡ÂºÂ¡i cÃƒÂ¡c bÃ¡ÂºÂ£ng hiÃ¡Â»Æ’n thÃ¡Â»â€¹ chi tiÃ¡ÂºÂ¿t sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m, cÃ†Â°Ã¡Â»â€ºc vÃ¡ÂºÂ­n chuyÃ¡Â»Æ’n vÃƒÂ  tÃ¡Â»â€¢ng tiÃ¡Â» n Ã„â€˜Ã¡Â»Æ’ trÃ¡Â»Â±c quan vÃƒÂ  giÃ¡Â»â€˜ng thiÃ¡ÂºÂ¿t kÃ¡ÂºÂ¿ mÃ¡ÂºÂ«u (Figma/Images) hÃ†Â¡n.
- ThiÃ¡ÂºÂ¿t kÃ¡ÂºÂ¿ lÃ¡ÂºÂ¡i cÃƒÂ¡c khÃ¡Â»â€˜i cÃ¡ÂºÂ£nh bÃƒÂ¡o (nhÃ¡ÂºÂ¯c nhÃ¡Â»Å¸ chuÃ¡ÂºÂ©n bÃ¡Â»â€¹ tiÃ¡Â» n mÃ¡ÂºÂ·t) vÃƒÂ  cÃƒÂ¡c nÃƒÂºt hÃƒÂ nh Ã„â€˜Ã¡Â»â„¢ng (Call-to-Action) nÃ¡ÂºÂ±m ngang Ã„â€˜Ã¡ÂºÂ¹p mÃ¡ÂºÂ¯t.
- TÃ¡ÂºÂ­n dÃ¡Â»Â¥ng biÃ¡ÂºÂ¿n hÃ¡Â»â€¡ thÃ¡Â»â€˜ng `fromName` Ã„â€˜Ã¡Â»Æ’ tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng hiÃ¡Â»Æ’n thÃ¡Â»â€¹ TÃƒÂªn Shop trÃƒÂªn tiÃƒÂªu Ã„â€˜Ã¡Â»  email thay vÃƒÂ¬ code cÃ¡Â»Â©ng (hardcode).

**2. TÃ¡ÂºÂ§ng Backend (`Chat Real-time`)**

- TÃƒÂ­ch hÃ¡Â»Â£p `spring-boot-starter-websocket`, cÃ¡ÂºÂ¥u hÃƒÂ¬nh STOMP qua `/ws-chat` cÃƒÂ¹ng `WebSocketAuthInterceptor` kiÃ¡Â»Æ’m tra JWT Token.
- XÃƒÂ¢y dÃ¡Â»Â±ng sÃ†Â¡ Ã„â€˜Ã¡Â»â€œ dÃ¡Â»Â¯ liÃ¡Â»â€¡u Chat: `Conversation`, `ConversationMember`, `Message`. HÃ¡Â»â€” trÃ¡Â»Â£ Cursor Pagination bÃ¡ÂºÂ±ng ID (`id < cursor`) siÃƒÂªu mÃ†Â°Ã¡Â»Â£t vÃƒÂ  phÃƒÂ¢n quyÃ¡Â» n Staff rÃƒÂ nh mÃ¡ÂºÂ¡ch.
- TÃ¡ÂºÂ¡o REST API Ã„â€˜a chÃ¡Â»Â©c nÃ„Æ’ng: LÃ¡ÂºÂ¥y danh sÃƒÂ¡ch thoÃ¡ÂºÂ¡i (`ChatRestController`), load lÃ¡Â»â€¹ch sÃ¡Â»Â­ nhÃ¡ÂºÂ¯n tin, vÃƒÂ  gÃ¡Â»Â­i Ã¡ÂºÂ£nh/file thÃ¡ÂºÂ³ng lÃƒÂªn Cloudinary thÃƒÂ´ng qua `UploadService`.
- LÃ¡ÂºÂ¯ng nghe/phÃƒÂ¡t tin nhÃ¡ÂºÂ¯n trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p qua `@MessageMapping("/chat.send")` vÃƒÂ  trÃ¡ÂºÂ£ vÃ¡Â»  qua `/topic/conversation/{conversationId}`.

**3. KhÃ¡ÂºÂ¯c phÃ¡Â»Â¥c lÃ¡Â»â€”i Frontend (`ChatWidget.tsx`)**

- SÃ¡Â»Â­a lÃ¡Â»â€”i Ã¡Â»Â©ng dÃ¡Â»Â¥ng React bÃ¡Â»â€¹ crash vÃ¡Â»â€ºi thÃƒÂ´ng bÃƒÂ¡o `ReferenceError: FAQ_BUTTONS is not defined`.
- Khai bÃƒÂ¡o lÃ¡ÂºÂ¡i kiÃ¡Â»Æ’u dÃ¡Â»Â¯ liÃ¡Â»â€¡u `ChatMsg` vÃƒÂ  hÃ¡ÂºÂ±ng sÃ¡Â»â€˜ `FAQ_BUTTONS` ngay bÃƒÂªn trong file `ChatWidget.tsx` Ã„â€˜Ã¡Â»Æ’ sÃ¡Â»Â­a lÃ¡Â»â€”i thiÃ¡ÂºÂ¿u reference trong component.

## [2026-07-16] Refactor SOLID & Implement Real-time Chat

- **Server**: TÃƒÂ¡ch logic DTO mapping sang ChatMapper. TÃ¡ÂºÂ¡o cÃƒÂ¡c interface ChatService, MessageService (DIP).
- **Client**: CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t @stomp/stompjs vÃƒÂ  sockjs-client. TÃ¡ÂºÂ¡o API layer chat.api.ts vÃƒÂ  hook useChatWebSocket.ts Ã„â€˜Ã¡Â»Æ’ bÃƒÂ³c tÃƒÂ¡ch logic mÃ¡ÂºÂ¡ng khÃ¡Â» i view.
- **View**: Refactor ChatWidget.tsx vÃƒÂ  Inbox.tsx thÃƒÂ nh Dumb Components, lÃ¡ÂºÂ¥y dÃ¡Â»Â¯ liÃ¡Â»â€¡u qua Hook.
- **Docs**: CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t mÃƒÂ£ nguÃ¡Â»â€œn thÃ¡Â»Â±c tÃ¡ÂºÂ¿ vÃƒÂ o tÃƒÂ i liÃ¡Â»â€¡u 3_nghiÃ¡Â»â€¡p_vÃ¡Â»Â¥_chat_realtime.md.

## 2026-07-16

### TÃƒÂ¡i cÃ¡ÂºÂ¥u trÃƒÂºc Server theo SOLID (Backend)

- TÃƒÂ¡ch AuthServiceImpl thÃƒÂ nh AuthenticationServiceImpl, TokenManagementServiceImpl, OAuth2ServiceImpl, TwoFactorAuthServiceImpl.
- TÃƒÂ¡ch EmailService thÃƒÂ nh AuthEmailServiceImpl vÃƒÂ  OrderEmailServiceImpl.
- TÃƒÂ¡ch API upload khÃ¡Â» i ChatRestController sang MediaController vÃƒÂ  dÃƒÂ¹ng IMediaUploadService.
- TÃƒÂ¡ch logic chuyÃ¡Â»Æ’n Ã„â€˜Ã¡Â»â€¢i DTO sang ProductMapper.
- ToÃƒÂ n bÃ¡Â»â„¢ backend Ã„â€˜ÃƒÂ£ biÃƒÂªn dÃ¡Â»â€¹ch thÃƒÂ nh cÃƒÂ´ng.

## 2026-07-16

### TÃƒÂ¡i cÃ¡ÂºÂ¥u trÃƒÂºc Server sang Modular Monolith (Package-by-Feature)

- Ãƒ p dÃ¡Â»Â¥ng kiÃ¡ÂºÂ¿n trÃƒÂºc Package-by-Feature, nhÃƒÂ³m cÃƒÂ¡c class theo tÃ¡Â»Â«ng phÃƒÂ¢n hÃ¡Â»â€¡ chÃ¡Â»Â©c nÃ„Æ’ng (auth, media, order, payment, product, user) bÃƒÂªn trong  tmin.modules.* thay vÃƒÂ¬ chia theo layer (controller, service, repository) nhÃ†Â° trÃ†Â°Ã¡Â»â€ºc.
- Di chuyÃ¡Â»Æ’n cÃƒÂ¡c class cÃ¡ÂºÂ¥u hÃƒÂ¬nh vÃƒÂ  bÃ¡ÂºÂ£o mÃ¡ÂºÂ­t chung vÃƒÂ o  tmin.core.*.
- LoÃ¡ÂºÂ¡i bÃ¡Â»  package  tmin.common vÃƒÂ  loÃ¡ÂºÂ¡i bÃ¡Â»  code trÃƒÂ¹ng lÃ¡ÂºÂ·p bÃ¡ÂºÂ±ng cÃƒÂ¡ch tÃƒÂ¡i sÃ¡Â»Â­ dÃ¡Â»Â¥ng trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p cÃƒÂ¡c class (ApiResponse, PageInfo, cÃƒÂ¡c custom exception) Ã„â€˜Ã†Â°Ã¡Â»Â£c kÃ¡ÂºÂ¿ thÃ¡Â»Â«a tÃ¡Â»Â«  tmin-library.
- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t vÃƒÂ  fix lÃ¡Â»â€”i thiÃ¡ÂºÂ¿u import do thay Ã„â€˜Ã¡Â»â€¢i cÃ¡ÂºÂ¥u trÃƒÂºc package. DÃ¡Â»Â± ÃƒÂ¡n Ã„â€˜ÃƒÂ£ build thÃƒÂ nh cÃƒÂ´ng vÃƒÂ  chÃ¡ÂºÂ¡y Ã¡Â»â€¢n Ã„â€˜Ã¡Â»â€¹nh.
- Logic cÃ¡Â»Â§a Ã¡Â»Â©ng dÃ¡Â»Â¥ng Ã„â€˜Ã†Â°Ã¡Â»Â£c giÃ¡Â»Â¯ nguyÃƒÂªn vÃ¡ÂºÂ¹n 100% trÃ†Â°Ã¡Â»â€ºc vÃƒÂ  sau quÃƒÂ¡ trÃƒÂ¬nh refactor.

## 2026-07-17

### Tri?t tiÃ¯Â¿Â½u hoÃ¯Â¿Â½n toÃ¯Â¿Â½n s? ph? thu?c v?t lÃ¯Â¿Â½ gi?a cÃ¯Â¿Â½c module

- XÃ¯Â¿Â½a b? cÃ¯Â¿Â½c annotation liÃ¯Â¿Â½n k?t chÃ¯Â¿Â½o (@ManyToOne, v.v.) gi?a cÃ¯Â¿Â½c entity khÃ¯Â¿Â½c module (Order, Invoice, Product, User) vÃ¯Â¿Â½ thay th? b?ng cÃ¯Â¿Â½c tru?ng luu tr? khÃ¯Â¿Â½a chÃ¯Â¿Â½nh thu?n tÃ¯Â¿Â½y (userId, productId, orderId).
- B? sung cÃ¯Â¿Â½c InternalApi vÃ¯Â¿Â½ Dto t?i cÃ¯Â¿Â½c package  pi trong t?ng module d? ph?c v? giao ti?p chÃ¯Â¿Â½o.
- C?m truy c?p tr?c ti?p Repository c?a module khÃ¯Â¿Â½c. ToÃ¯Â¿Â½n b? l?nh g?i l?y thÃ¯Â¿Â½ng tin du?c chuy?n sang g?i thÃ¯Â¿Â½ng qua cÃ¯Â¿Â½c interface c?a InternalApi.
- Thi?t l?p co ch? Event-Driven: Chuy?n logic c?p nh?t tr?ng thÃ¯Â¿Â½i don hÃ¯Â¿Â½ng (khi thanh toÃ¯Â¿Â½n thÃ¯Â¿Â½nh cÃ¯Â¿Â½ng) sang m?t Event r?i PaymentSuccessEvent d? tang tÃ¯Â¿Â½nh decoupled.

## [2026-07-17] Refactor OrderEmailServiceImpl

- **Order**: Fix duplicate code for building HTML order items in sendOrderConfirmationEmail and sendPaymentSuccessEmail by extracting logic to  uildOrderItemsHtml helper method.

## 2026-07-17: Refactor Frontend Architecture to Features-based

- **Logic Added**: Refactored the entire frontend client to use a Feature-Driven Architecture (Feature-Sliced Design). Extracted components, API calls, and logic into specific domains (e.g. users, promotions, dashboard, inbox, payment,  uth, products, orders).
- **Files Modified**:
  - src/features/*: Created module directories containing pages, components, hooks, services, 	ypes.
  - src/core/routes/index.tsx: Consolidated routing to use feature modules.
  - src/core/layout/*: Updated layout imports.
  - src/core/components/common/*: Fixed legacy relative imports to point to core or eatures.
  - Deleted legacy src/pages and src/api directories.
- **Rule Applied**: SOLID Principles & Separation of Concerns (UI logic and API handling separated).

## [2026-07-17] Embedded State cho Order Email

- **TÃƒÂ­nh nÃ„Æ’ng**: Ãƒ p dÃ¡Â»Â¥ng Embedded State cho Order Email. ThÃƒÂªm cÃ¡Â»â„¢t email_status, email_retry_count vÃƒÂ o orders table.
- **Logic thÃƒÂªm vÃƒÂ o**: Tracking trÃ¡ÂºÂ¡ng thÃƒÂ¡i gÃ¡Â»Â­i email PENDING, SENT, FAILED khi gÃ¡Â»Â­i mail COD vÃƒÂ  PayOS thÃƒÂ nh cÃƒÂ´ng hay thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i (Ã¡Â»Å¸ luÃ¡Â»â€œng Async).
- **API mÃ¡Â»â€ºi**: ThÃƒÂªm API POST /api/v1/orders/{id}/resend-email trong OrderController Ã„â€˜Ã¡Â»Æ’ admin cÃƒÂ³ thÃ¡Â»Æ’ chÃ¡Â»Â§ Ã„â€˜Ã¡Â»â„¢ng gÃ¡Â»Â­i lÃ¡ÂºÂ¡i mail bÃ¡Â»â€¹ lÃ¡Â»â€”i.
- **Files modified**: Order.java, OrderEmailServiceImpl.java, OrderServiceImpl.java, OrderController.java. TÃ¡ÂºÂ¡o mÃ¡Â»â€ºi PaymentInternalApi.java, InvoiceDto.java.
- **LÃ†Â°Ã¡Â»â€ºi an toÃƒÂ n**: ThÃƒÂªm OrderEmailRetryJob.java chÃ¡ÂºÂ¡y ngÃ¡ÂºÂ§m bÃ¡ÂºÂ±ng @Scheduled(fixedDelay = 300000) Ã„â€˜Ã¡Â»Æ’ quÃƒÂ©t vÃƒÂ  tÃ¡Â»Â± Ã„â€˜Ã¡Â»â„¢ng gÃ¡Â»Â­i lÃ¡ÂºÂ¡i cÃƒÂ¡c email trÃ¡ÂºÂ¡ng thÃƒÂ¡i PENDING hoÃ¡ÂºÂ·c FAILED (giÃ¡Â»â€ºi hÃ¡ÂºÂ¡n tÃ¡Â»â€˜i Ã„â€˜a 3 lÃ¡ÂºÂ§n thÃ¡Â» thá»­, chÃ¡Â»â€° tÃƒÂ­nh cÃƒÂ¡c Ã„â€˜Ã†Â¡n hÃƒÂ ng tÃ¡ÂºÂ¡o cÃƒÂ¡ch Ã„â€˜ÃƒÂ¢y hÃ†Â¡n 5 phÃƒÂºt).
- **Refactor**: RÃƒÂºt gÃ¡Â» n tÃƒÂªn hÃƒÂ m query trong OrderRepository thÃƒÂ nh indOrdersForEmailRetry bÃ¡ÂºÂ±ng @Query vÃƒÂ  gÃ¡Â»Â¡ bÃ¡Â»  toÃƒÂ n bÃ¡Â»â„¢ Fully Qualified Class Names (FQCN) dÃ†Â° thÃ¡Â»Â«a trong code theo chuÃ¡ÂºÂ©n Clean Code.

- **Refactor**: ChuyÃ¡Â»Æ’n luÃ¡Â»â€œng gÃ¡Â»Â­i email COD sang cÃ†Â¡ chÃ¡ÂºÂ¿ BÃ¡ÂºÂ¥t Ã„â€˜Ã¡Â»â€œng bÃ¡Â»â„¢ an toÃƒÂ n tuyÃ¡Â»â€¡t Ã„â€˜Ã¡Â»â€˜i thÃƒÂ´ng qua TransactionalEventListener(AFTER_COMMIT) vÃ¡Â»â€ºi OrderCreatedEvent vÃƒÂ  EmailListener thay vÃƒÂ¬ gÃ¡Â» i trÃ¡Â»Â±c tiÃ¡ÂºÂ¿p trong method tÃ¡ÂºÂ¡o Ã„â€˜Ã†Â¡n.
- **Documentation**: ViÃ¡ÂºÂ¿t lÃ¡ÂºÂ¡i toÃƒÂ n bÃ¡Â»â„¢ README.md cÃ¡Â»Â§a module Order theo cÃ¡ÂºÂ¥u trÃƒÂºc chi tiÃ¡ÂºÂ¿t (Sequence-level flow, State transition table, Known limitations, How to verify) nhÃ†Â° tÃƒÂ i liÃ¡Â»â€¡u chuÃ¡ÂºÂ©n mÃ¡Â»Â±c cÃ¡Â»Â§a hÃ¡Â»â€¡ thÃ¡Â»â€˜ng.

## [2026-07-17] Mock Notification Menu Component

- **Frontend**: HoÃ¯Â¿Â½n thi?n component `NotificationMenu.tsx` trong layout chung, thay th? component tr?ng.
- **UI/UX**: S? d?ng Popover d? hi?n th? danh sÃ¯Â¿Â½ch thÃ¯Â¿Â½ng bÃ¯Â¿Â½o, vÃ¯Â¿Â½ Dialog (Modal) d? hi?n th? chi ti?t khi click vÃ¯Â¿Â½o m?t thÃ¯Â¿Â½ng bÃ¯Â¿Â½o.
- **Logic Added**: ThÃ¯Â¿Â½m mock data v?i nhi?u lo?i thÃ¯Â¿Â½ng bÃ¯Â¿Â½o (promotion, system, success, alert). X? lÃ¯Â¿Â½ click vÃ¯Â¿Â½o thÃ¯Â¿Â½ng bÃ¯Â¿Â½o t? dÃ¯Â¿Â½nh d?u dÃ¯Â¿Â½ d?c. TÃ¯Â¿Â½ch h?p nÃ¯Â¿Â½t hÃ¯Â¿Â½nh d?ng trong modal (nhu nh?n uu dÃ¯Â¿Â½i) d? di?u hu?ng s? d?ng `useNavigate` v?i state d? li?u d? t? d?ng di?n.

## [2026-07-17] KhÃ¯Â¿Â½ch hÃ¯Â¿Â½ng xem l?ch s? vÃ¯Â¿Â½ H?y don

- **Backend**: ThÃ¯Â¿Â½m hÃ¯Â¿Â½m l?y danh sÃ¯Â¿Â½ch don hÃ¯Â¿Â½ng c?a User trong `OrderRepository.java` vÃ¯Â¿Â½ `OrderService.java`. C?p nh?t Controller v?i 2 endpoint m?i: `GET /my-orders` vÃ¯Â¿Â½ `POST /{id}/cancel`.
- **Frontend**: Kh?i t?o hÃ¯Â¿Â½m api `getMyOrders` vÃ¯Â¿Â½ `cancelOrder` trong `order.api.ts`. C?p nh?t hook `useOrderHistory.ts` d? x? lÃ¯Â¿Â½ fetch l?i danh sÃ¯Â¿Â½ch sau khi h?y.
- **UI/UX**: Trong trang `OrderHistoryPage.tsx`, n?u don hÃ¯Â¿Â½ng dang ? tr?ng thÃ¯Â¿Â½i PENDING thÃ¯Â¿Â½ hi?n th? nÃ¯Â¿Â½t H?y don cÃ¯Â¿Â½ h?p tho?i Dialog c?nh bÃ¯Â¿Â½o xÃ¯Â¿Â½c nh?n. NÃ¯Â¿Â½t h?y d? n?i b?t.
- **Notification**: N?u khÃ¯Â¿Â½ch hÃ¯Â¿Â½ng h?y don thÃ¯Â¿Â½nh cÃ¯Â¿Â½ng, h? th?ng t? d?ng g?i qua `NotificationInternalApi` d? push m?t c?nh bÃ¯Â¿Â½o (ALERT) v? cho tÃ¯Â¿Â½i kho?n Admin.
-   * * 2 0 2 6 - 0 7 - 1 8 * * :   F i x e d   S p r i n g   B o o t   s t a r t u p   e r r o r   b y   i m p l e m e n t i n g   N o t i f i c a t i o n S e r v i c e   i n   N o t i f i c a t i o n S e r v i c e I m p l . j a v a .  
 -   * * 2 0 2 6 - 0 7 - 1 8 * * :   F i x e d   V i t e   i m p o r t   r e s o l u t i o n   e r r o r   b y   m a p p i n g   \ @ / \   a l i a s   t o   \ s r c / c o r e / \   i n   \ 	 s c o n f i g . j s o n \   a n d   \   i t e . c o n f i g . t s \   t o   a l i g n   w i t h   S h a d c n   U I   i m p o r t s .  
 
## [21/07/2026] - Code Review & Quality Assessment

**TÃ¡ÂºÂ¡o file Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡:**

- TÃ¡ÂºÂ¡o mÃ¡Â»â€ºi `done.md` tÃ¡ÂºÂ¡i root project: Ã„ ÃƒÂ¡nh giÃƒÂ¡ toÃƒÂ n diÃ¡Â»â€¡n chÃ¡ÂºÂ¥t lÃ†Â°Ã¡Â»Â£ng code cho cÃ¡ÂºÂ£ Server (Spring Boot) vÃƒÂ  Client (React/Vite).
- PhÃƒÂ¢n tÃƒÂ­ch 7 module server (auth, order, payment, notification, product, user, media) vÃƒÂ  8 feature client (auth, dashboard, inbox, orders, payment, products, promotions, users).
- Ã„ ÃƒÂ¡nh giÃƒÂ¡ tÃ¡Â»â€¢ng thÃ¡Â»Æ’: 7.5/10

**KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ Ã„â€˜ÃƒÂ¡nh giÃƒÂ¡ chÃƒÂ­nh:**

- 7 Ã„â€˜iÃ¡Â»Æ’m mÃ¡ÂºÂ¡nh (kiÃ¡ÂºÂ¿n trÃƒÂºc modular, Auth security xuÃ¡ÂºÂ¥t sÃ¡ÂºÂ¯c, event-driven payment, email retry system)
- 8 Ã„â€˜iÃ¡Â»Æ’m cÃ¡ÂºÂ§n cÃ¡ÂºÂ£i thiÃ¡Â»â€¡n (hardcode localhost, duplicate API, FQCN violations, alert thay toast, stub notification)
- 10 cÃ†Â¡ hÃ¡Â»â„¢i tÃ¡Â»â€˜i Ã†Â°u (BigDecimal, SecureRandom, Thymeleaf templates, idempotency check, mock data replacement)
- Checklist 12 action items vÃ¡Â»â€ºi priority P0/P1/P2 vÃƒÂ  effort estimate


**CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t code theo Code Review Phase 1:**

- CÃ¡ÂºÂ¥u hÃƒÂ¬nh \rontendUrl\ thÃƒÂ´ng qua \ pplication-default.properties\ (\${FRONTEND_URL}\) cho \OrderEmailServiceImpl\ vÃƒÂ  \PaymentServiceImpl\.
- DÃƒÂ¹ng \import.meta.env.VITE_API_URL\ trong \callApi.ts\.
- GÃ¡Â»â„¢p vÃƒÂ  refactor API call vÃƒÂ o \eatures/orders/services/order.api.ts\, xÃƒÂ³a bÃ¡Â»  \core/api/order.api.ts\ thÃ¡Â»Â«a.
- ThÃƒÂªm \	oast()\ thay thÃ¡ÂºÂ¿ cho \ lert()\ trong \OrderHistoryPage\.
- DÃ¡Â» n dÃ¡ÂºÂ¹p Clean Code (xÃƒÂ³a FQCN) trong cÃƒÂ¡c file \OrderEmailServiceImpl\, \AuthenticationServiceImpl\, \OrderController\, \OrderRepository\.
- SÃ¡Â» sá»­a lÃ¡Â»â€”i Dependency Inversion (tiÃƒÂªm Interface \IOrderEmailService\) trong \OrderEmailRetryJob\.
- Thay \Random\ bÃ¡ÂºÂ±ng \SecureRandom\ trong \TwoFactorAuthServiceImpl\.
- ThÃƒÂªm \existsByOrderId\ vÃƒÂ o \InvoiceRepository\ Ã„â€˜Ã¡Â»Æ’ kiÃ¡Â»Æ’m tra tÃƒÂ­nh lÃ…Â©y Ã„â€˜Ã¡ÂºÂ³ng trong \PaymentServiceImpl\ khi nhÃ¡ÂºÂ­n webhook.
- CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t truy vÃ¡ÂºÂ¥n DB thÃ¡Â»Â±c tÃ¡ÂºÂ¿ cho \NotificationServiceImpl\.


## [21/07/2026] - Fix PayOS API Exception

- **Logic Added**: Truncated the description field when calling PayOS create payment link API to ensure it doesn't exceed the 25 characters limit.
- **Files Modified**: PaymentServiceImpl.java

## [21/07/2026] - Redesign Order Details UI
- **Logic Added**: Redesigned the order details section to be more compact, matching the requested 'siÃƒÂªu nhÃ¡Â»  nhÃ¡ÂºÂ¯n' UI/UX standard with refined typography, colors, and layout.
- **Files Modified**: client/src/features/orders/pages/OrderHistoryPage.tsx

- **Bug Fix**: Added productImageUrl to OrderItem entity and mapped it in OrderItemResponse so order history displays the correct product image instead of a placeholder. Note: Only applies to newly placed orders.
- **UI Tweak**: Adjusted PENDING status badge color (amber-100 bg, amber-800 text) in OrderHistoryPage to match the visual weight of the HÃ¡Â»Â§y Ã„â€˜Ã†Â¡n button.

## [21/07/2026] - Redesign Email Templates
- **UI Tweak**: Redesigned both order-confirmation.html (COD) and payment-success.html (PayOS) to a modern, premium 'siÃƒÂªu nhÃ¡Â»  nhÃ¡ÂºÂ¯n' UI/UX standard with softer backgrounds, rounded corners, and cleaner typography.
- **Files Modified**: server/src/main/resources/templates/email/order-confirmation.html, server/src/main/resources/templates/email/payment-success.html

- **UI Tweak**: Removed the XCircle icon from the 'HÃ¡Â»Â§y Ã„â€˜Ã†Â¡n' button in OrderHistoryPage to make it look cleaner.

### 2026-07-21
- Updated database.md to sync with Java entity changes: converted money fields to DECIMAL(19,2), added email_status, email_retry_count in orders, product_image_url in order_items, and last_seen_notification_at in users.

- Added real data logic to Admin Dashboard: updated \DashboardService.java\ to calculate metrics from database.
- Added shipping status functionality: created \ShippingStatus.java\ enum, updated \Order.java\, \OrderDto.java\, \OrderResponse.java\, \OrderServiceImpl.java\, \OrderEmailServiceImpl.java\, and \order-confirmation.html\ to handle \shippingStatus\ and \estimatedDeliveryDate\.

## 2026-07-22
- **Fix (Client):** Added optional `shippingFee?: number` property to `OrderResponse` interface in `client\src\features\orders\services\order.api.ts` to fix TypeScript compilation error regarding missing property.
- **Fix (Client & Server):** Fixed staff creation bug where empty phone numbers caused unique constraint violation in database. Added strict frontend validation for phone format (must be 10 digits starting with 0 if provided). Added backend validation and handled empty phone strings by treating them as null to avoid DuplicateResourceException on empty strings.
- **Fix (Client):** SÃ¡Â» sá»­a lÃ¡Â»â€”i hiÃ¡Â»Æ’n thÃ¡Â»â€¹ badge chÃ†Â°a Ã„â€˜Ã¡Â» c Ã¡ÂºÂ£o Ã¡Â»Å¸ Widget Chat (ChatWidget.tsx). Badge mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh khÃƒÂ´ng cÃƒÂ²n hiÃ¡Â»Æ’n thÃ¡Â»â€¹ sÃ¡Â»â€˜ 1 ngay khi vÃƒÂ o trang, mÃƒÂ  thay vÃƒÂ o Ã„â€˜ÃƒÂ³ Ã„â€˜Ã¡ÂºÂ¿m sÃ¡Â»â€˜ tin nhÃ¡ÂºÂ¯n chÃ†Â°a Ã„â€˜Ã¡Â» c thÃ¡Â»Â±c sÃ¡Â»Â± nhÃ¡ÂºÂ­n Ã„â€˜Ã†Â°Ã¡Â»Â£c khi widget Ã„â€˜ang Ã„â€˜ÃƒÂ³ng.
- **Feature (Client & Server):** Bot chat auto-replies are now persisted in the database via a new endpoint (/api/v1/chat/{conversationId}/bot-reply). Bot messages are broadcasted properly over WebSocket and rendered on the left side of the chat interface as an admin/staff, ensuring chat history is fully saved instead of disappearing on reload.
- **Feature (Server & Client):** Refactored chat unread count to emulate Messenger/Zalo behavior. Unread message count and "mark as read" are now bidirectional and user-specific. Admin sees unread count of customer messages, and Customer sees unread count of admin/bot messages.
- **Fix (Client):** Chat widget now accurately shows historical unread count upon page load (instead of 0) and prevents auto-marking messages as read while the widget is closed.
- **Fix (Client):** Replaced hardcoded badge "3" on the Admin Sidebar ("HÃ¡Â»â€” trÃ¡Â»Â£ KhÃƒÂ¡ch hÃƒÂ ng") with a dynamic unread conversations counter. The sidebar now fetches real-time unread counts from the database and updates via WebSocket.
- **Fix (Client):** Removed auto-selection of the first conversation when opening Admin Inbox. The inbox now opens to a blank screen, preserving the unread badge of the first conversation until the admin explicitly clicks on it.
### 22/07/2026 - Fix Chat System Critical Bugs (Phase 1)
- **client/src/core/types/chat.ts**: XÃ¯Â¿Â½a cÃ¯Â¿Â½c fields data vÃ¯Â¿Â½ success l?i trong ConversationDTO.
- **client/src/core/components/common/ChatWidget.tsx**: S?a l?i logic guestReady gÃ¯Â¿Â½y k?t mÃ¯Â¿Â½n hÃ¯Â¿Â½nh guest form, xÃ¯Â¿Â½a dead code, t?i uu vi?c truy?n thÃ¯Â¿Â½ng tin user.
- **client/src/core/store/useChatWebSocket.ts**: X? lÃ¯Â¿Â½ Optimistic Update (hi?n th? g?i ngay l?p t?c), fix l?i duplicate tin nh?n, kh?c ph?c stale closure c?a isViewing, dÃ¯Â¿Â½ng WS URL qua env vÃ¯Â¿Â½ thÃ¯Â¿Â½m tÃ¯Â¿Â½nh nang fetch l?i tin nh?n b? miss sau khi reconnect.
- **server/src/main/java/atmin/modules/chat/controller/ChatWebSocketController.java**: S?a Full Qualified Class Name thÃ¯Â¿Â½nh standard import.

### 22/07/2026 - Feature Enhancements Chat System (Phase 2)
- **server/.../repository/ChatMessageRepository.java**: ThÃ¯Â¿Â½m query indByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc ph?c v? cursor-based pagination.
- **server/.../service/ChatServiceImpl.java**: TÃ¯Â¿Â½ch h?p cursor pagination cho method getMessages.
- **server/.../controller/ChatWebSocketController.java**: ThÃ¯Â¿Â½m endpoint @MessageMapping("/chat.typing") d? pub/sub s? ki?n typing.
- **client/src/core/store/useChatWebSocket.ts**: ThÃ¯Â¿Â½m tr?ng thÃ¯Â¿Â½i vÃ¯Â¿Â½ logic debounce typing, debounce markAsRead, hÃ¯Â¿Â½m loadMore h? tr? infinity scroll.
- **client/src/core/components/common/ChatWidget.tsx**: ThÃ¯Â¿Â½m UI Infinite Scroll, skeleton loading, hi?n th? indicator Typing vÃ¯Â¿Â½ tick tr?ng thÃ¯Â¿Â½i tin nh?n (?/??).

### 22/07/2026 - Sync Phase 2 Features to Admin Inbox
- **client/src/features/inbox/pages/AdminInbox.tsx**: C?p nh?t logic hi?n th? d?m s? lu?ng khÃ¯Â¿Â½ch hÃ¯Â¿Â½ng ch? (unreadConversations). TÃ¯Â¿Â½ch h?p Infinite Scroll, hi?u ?ng Typing Indicator, vÃ¯Â¿Â½ hi?n th? tr?ng thÃ¯Â¿Â½i tin nh?n (Sent/Delivered/Read) cho mÃ¯Â¿Â½n hÃ¯Â¿Â½nh chat c?a nhÃ¯Â¿Â½n viÃ¯Â¿Â½n.

### 22/07/2026 - Fix loi Realtime Read Receipts
- **client/src/core/store/useChatWebSocket.ts**: Sua loi kiem tra sai userId khi nhan su kien STOMP `/read`. Cap nhat logic de danh dau toan bo tin nhan khong phai cua `readerId` thanh `READ` thay vi phu thuoc vao custom `myId`, giup xu ly that nhanh va chinh xac status "Da doc" theo thoi gian thuc tren ca 2 phia Admin & Khach hang.

### 22/07/2026 - Fix loi Serialization cho STOMP Realtime Read Receipts
- **server/src/main/java/atmin/modules/chat/service/ChatServiceImpl.java**: Fix loi serialize object qua WebSocket (thay the `Optional.of(Map.of(...))` thanh `Map.of(...)`) giup client parse dung duoc payload.readerId trong su kien STOMP `/read`. Hien tuong nay gay ra viec loi 2 dau tich khong hoat dong realtime. Hien tai, client co the lang nghe va update trang thai tin nhan thanh "Da doc" thoi gian thuc.

## [22/07/2026] - Triá»ƒn khai tÃ­nh nÄƒng theo dÃµi tráº¡ng thÃ¡i Online/Offline (Presence)

**1. Backend**
- **atmin.modules.user.entity.User**: ThÃªm cá»™t `isOnline` vÃ  `lastSeenAt` Ä‘á»ƒ lÆ°u trá»¯ dá»¯ liá»‡u.
- **atmin.modules.user.api.UserInternalApi**: Bá»• sung hÃ m `updateUserPresence` phá»¥c vá»¥ giao tiáº¿p chÃ©o an toÃ n.
- **atmin.modules.chat.service.PresenceManager**: Khá»Ÿi táº¡o in-memory cache quáº£n lÃ½ connection báº±ng `ConcurrentHashMap`. Há»— trá»£ Grace Period (5 giÃ¢y) báº±ng `ScheduledExecutorService` Ä‘á»ƒ ngÄƒn cháº·n spam tráº¡ng thÃ¡i offline khi f5/nhÃ¡y máº¡ng.
- **atmin.modules.chat.listener.WebSocketEventListener**: Báº¯t sá»± kiá»‡n káº¿t ná»‘i/ngáº¯t káº¿t ná»‘i WebSocket vÃ  Ä‘áº©y dá»¯ liá»‡u vÃ o `PresenceManager`.
- **atmin.modules.chat.controller.ChatController**: ThÃªm endpoint `GET /api/v1/chat/presence` cho phÃ©p táº£i nhanh tráº¡ng thÃ¡i Online ngay khi má»Ÿ trang mÃ  khÃ´ng cáº§n chá» socket.
- **atmin.modules.chat.dto.ConversationDTO**: ThÃªm biáº¿n `participantId` Ä‘á»ƒ frontend cÃ³ thá»ƒ Ä‘á»‘i chiáº¿u presence.

**2. Frontend**
- **client/src/core/store/useChatWebSocket.ts**: Cáº­p nháº­t logic Ä‘á»ƒ load `initialPresence` qua API REST, Ä‘á»“ng thá»i subscribe `/topic/presence` Ä‘á»ƒ cáº­p nháº­t tráº¡ng thÃ¡i liÃªn tá»¥c.
- **client/src/features/inbox/pages/AdminInbox.tsx**: Thay tháº¿ thÃ´ng bÃ¡o "Äang trá»±c tuyáº¿n" tÄ©nh báº±ng hÃ m tÃ­nh thá»i gian thá»±c "Hoáº¡t Ä‘á»™ng X phÃºt trÆ°á»›c" thÃ´ng qua dá»¯ liá»‡u STOMP WebSocket. ThÃªm dáº¥u tick trÃ²n mÃ u xanh lÃ¡ Ä‘á»ƒ biá»ƒu thá»‹ khÃ¡ch hÃ ng Ä‘ang online á»Ÿ danh sÃ¡ch bÃªn trÃ¡i.

## [22/07/2026] - Sá»­a lá»—i Admin bá»‹ vÄƒng Ä‘Äƒng nháº­p khi táº£i láº¡i trang

**1. Frontend**
- **client/src/features/auth/components/AuthInit.tsx**: Sá»­a lá»—i Race Condition gÃ¢y ra do React StrictMode khi gá»i API `/auth/refresh` 2 láº§n liÃªn tiáº¿p cÃ¹ng má»™t thá»i Ä‘iá»ƒm. Viá»‡c gá»i 2 láº§n báº±ng cÃ¹ng 1 refresh_token khiáº¿n mÃ¡y chá»§ kÃ­ch hoáº¡t cÆ¡ cháº¿ chá»‘ng Reuse Attack vÃ  Ä‘Ã¡nh dáº¥u toÃ n bá»™ phiÃªn báº£n lÃ  khÃ´ng há»£p lá»‡, dáº«n Ä‘áº¿n admin bá»‹ vÄƒng khá»i há»‡ thá»‘ng má»—i khi báº¥m táº£i láº¡i trang (F5). CÃ¡ch sá»­a lÃ  cache Promise cá»§a request refresh Ä‘á»ƒ cháº·n double fetch.
## [22/07/2026] - C?p nh?t giao di?n nh?p OTP
- **Frontend**: C?p nh?t CSS cho ô nh?p OTP trong trang ResetPassword.tsx gi?ng v?i ph?n 2FA c?a AdminLogin.tsx d? th?ng nh?t giao di?n.


## [22/07/2026] - Fix l?i Reset Password API
- **Frontend**: C?p nh?t hàm g?i API resetPassword trong auth.api.ts và ResetPassword.tsx d? truy?n thêm tham s? confirmPassword, kh?c ph?c l?i Validation Failed tr? v? t? Backend.


## [22/07/2026] - Thêm ch?c nang G?i l?i mã OTP
- **Frontend**: C?p nh?t trang ResetPassword.tsx, truy?n state email t? trang ForgotPassword.tsx sang. Thêm logic d?m ngu?c 60 giây và cho phép g?i l?i mã OTP tr?c ti?p t? trang d?t l?i m?t kh?u, tuong t? tính nang bên trang Admin.


## [22/07/2026] - C?p nh?t lu?ng Ðang xu?t
- **Frontend**: C?p nh?t LayoutAtmin.tsx và callApi.ts d? t? d?ng di?u hu?ng ngu?i dùng v? dúng trang dang nh?p tuong ?ng v?i phân quy?n c?a h? sau khi dang xu?t ho?c h?t h?n phiên (Admin/Staff v? \/admin-login\, Khách hàng/Ð?i lý v? \/login\).


## [22/07/2026] - ThÃªm chá»©c nÄƒng Quáº£n lÃ½ Sáº£n pháº©m
- **Backend**: 
  - Táº¡o CreateProductDto, bá»• sung cÃ¡c API endpoint POST, PUT, DELETE trong ProductController.
  - Triá»ƒn khai logic trong ProductService cho phÃ©p thÃªm má»›i, sá»­a, vÃ  xÃ³a má»m sáº£n pháº©m.
  - TÃ­ch há»£p tÃ­nh nÄƒng Upload áº£nh sá»­ dá»¥ng module media cÃ³ sáºµn (POST /api/v1/media/upload).
  - Bá»• sung logic educeStock trong ProductInternalApi vÃ  tá»± Ä‘á»™ng gá»i má»—i khi cÃ³ Ä‘Æ¡n hÃ ng má»›i (OrderServiceImpl).
- **Frontend**: 
  - Thay tháº¿ dá»¯ liá»‡u mock trong useAdminProducts báº±ng @tanstack/react-query gá»i API thá»±c.
  - XÃ¢y dá»±ng ProductFormModal.tsx cho phÃ©p Ä‘iá»n thÃ´ng tin, quáº£n lÃ½ mÃ u sáº¯c, kÃ­ch cá»¡ vÃ  thiáº¿t láº­p tá»“n kho (stock) cho tá»«ng biáº¿n thá»ƒ (variant).
  - TÃ­ch há»£p Modal vÃ  tÃ­nh nÄƒng sá»­a/xÃ³a vÃ o AdminProducts.tsx.

- 2026-07-22: Cập nhật và bổ sung README.md cho toàn bộ 10 modules backend (auth, chat, dashboard, media, notification, order, payment, product, promotion, user) với luồng tương tác BE - Client chi tiết.
- 2026-07-22: Fix lỗi tràn trang (sticky footer) ở các form modal của Product và Promotion. Fix lỗi LazyInitializationException và URL mapping gây lỗi không xem được danh sách Ví Voucher bên Client. Khởi tạo dữ liệu phân quyền mẫu chi tiết hơn cho các Role STAFF, AGENT, CUSTOMER trong DataSeeder.
- 2026-07-22: Đã kết nối API lấy danh sách Nhân viên (Staff) từ Backend lên Frontend, thay thế cho dữ liệu giả lập (mock data) trên trang Quản lý Nhân viên.
- 2026-07-22: Bổ sung thêm các mẫu phân quyền nhanh (Quản lý, CSKH) và viết lại chú thích bảng phân quyền cho dễ hiểu hơn trong component StaffPermModal.
- 2026-07-22: Thêm hiệu ứng màu sắc (active state) để làm nổi bật mẫu phân quyền đang được áp dụng trong bảng Quản lý Nhân viên.
- 2026-07-23: Cải thiện giao diện bảng Quản lý Nhân viên: căn chỉnh lại các cột, làm gọn ID (tránh bị tràn dòng), sửa font chữ cột email và hiển thị nhãn quyền hạn ngắn gọn dễ hiểu hơn.
- 2026-07-23: Thiết kế lại mục Hướng dẫn phân quyền (Role Info) ở trang Quản lý Nhân viên thành dạng danh sách thẻ (card) trực quan, có icon minh họa và giải thích chi tiết cho cả 5 chức danh mẫu.
- 2026-07-23: Sửa lỗi Frontend gọi API tạo nhân viên 2 lần khi click đúp chuột (gây ra tình trạng tạo 2 tài khoản trùng email và gửi 2 email xác nhận). Thêm trạng thái isSubmitting để vô hiệu hóa nút submit trong lúc đang gọi API.
