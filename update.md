# Nháº­t kÃ½ cáº­p nháº­t há»‡ thá»‘ng (Changelog)

File nÃ y ghi láº¡i toÃ n bá»™ cÃ¡c thay Ä‘á»•i, tÃ­nh nÄƒng má»›i vÃ  cáº­p nháº­t trong quÃ¡ trÃ¬nh phÃ¡t triá»ƒn dá»± Ã¡n.

## [22/07/2026] - Dong bo ten va avatar trong lich su chat

**1. Backend**
- Cap nhat ChatServiceImpl.java: Xu ly dynamic lay avatar va name cua User tu dong theo real-time cho cac cuoc tro chuyen DIRECT thay vi luu cung thoi diem khoi tao.

## [22/07/2026] - Fix loi tinh nang Da doc cho Guest/Admin

**1. Frontend**
- Cap nhat useChatWebSocket.ts: Sua loi tu mark as read va parse JSON tu STOMP.

**2. Backend**
- Cap nhat ChatController.java: Xu ly loi NullPointerException khi Guest goi API read.
- Cap nhat ChatServiceImpl.java: Gui Map JSON cho STOMP message.

## [22/07/2026] - ThÃªm tÃ­nh nÄƒng cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Ã£ Ä‘á»c Realtime

**1. Sá»­a lá»—i frontend (Client)**

- Cáº­p nháº­t useChatWebSocket.ts: ThÃªm readSubRef Ä‘Äƒng kÃ½ theo dÃµi topic /topic/conversation/{convId}/read Ä‘á»ƒ cáº­p nháº­t tráº¡ng thÃ¡i tin nháº¯n thÃ nh READ ngay khi nháº­n Ä‘Æ°á»£c tÃ­n hiá»‡u ngÆ°á»i dÃ¹ng khÃ¡c Ä‘Ã£ Ä‘á»c.

**2. Sá»­a lá»—i backend (Server)**

- Cáº­p nháº­t ChatServiceImpl.java: ThÃªm hÃ m gá»­i thÃ´ng bÃ¡o qua STOMP tá»›i topic /topic/conversation/{conversationId}/read sau khi gá»i markAsReadForUser.

## [22/07/2026] - Sá»­a lá»—i sá»‘ lÆ°á»£ng tin nháº¯n chÆ°a Ä‘á»c

**1. Sá»­a lá»—i frontend (Client)**

- Cáº­p nháº­t useChatWebSocket.ts: ThÃªm onNewMessage callback Ä‘á»ƒ xá»­ lÃ½ tin nháº¯n má»›i nháº­n tá»« WebSocket thay vÃ¬ dá»±a vÃ o messages.length.
- Cáº­p nháº­t ChatWidget.tsx: XÃ³a logic lá»—i tÃ­nh sá»‘ lÆ°á»£ng tin nháº¯n chÆ°a Ä‘á»c dá»±a trÃªn lá»‹ch sá»­ tin nháº¯n. Sá»­ dá»¥ng onNewMessage Ä‘á»ƒ chá»‰ tÄƒng unreadCount khi cÃ³ tin nháº¯n thá»±c sá»± má»›i vÃ  khung chat Ä‘ang Ä‘Ã³ng.

## [14/07/2026] - TÃ­nh nÄƒng ÄÄƒng nháº­p báº±ng Google

**1. Cáº­p nháº­t thÆ° viá»‡n & Cáº¥u hÃ¬nh**

- ThÃªm thÆ° viá»‡n `com.google.api-client:google-api-client:2.2.0` vÃ o `build.gradle` Ä‘á»ƒ phá»¥c vá»¥ viá»‡c xÃ¡c minh chá»¯ kÃ½ ID Token tá»« Google.
- Khai bÃ¡o biáº¿n mÃ´i trÆ°á»ng `google.client.id` trong file `application.properties`.

**2. Táº§ng Controller & DTO**

- Táº¡o má»›i class `GoogleLoginRequest.java` táº¡i `atmin.controller.auth.dto` Ä‘á»ƒ nháº­n yÃªu cáº§u tá»« Frontend chá»©a `idToken`.
- ThÃªm API endpoint má»›i `POST /api/v1/auth/google` vÃ o `AuthController.java`.

**3. Táº§ng Service (Xá»­ lÃ½ nghiá»‡p vá»¥)**

- Cáº­p nháº­t interface `AuthService.java` vÃ  class `AuthServiceImpl.java` vá»›i phÆ°Æ¡ng thá»©c `loginWithGoogle`.
- XÃ¢y dá»±ng luá»“ng tá»± Ä‘á»™ng kiá»ƒm chá»©ng token báº±ng `GoogleIdTokenVerifier`.
- XÃ¢y dá»±ng luá»“ng tá»± Ä‘á»™ng táº¡o ngÆ°á»i dÃ¹ng má»›i xuá»‘ng Database (vá»›i Role lÃ  `CUSTOMER` vÃ  sinh máº­t kháº©u ngáº«u nhiÃªn) náº¿u email Ä‘Äƒng nháº­p láº§n Ä‘áº§u tiÃªn.
- TÃ­ch há»£p hÃ m táº¡o Access Token vÃ  Refresh Token giá»‘ng nhÆ° luá»“ng Ä‘Äƒng nháº­p thÆ°á»ng.
- Cáº­p nháº­t (15/07): Äá»•i phÆ°Æ¡ng thá»©c xÃ¡c thá»±c tá»« `GoogleIdTokenVerifier` sang sá»­ dá»¥ng `RestTemplate` gá»i API `userinfo` cá»§a Google báº±ng `access_token` Ä‘á»ƒ cho phÃ©p tÃ¹y chá»‰nh giao diá»‡n Frontend.

**4. Táº§ng Frontend (Client)**

- ThÆ° viá»‡n: CÃ i Ä‘áº·t `@react-oauth/google`.
- Cáº¥u hÃ¬nh: Bá»c `main.tsx` vá»›i `<GoogleOAuthProvider>`.
- API: ThÃªm hÃ m `loginWithGoogle` trong `auth.api.ts` (gá»­i `accessToken`).
- Giao diá»‡n: Sá»­ dá»¥ng Hook `useGoogleLogin` trong `UserLogin.tsx` thay vÃ¬ nÃºt chuáº©n cá»§a Google, giÃºp giá»¯ nguyÃªn 100% giao diá»‡n nÃºt thiáº¿t káº¿ (UI custom) ban Ä‘áº§u.

## [14/07/2026] - TÃ­nh nÄƒng Äáº·t hÃ ng vÃ  Thanh toÃ¡n trá»±c tuyáº¿n (PayOS)

**1. Cáº­p nháº­t thÆ° viá»‡n & Cáº¥u hÃ¬nh**

- ThÃªm thÆ° viá»‡n `vn.payos:payos-java:2.0.1` vÃ o `build.gradle` Ä‘á»ƒ sá»­ dá»¥ng SDK má»›i nháº¥t cá»§a PayOS.
- Khai bÃ¡o cÃ¡c biáº¿n mÃ´i trÆ°á»ng `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` trong file `application.properties`.
- Táº¡o class cáº¥u hÃ¬nh `PayOSConfig.java` Ä‘á»ƒ náº¡p thÃ´ng tin káº¿t ná»‘i PayOS.

**2. Táº§ng Entity & Enum**

- ThÃªm báº£ng dá»¯ liá»‡u `Order`, `OrderItem`, `Invoice` cÃ³ liÃªn káº¿t khoÃ¡ ngoáº¡i phÃ¹ há»£p cho viá»‡c thanh toÃ¡n.
- Äá»‹nh nghÄ©a enum `OrderStatus` (PENDING, PENDING_PAYMENT, PAID, v.v.) vÃ  `PaymentMethod` (COD, PAYOS).

**3. Táº§ng Controller & DTO**

- Äá»‹nh nghÄ©a cÃ¡c DTO `OrderRequest` vÃ  `OrderResponse`.
- Táº¡o `OrderController.java` Ä‘á»ƒ nháº­n yÃªu cáº§u Ä‘áº·t hÃ ng cá»§a khÃ¡ch hÃ ng qua API.
- Táº¡o `PaymentController.java` má»Ÿ cá»•ng Webhook nháº­n tráº¡ng thÃ¡i thanh toÃ¡n tá»« há»‡ thá»‘ng PayOS.

**4. Táº§ng Service**

- Táº¡o `OrderService` xá»­ lÃ½ lÆ°u dá»¯ liá»‡u Ä‘Æ¡n hÃ ng vÃ  kiá»ƒm tra lá»±a chá»n (náº¿u chá»n PAYOS thÃ¬ gá»i tá»›i `PaymentService`).
- Táº¡o `PaymentService` Ä‘Ã³ng vai trÃ² gá»i PayOS SDK Ä‘á»ƒ táº¡o Payment Link vÃ  xá»­ lÃ½ Webhook. Tá»± Ä‘á»™ng chuyá»ƒn tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng sang `PAID` vÃ  sinh `Invoice` khi ngÆ°á»i dÃ¹ng thanh toÃ¡n thÃ nh cÃ´ng.

## [15/07/2026] - Kiáº¿n trÃºc TÃ¡ch báº¡ch ÄÄƒng nháº­p & PhÃ¢n quyá»n Cá»•ng (Portal)

**1. Táº§ng Database & Entity**

- Bá»• sung cá»™t `auth_provider` vÃ o entity `User.java` (máº·c Ä‘á»‹nh `LOCAL`, náº¿u táº¡o qua Google thÃ¬ gÃ¡n `GOOGLE`).

**2. Táº§ng Controller & DTO**

- Bá»• sung biáº¿n `portal` (nháº­n giÃ¡ trá»‹ `admin` hoáº·c `customer`) vÃ o `LoginRequest.java` Ä‘á»ƒ xÃ¡c Ä‘á»‹nh luá»“ng Ä‘Äƒng nháº­p.

**3. Táº§ng Service (`AuthServiceImpl.java`)**

- Ãp dá»¥ng cÆ¡ cháº¿ **Strict Separation** (TÃ¡ch báº¡ch hoÃ n toÃ n):
  - Cháº·n tÃ i khoáº£n táº¡o báº±ng Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c dÃ¹ng nÃºt ÄÄƒng nháº­p Google.
  - Cháº·n tÃ i khoáº£n táº¡o báº±ng Google khÃ´ng Ä‘Æ°á»£c dÃ¹ng form ÄÄƒng nháº­p Máº­t kháº©u.
  - Cháº·n tÃ i khoáº£n Google sá»­ dá»¥ng tÃ­nh nÄƒng "QuÃªn máº­t kháº©u" vÃ  "Äá»•i máº­t kháº©u" Ä‘á»ƒ báº£o vá»‡ luá»“ng xÃ¡c thá»±c.
- PhÃ¢n quyá»n Cá»•ng Ä‘Äƒng nháº­p (Portal):
  - Cháº·n tÃ i khoáº£n `ADMIN` vÃ  `STAFF` Ä‘Äƒng nháº­p qua cá»•ng Customer (`portal="customer"`).
  - Cháº·n ngÆ°á»i dÃ¹ng thÆ°á»ng (Customer) Ä‘Äƒng nháº­p qua cá»•ng Admin (`portal="admin"`).
- Cáº£i thiá»‡n UX: RÃºt ngáº¯n toÃ n bá»™ cÃ¡c thÃ´ng bÃ¡o lá»—i (Exception messages) Ä‘á»ƒ trÃ¡nh hiá»‡n tÆ°á»£ng vá»¡ layout trÃªn Frontend.

**4. Táº§ng Frontend**

- Bá»• sung cáº¥u hÃ¬nh truyá»n tham sá»‘ `portal: 'customer'` trong `UserLogin.tsx`.
- Bá»• sung cáº¥u hÃ¬nh truyá»n tham sá»‘ `portal: 'admin'` trong `AdminLogin.tsx`.

## [15/07/2026] - HoÃ n thiá»‡n UI & Káº¿t ná»‘i dá»¯ liá»‡u ngÆ°á»i dÃ¹ng (Profile)

**1. Táº§ng Backend**

- Bá»• sung trÆ°á»ng dá»¯ liá»‡u `authProvider` vÃ  `phone` vÃ o trong DTO tráº£ vá» `AuthResponse.UserInfo`.
- Cáº­p nháº­t hÃ m `buildAuthResponse` trong `AuthServiceImpl` Ä‘á»ƒ truyá»n `authProvider` vÃ  `phone` xuá»‘ng Frontend sau khi ngÆ°á»i dÃ¹ng Ä‘Äƒng nháº­p thÃ nh cÃ´ng.

**2. Táº§ng Frontend**

- Cáº­p nháº­t Interface `User` vÃ  `UserInfo` trong `types/index.ts` Ä‘á»ƒ Ä‘á»“ng bá»™ cáº¥u trÃºc dá»¯ liá»‡u tráº£ vá» tá»« Backend (thÃªm `phone` vÃ  `authProvider`).
- **ProfileModal.tsx (TÃ i khoáº£n cá»§a tÃ´i) & UserMenu.tsx (Menu gÃ³c trÃªn)**:
  - Loáº¡i bá» hoÃ n toÃ n dá»¯ liá»‡u giáº£ (Mock Data) vÃ  káº¿t ná»‘i trá»±c tiáº¿p vá»›i tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng lÆ°u trong Redux (`state.auth.user`).
  - Giao diá»‡n: Tá»± Ä‘á»™ng trÃ­ch xuáº¥t chá»¯ cÃ¡i Ä‘áº§u tiÃªn trong tÃªn tháº­t cá»§a khÃ¡ch hÃ ng Ä‘á»ƒ lÃ m áº£nh Ä‘áº¡i diá»‡n (Avatar initial).
  - Tráº£i nghiá»‡m (UX): KhÃ³a cá»©ng trÆ°á»ng `Email` (chá»‰ cho phÃ©p xem) Ä‘á»ƒ báº£o vá»‡ tÃ­nh váº¹n toÃ n dá»¯ liá»‡u Ä‘á»‹nh danh.
  - Báº£o vá»‡ luá»“ng Ä‘Äƒng nháº­p (Strict Separation): Tá»± Ä‘á»™ng áº©n hoÃ n toÃ n nÃºt/tab "Äá»•i máº­t kháº©u" á»Ÿ má»i nÆ¡i náº¿u há»‡ thá»‘ng phÃ¡t hiá»‡n ngÆ°á»i dÃ¹ng Ä‘ang Ä‘Äƒng nháº­p báº±ng Google (`authProvider === "GOOGLE"`).
  - TÃ­ch há»£p logic upload file áº£nh lÃªn Cloudinary thÃ´ng qua API.
  - Cáº­p nháº­t Redux Store ngay sau khi gá»i API thÃ nh cÃ´ng Ä‘á»ƒ thay tháº¿ hÃ¬nh Avatar chá»¯ cÃ¡i báº±ng áº¢nh tháº­t cá»§a User mÃ  khÃ´ng cáº§n reload trang.
  - Tá»± Ä‘á»™ng gá»i API cáº­p nháº­t Há» TÃªn vÃ  Sá»‘ Ä‘iá»‡n thoáº¡i khi báº¥m "LÆ°u thÃ´ng tin".

## [15/07/2026] - Triá»ƒn khai luá»“ng Äáº·t HÃ ng (Checkout Flow) & TÃ­nh nÄƒng Tá»± Ä‘á»™ng lÆ°u thÃ´ng tin

**1. Táº§ng Database & Backend**

- Bá»• sung trÆ°á»ng `address` (Äá»‹a chá»‰ giao hÃ ng) vÃ o Entity `User.java` vÃ  cáº­p nháº­t cÃ¡c luá»“ng DTO liÃªn quan (`UpdateProfileRequest`, `AuthResponse.UserInfo`).
- TÃ­ch há»£p logic **Auto-save** trong `OrderServiceImpl.java`: Khi ngÆ°á»i dÃ¹ng táº¡o má»™t Ä‘Æ¡n hÃ ng má»›i, náº¿u há» cung cáº¥p sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c Ä‘á»‹a chá»‰ khÃ¡c vá»›i thÃ´ng tin cÃ³ sáºµn trong tÃ i khoáº£n, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng cáº­p nháº­t Ä‘Ã¨ nhá»¯ng thÃ´ng tin nÃ y vÃ o Profile cá»§a há» Ä‘á»ƒ tiáº¿t kiá»‡m thá»i gian cho láº§n mua hÃ ng sau.

**2. Táº§ng Frontend (Giao diá»‡n & Logic)**

- Bá»• sung Ã´ nháº­p "Äá»‹a chá»‰ nháº­n hÃ ng" vÃ o form cá»§a `ProfileModal.tsx`.
- Táº¡o má»›i file `order.api.ts` Ä‘á»ƒ tÆ°Æ¡ng tÃ¡c vá»›i cÃ¡c endpoint Äáº·t hÃ ng cá»§a Backend.
- XÃ¢y dá»±ng **CheckoutModal.tsx** (Giao diá»‡n Thanh toÃ¡n Pop-up):
  - **Auto-fill**: Tá»± Ä‘á»™ng Ä‘iá»n sáºµn Há» tÃªn, SÄT vÃ  Äá»‹a chá»‰ tá»« `user` state trong Redux.
  - TÃ­ch há»£p hai hÃ¬nh thá»©c thanh toÃ¡n: COD (Thanh toÃ¡n khi nháº­n hÃ ng) vÃ  PAYOS (Thanh toÃ¡n online quÃ©t mÃ£ QR).
  - TÃ­ch há»£p **Validate cháº·t cháº½** (Strict Validation) theo chÃ¢m ngÃ´n "Thá»«a hÆ¡n thiáº¿u": Sá»‘ Ä‘iá»‡n thoáº¡i pháº£i Ä‘Ãºng regex Viá»‡t Nam (10 sá»‘, Ä‘áº§u 0 hoáº·c +84), Äá»‹a chá»‰ giao hÃ ng báº¯t buá»™c dÃ i hÆ¡n 10 kÃ½ tá»± Ä‘á»ƒ háº¡n cháº¿ sai sÃ³t.
- NÃ¢ng cáº¥p `CartDrawer.tsx` & `B2CPortal.tsx`:
  - **Báº£o vá»‡ luá»“ng thanh toÃ¡n**: Cháº·n ngÆ°á»i dÃ¹ng vÃ£ng lai (Guest), yÃªu cáº§u pháº£i ÄÄƒng nháº­p má»›i Ä‘Æ°á»£c áº¥n "Tiáº¿n hÃ nh thanh toÃ¡n" (Tá»± Ä‘á»™ng redirect vá» `/login`).
  - Xá»­ lÃ½ mÆ°á»£t mÃ  quÃ¡ trÃ¬nh Ä‘iá»u hÆ°á»›ng URL (Ä‘á»‘i vá»›i PayOS) vÃ  lÃ m trá»‘ng giá» hÃ ng (Ä‘á»‘i vá»›i COD).

**3. Cáº­p nháº­t AI Custom Rules**

- ThÃªm nguyÃªn táº¯c `Strict Validation Rule` vÃ o cáº¥u hÃ¬nh `.agents/AGENTS.md` nháº±m luÃ´n Æ°u tiÃªn xá»­ lÃ½ dá»¯ liá»‡u ngÆ°á»i dÃ¹ng cáº©n tháº­n, an toÃ n vÃ  cháº·t cháº½ trong cÃ¡c tÃ¡c vá»¥ tÆ°Æ¡ng lai.

## [15/07/2026] - Kháº¯c phá»¥c sá»± cá»‘ (Bug Fixes) TÃ­ch há»£p Há»‡ thá»‘ng Äáº·t hÃ ng & Thanh toÃ¡n

**1. Lá»—i Xung Ä‘á»™t Cáº¥u hÃ¬nh Khá»Ÿi Ä‘á»™ng Spring Boot**

- **Sá»± cá»‘:** á»¨ng dá»¥ng Spring Boot bá»‹ crash liÃªn tá»¥c vá»›i lá»—i `Failed to configure a DataSource: 'url' attribute is not specified`.
- **NguyÃªn nhÃ¢n:** PhiÃªn báº£n má»›i cá»§a thÆ° viá»‡n dÃ¹ng chung `atmin-library:1.0.4.Beta` vÃ´ tÃ¬nh Ä‘Ã³ng gÃ³i kÃ¨m má»™t file `application.properties` rÃ¡c, Ä‘Ã¨ lÃªn cáº¥u hÃ¬nh database cá»¥c bá»™.
- **Kháº¯c phá»¥c:** Äá»•i tÃªn file cáº¥u hÃ¬nh ná»™i bá»™ tá»« `application.properties` sang `application-default.properties` Ä‘á»ƒ nÃ¢ng Ä‘á»™ Æ°u tiÃªn náº¡p cáº¥u hÃ¬nh (Ã¡p dá»¥ng cho Profile máº·c Ä‘á»‹nh `default`), qua Ä‘Ã³ ghi Ä‘Ã¨ triá»‡t Ä‘á»ƒ file rÃ¡c cá»§a thÆ° viá»‡n.

**2. Lá»—i TÃ­nh tá»•ng tiá»n ra `NaN` vÃ  `An unexpected error occurred` khi Checkout**

- **Sá»± cá»‘:** Giá» hÃ ng tÃ­nh ra tá»•ng tiá»n `NaN Ä‘`, API Ä‘áº·t hÃ ng tráº£ vá» 500.
- **NguyÃªn nhÃ¢n:** Báº¥t Ä‘á»“ng bá»™ Ä‘á»‹nh dáº¡ng dá»¯ liá»‡u (Data Type Mismatch). Frontend trong máº£ng `cart` lÆ°u sá»‘ lÆ°á»£ng lÃ  `qty`, mÃ u lÃ  `color`, kÃ­ch cá»¡ lÃ  `size`. NhÆ°ng khi map vÃ o Ä‘á»‘i tÆ°á»£ng gá»­i Ä‘i (`CreateOrderRequest`) láº¡i dÃ¹ng nháº§m `item.quantity`, `item.selectedColor`, dáº«n Ä‘áº¿n gá»­i dá»¯ liá»‡u `null/undefined` xuá»‘ng Backend.
- **Kháº¯c phá»¥c:** Chuáº©n hÃ³a láº¡i viá»‡c khá»Ÿi táº¡o payload á»Ÿ Frontend: sá»­ dá»¥ng Ä‘Ãºng `item.qty || 1`, fallback Ä‘áº§y Ä‘á»§ cho `item.color`, `item.size` á»Ÿ trong file `CheckoutModal.tsx`.

**3. Lá»—i `User not found` khi táº¡o ÄÆ¡n HÃ ng (OrderServiceImpl)**

- **Sá»± cá»‘:** `java.lang.RuntimeException: User not found` vÄƒng ra á»Ÿ bÆ°á»›c lÆ°u Database dÃ¹ ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p.
- **NguyÃªn nhÃ¢n:** HÃ m `createOrder` sá»­ dá»¥ng tham sá»‘ lÃ  `userId` vÃ  tÃ¬m kiáº¿m báº±ng `userRepository.findById()`. Tuy nhiÃªn, biáº¿n nÃ y láº¥y giÃ¡ trá»‹ tá»« `authentication.getName()` cá»§a JWT (thá»±c cháº¥t lÃ  chuá»—i Email cá»§a ngÆ°á»i dÃ¹ng, khÃ´ng pháº£i mÃ£ UUID).
- **Kháº¯c phá»¥c:** Cáº­p nháº­t láº¡i logic tÃ¬m kiáº¿m trong `OrderServiceImpl.java` thÃ nh `userRepository.findByEmailAndDeletedAtIsNull(username)` Ä‘á»ƒ truy xuáº¥t dá»¯ liá»‡u chÃ­nh xÃ¡c theo Email.

**4. Lá»—i `Product not found` vá»›i dá»¯ liá»‡u Mock**

- **Sá»± cá»‘:** BÃ¡o lá»—i `Product not found: p1` á»Ÿ Backend do ngÆ°á»i dÃ¹ng mua sáº£n pháº©m `p1` tá»« giao diá»‡n hiá»ƒn thá»‹ máº«u.
- **NguyÃªn nhÃ¢n:** Frontend sá»­ dá»¥ng ID giáº£ (`"p1"`) tá»« file `mockData.ts`, nhÆ°ng Backend táº¡o Database rá»—ng vá»›i cÃ¡c ID sáº£n pháº©m Ä‘Æ°á»£c sinh tá»± Ä‘á»™ng báº±ng mÃ£ UUID (random 36 kÃ½ tá»±).
- **Kháº¯c phá»¥c:** Viáº¿t thÃªm lá»‡nh can thiá»‡p vÃ o `DataSeeder.java`. Ã‰p Spring Boot khá»Ÿi táº¡o cá»‘ Ä‘á»‹nh (hardcode) má»™t báº£n ghi Sáº£n pháº©m máº«u vá»›i tham sá»‘ `id = "p1"` ngay khi khá»Ÿi Ä‘á»™ng Ä‘á»ƒ Ä‘Ã¡p á»©ng chÃ­nh xÃ¡c mÃ£ ID gá»i tá»« Frontend.

**5. Lá»—i `KhÃ´ng thá»ƒ táº¡o link thanh toÃ¡n` qua PayOS**

- **Sá»± cá»‘:** PhÆ°Æ¡ng thá»©c Payment bÃ¡o lá»—i do PayOS SDK tá»« chá»‘i yÃªu cáº§u (401 Unauthorized).
- **NguyÃªn nhÃ¢n:** á»¨ng dá»¥ng cháº¡y trá»±c tiáº¿p báº±ng IDE khÃ´ng tá»± Ä‘á»™ng Ä‘á»c ná»™i dung file `.env`. Do file `application-default.properties` trÆ°á»›c Ä‘Ã¢y thiáº¿t láº­p máº·c Ä‘á»‹nh (fallback) báº±ng giÃ¡ trá»‹ giáº£ (`YOUR_CLIENT_ID`), PayOS SDK Ä‘Ã£ láº¥y giÃ¡ trá»‹ giáº£ nÃ y Ä‘á»ƒ gá»­i Ä‘i.
- **Kháº¯c phá»¥c:**
  - Hardcode trá»±c tiáº¿p cÃ¡c cáº·p Key cá»§a PayOS lÃ m giÃ¡ trá»‹ máº·c Ä‘á»‹nh tháº³ng vÃ o file properties (`${PAYOS_CLIENT_ID:37ef7825...}`).
  - Bá»• sung log báº¯t ngoáº¡i lá»‡ chi tiáº¿t (`e.getMessage()`) trong `PaymentServiceImpl` Ä‘á»ƒ hiá»ƒn thá»‹ táº­n gá»‘c lÃ½ do PayOS tá»« chá»‘i lá»‡nh táº¡o Payment Link sau nÃ y.

### 2026-07-15: Bá»• sung tÃ­nh nÄƒng Lá»‹ch sá»­ Ä‘Æ¡n hÃ ng B2C

- **Thay Ä‘á»•i chÃ­nh:** ThÃªm mÃ n hÃ¬nh Lá»‹ch sá»­ ÄÆ¡n HÃ ng (Order History) vÃ  module Æ¯u Ä‘Ã£i (Offers) cho cá»­a hÃ ng B2C.
- **Backend:** ThÃªm field createdAt vÃ  items vÃ o OrderResponse.java. ThÃªm method getMyOrders trong OrderService vÃ  API GET /api/v1/orders/my-orders.
- **Frontend:** Cáº­p nháº­t top bar thÃªm 2 icon (ÄÆ¡n hÃ ng & Æ¯u Ä‘Ã£i), táº¡o popup hiá»ƒn thá»‹ max 5 Ä‘Æ¡n. Táº¡o mÃ n hÃ¬nh OrderHistoryPage Ä‘á»ƒ khÃ¡ch xem Ä‘áº§y Ä‘á»§ chi tiáº¿t cÃ¡c mÃ³n hÃ ng Ä‘Ã£ Ä‘áº·t.

## [16/07/2026] - NÃ¢ng cáº¥p giao diá»‡n Email thÃ´ng bÃ¡o

**1. Táº§ng Backend (`EmailService.java`)**

- Thay má»›i toÃ n bá»™ mÃ£ HTML ná»™i bá»™ cá»§a cÃ¡c hÃ m gá»­i mail `sendOrderConfirmationEmail` (COD) vÃ  `sendPaymentSuccessEmail` (PayOS).
- NÃ¢ng cáº¥p giao diá»‡n email sang dáº¡ng tháº» (Card UI) hiá»‡n Ä‘áº¡i: tÃ­ch há»£p thanh tiÃªu Ä‘á» tá»‘i mÃ u, banner thÃ´ng bÃ¡o tráº¡ng thÃ¡i bo gÃ³c vá»›i mÃ u sáº¯c Ä‘áº·c trÆ°ng (xanh lam cho xÃ¡c nháº­n Ä‘Æ¡n hÃ ng, xanh lÃ¡ cho thanh toÃ¡n thÃ nh cÃ´ng).
- Cáº¥u trÃºc láº¡i cÃ¡c báº£ng hiá»ƒn thá»‹ chi tiáº¿t sáº£n pháº©m, cÆ°á»›c váº­n chuyá»ƒn vÃ  tá»•ng tiá»n Ä‘á»ƒ trá»±c quan vÃ  giá»‘ng thiáº¿t káº¿ máº«u (Figma/Images) hÆ¡n.
- Thiáº¿t káº¿ láº¡i cÃ¡c khá»‘i cáº£nh bÃ¡o (nháº¯c nhá»Ÿ chuáº©n bá»‹ tiá»n máº·t) vÃ  cÃ¡c nÃºt hÃ nh Ä‘á»™ng (Call-to-Action) náº±m ngang Ä‘áº¹p máº¯t.
- Táº­n dá»¥ng biáº¿n há»‡ thá»‘ng `fromName` Ä‘á»ƒ tá»± Ä‘á»™ng hiá»ƒn thá»‹ TÃªn Shop trÃªn tiÃªu Ä‘á» email thay vÃ¬ code cá»©ng (hardcode).

**2. Táº§ng Backend (`Chat Real-time`)**

- TÃ­ch há»£p `spring-boot-starter-websocket`, cáº¥u hÃ¬nh STOMP qua `/ws-chat` cÃ¹ng `WebSocketAuthInterceptor` kiá»ƒm tra JWT Token.
- XÃ¢y dá»±ng sÆ¡ Ä‘á»“ dá»¯ liá»‡u Chat: `Conversation`, `ConversationMember`, `Message`. Há»— trá»£ Cursor Pagination báº±ng ID (`id < cursor`) siÃªu mÆ°á»£t vÃ  phÃ¢n quyá»n Staff rÃ nh máº¡ch.
- Táº¡o REST API Ä‘a chá»©c nÄƒng: Láº¥y danh sÃ¡ch thoáº¡i (`ChatRestController`), load lá»‹ch sá»­ nháº¯n tin, vÃ  gá»­i áº£nh/file tháº³ng lÃªn Cloudinary thÃ´ng qua `UploadService`.
- Láº¯ng nghe/phÃ¡t tin nháº¯n trá»±c tiáº¿p qua `@MessageMapping("/chat.send")` vÃ  tráº£ vá» qua `/topic/conversation/{conversationId}`.

**3. Kháº¯c phá»¥c lá»—i Frontend (`ChatWidget.tsx`)**

- Sá»­a lá»—i á»©ng dá»¥ng React bá»‹ crash vá»›i thÃ´ng bÃ¡o `ReferenceError: FAQ_BUTTONS is not defined`.
- Khai bÃ¡o láº¡i kiá»ƒu dá»¯ liá»‡u `ChatMsg` vÃ  háº±ng sá»‘ `FAQ_BUTTONS` ngay bÃªn trong file `ChatWidget.tsx` Ä‘á»ƒ sá»­a lá»—i thiáº¿u reference trong component.

## [2026-07-16] Refactor SOLID & Implement Real-time Chat

- **Server**: TÃ¡ch logic DTO mapping sang ChatMapper. Táº¡o cÃ¡c interface ChatService, MessageService (DIP).
- **Client**: CÃ i Ä‘áº·t @stomp/stompjs vÃ  sockjs-client. Táº¡o API layer chat.api.ts vÃ  hook useChatWebSocket.ts Ä‘á»ƒ bÃ³c tÃ¡ch logic máº¡ng khá»i view.
- **View**: Refactor ChatWidget.tsx vÃ  Inbox.tsx thÃ nh Dumb Components, láº¥y dá»¯ liá»‡u qua Hook.
- **Docs**: Cáº­p nháº­t mÃ£ nguá»“n thá»±c táº¿ vÃ o tÃ i liá»‡u 3_nghiá»‡p_vá»¥_chat_realtime.md.

## 2026-07-16

### TÃ¡i cáº¥u trÃºc Server theo SOLID (Backend)

- TÃ¡ch AuthServiceImpl thÃ nh AuthenticationServiceImpl, TokenManagementServiceImpl, OAuth2ServiceImpl, TwoFactorAuthServiceImpl.
- TÃ¡ch EmailService thÃ nh AuthEmailServiceImpl vÃ  OrderEmailServiceImpl.
- TÃ¡ch API upload khá»i ChatRestController sang MediaController vÃ  dÃ¹ng IMediaUploadService.
- TÃ¡ch logic chuyá»ƒn Ä‘á»•i DTO sang ProductMapper.
- ToÃ n bá»™ backend Ä‘Ã£ biÃªn dá»‹ch thÃ nh cÃ´ng.

## 2026-07-16

### TÃ¡i cáº¥u trÃºc Server sang Modular Monolith (Package-by-Feature)

- Ãp dá»¥ng kiáº¿n trÃºc Package-by-Feature, nhÃ³m cÃ¡c class theo tá»«ng phÃ¢n há»‡ chá»©c nÄƒng (auth, media, order, payment, product, user) bÃªn trong tmin.modules.* thay vÃ¬ chia theo layer (controller, service, repository) nhÆ° trÆ°á»›c.
- Di chuyá»ƒn cÃ¡c class cáº¥u hÃ¬nh vÃ  báº£o máº­t chung vÃ o tmin.core.*.
- Loáº¡i bá» package tmin.common vÃ  loáº¡i bá» code trÃ¹ng láº·p báº±ng cÃ¡ch tÃ¡i sá»­ dá»¥ng trá»±c tiáº¿p cÃ¡c class (ApiResponse, PageInfo, cÃ¡c custom exception) Ä‘Æ°á»£c káº¿ thá»«a tá»« tmin-library.
- Cáº­p nháº­t vÃ  fix lá»—i thiáº¿u import do thay Ä‘á»•i cáº¥u trÃºc package. Dá»± Ã¡n Ä‘Ã£ build thÃ nh cÃ´ng vÃ  cháº¡y á»•n Ä‘á»‹nh.
- Logic cá»§a á»©ng dá»¥ng Ä‘Æ°á»£c giá»¯ nguyÃªn váº¹n 100% trÆ°á»›c vÃ  sau quÃ¡ trÃ¬nh refactor.

## 2026-07-17

### Tri?t tiï¿½u hoï¿½n toï¿½n s? ph? thu?c v?t lï¿½ gi?a cï¿½c module

- Xï¿½a b? cï¿½c annotation liï¿½n k?t chï¿½o (@ManyToOne, v.v.) gi?a cï¿½c entity khï¿½c module (Order, Invoice, Product, User) vï¿½ thay th? b?ng cï¿½c tru?ng luu tr? khï¿½a chï¿½nh thu?n tï¿½y (userId, productId, orderId).
- B? sung cï¿½c InternalApi vï¿½ Dto t?i cï¿½c package pi trong t?ng module d? ph?c v? giao ti?p chï¿½o.
- C?m truy c?p tr?c ti?p Repository c?a module khï¿½c. Toï¿½n b? l?nh g?i l?y thï¿½ng tin du?c chuy?n sang g?i thï¿½ng qua cï¿½c interface c?a InternalApi.
- Thi?t l?p co ch? Event-Driven: Chuy?n logic c?p nh?t tr?ng thï¿½i don hï¿½ng (khi thanh toï¿½n thï¿½nh cï¿½ng) sang m?t Event r?i PaymentSuccessEvent d? tang tï¿½nh decoupled.

## [2026-07-17] Refactor OrderEmailServiceImpl

- **Order**: Fix duplicate code for building HTML order items in sendOrderConfirmationEmail and sendPaymentSuccessEmail by extracting logic to uildOrderItemsHtml helper method.

## 2026-07-17: Refactor Frontend Architecture to Features-based

- **Logic Added**: Refactored the entire frontend client to use a Feature-Driven Architecture (Feature-Sliced Design). Extracted components, API calls, and logic into specific domains (e.g. users, promotions, dashboard, inbox, payment, uth, products, orders).
- **Files Modified**:
  - src/features/*: Created module directories containing pages, components, hooks, services, 	ypes.
  - src/core/routes/index.tsx: Consolidated routing to use feature modules.
  - src/core/layout/*: Updated layout imports.
  - src/core/components/common/*: Fixed legacy relative imports to point to core or eatures.
  - Deleted legacy src/pages and src/api directories.
- **Rule Applied**: SOLID Principles & Separation of Concerns (UI logic and API handling separated).

## [2026-07-17] Embedded State cho Order Email

- **TÃ­nh nÄƒng**: Ãp dá»¥ng Embedded State cho Order Email. ThÃªm cá»™t email_status, email_retry_count vÃ o orders table.
- **Logic thÃªm vÃ o**: Tracking tráº¡ng thÃ¡i gá»­i email PENDING, SENT, FAILED khi gá»­i mail COD vÃ  PayOS thÃ nh cÃ´ng hay tháº¥t báº¡i (á»Ÿ luá»“ng Async).
- **API má»›i**: ThÃªm API POST /api/v1/orders/{id}/resend-email trong OrderController Ä‘á»ƒ admin cÃ³ thá»ƒ chá»§ Ä‘á»™ng gá»­i láº¡i mail bá»‹ lá»—i.
- **Files modified**: Order.java, OrderEmailServiceImpl.java, OrderServiceImpl.java, OrderController.java. Táº¡o má»›i PaymentInternalApi.java, InvoiceDto.java.
- **LÆ°á»›i an toÃ n**: ThÃªm OrderEmailRetryJob.java cháº¡y ngáº§m báº±ng @Scheduled(fixedDelay = 300000) Ä‘á»ƒ quÃ©t vÃ  tá»± Ä‘á»™ng gá»­i láº¡i cÃ¡c email tráº¡ng thÃ¡i PENDING hoáº·c FAILED (giá»›i háº¡n tá»‘i Ä‘a 3 láº§n thá»­, chá»‰ tÃ­nh cÃ¡c Ä‘Æ¡n hÃ ng táº¡o cÃ¡ch Ä‘Ã¢y hÆ¡n 5 phÃºt).
- **Refactor**: RÃºt gá»n tÃªn hÃ m query trong OrderRepository thÃ nh indOrdersForEmailRetry báº±ng @Query vÃ  gá»¡ bá» toÃ n bá»™ Fully Qualified Class Names (FQCN) dÆ° thá»«a trong code theo chuáº©n Clean Code.

- **Refactor**: Chuyá»ƒn luá»“ng gá»­i email COD sang cÆ¡ cháº¿ Báº¥t Ä‘á»“ng bá»™ an toÃ n tuyá»‡t Ä‘á»‘i thÃ´ng qua TransactionalEventListener(AFTER_COMMIT) vá»›i OrderCreatedEvent vÃ  EmailListener thay vÃ¬ gá»i trá»±c tiáº¿p trong method táº¡o Ä‘Æ¡n.
- **Documentation**: Viáº¿t láº¡i toÃ n bá»™ README.md cá»§a module Order theo cáº¥u trÃºc chi tiáº¿t (Sequence-level flow, State transition table, Known limitations, How to verify) nhÆ° tÃ i liá»‡u chuáº©n má»±c cá»§a há»‡ thá»‘ng.

## [2026-07-17] Mock Notification Menu Component

- **Frontend**: Hoï¿½n thi?n component `NotificationMenu.tsx` trong layout chung, thay th? component tr?ng.
- **UI/UX**: S? d?ng Popover d? hi?n th? danh sï¿½ch thï¿½ng bï¿½o, vï¿½ Dialog (Modal) d? hi?n th? chi ti?t khi click vï¿½o m?t thï¿½ng bï¿½o.
- **Logic Added**: Thï¿½m mock data v?i nhi?u lo?i thï¿½ng bï¿½o (promotion, system, success, alert). X? lï¿½ click vï¿½o thï¿½ng bï¿½o t? dï¿½nh d?u dï¿½ d?c. Tï¿½ch h?p nï¿½t hï¿½nh d?ng trong modal (nhu nh?n uu dï¿½i) d? di?u hu?ng s? d?ng `useNavigate` v?i state d? li?u d? t? d?ng di?n.

## [2026-07-17] Khï¿½ch hï¿½ng xem l?ch s? vï¿½ H?y don

- **Backend**: Thï¿½m hï¿½m l?y danh sï¿½ch don hï¿½ng c?a User trong `OrderRepository.java` vï¿½ `OrderService.java`. C?p nh?t Controller v?i 2 endpoint m?i: `GET /my-orders` vï¿½ `POST /{id}/cancel`.
- **Frontend**: Kh?i t?o hï¿½m api `getMyOrders` vï¿½ `cancelOrder` trong `order.api.ts`. C?p nh?t hook `useOrderHistory.ts` d? x? lï¿½ fetch l?i danh sï¿½ch sau khi h?y.
- **UI/UX**: Trong trang `OrderHistoryPage.tsx`, n?u don hï¿½ng dang ? tr?ng thï¿½i PENDING thï¿½ hi?n th? nï¿½t H?y don cï¿½ h?p tho?i Dialog c?nh bï¿½o xï¿½c nh?n. Nï¿½t h?y d? n?i b?t.
- **Notification**: N?u khï¿½ch hï¿½ng h?y don thï¿½nh cï¿½ng, h? th?ng t? d?ng g?i qua `NotificationInternalApi` d? push m?t c?nh bï¿½o (ALERT) v? cho tï¿½i kho?n Admin.
-   * * 2 0 2 6 - 0 7 - 1 8 * * :   F i x e d   S p r i n g   B o o t   s t a r t u p   e r r o r   b y   i m p l e m e n t i n g   N o t i f i c a t i o n S e r v i c e   i n   N o t i f i c a t i o n S e r v i c e I m p l . j a v a .  
 -   * * 2 0 2 6 - 0 7 - 1 8 * * :   F i x e d   V i t e   i m p o r t   r e s o l u t i o n   e r r o r   b y   m a p p i n g   \ @ / \   a l i a s   t o   \ s r c / c o r e / \   i n   \ 	 s c o n f i g . j s o n \   a n d   \  i t e . c o n f i g . t s \   t o   a l i g n   w i t h   S h a d c n   U I   i m p o r t s .  
 
## [21/07/2026] - Code Review & Quality Assessment

**Táº¡o file Ä‘Ã¡nh giÃ¡:**

- Táº¡o má»›i `done.md` táº¡i root project: ÄÃ¡nh giÃ¡ toÃ n diá»‡n cháº¥t lÆ°á»£ng code cho cáº£ Server (Spring Boot) vÃ  Client (React/Vite).
- PhÃ¢n tÃ­ch 7 module server (auth, order, payment, notification, product, user, media) vÃ  8 feature client (auth, dashboard, inbox, orders, payment, products, promotions, users).
- ÄÃ¡nh giÃ¡ tá»•ng thá»ƒ: 7.5/10

**Káº¿t quáº£ Ä‘Ã¡nh giÃ¡ chÃ­nh:**

- 7 Ä‘iá»ƒm máº¡nh (kiáº¿n trÃºc modular, Auth security xuáº¥t sáº¯c, event-driven payment, email retry system)
- 8 Ä‘iá»ƒm cáº§n cáº£i thiá»‡n (hardcode localhost, duplicate API, FQCN violations, alert thay toast, stub notification)
- 10 cÆ¡ há»™i tá»‘i Æ°u (BigDecimal, SecureRandom, Thymeleaf templates, idempotency check, mock data replacement)
- Checklist 12 action items vá»›i priority P0/P1/P2 vÃ  effort estimate


**Cáº­p nháº­t code theo Code Review Phase 1:**

- Cáº¥u hÃ¬nh \rontendUrl\ thÃ´ng qua \pplication-default.properties\ (\${FRONTEND_URL}\) cho \OrderEmailServiceImpl\ vÃ  \PaymentServiceImpl\.
- DÃ¹ng \import.meta.env.VITE_API_URL\ trong \callApi.ts\.
- Gá»™p vÃ  refactor API call vÃ o \eatures/orders/services/order.api.ts\, xÃ³a bá» \core/api/order.api.ts\ thá»«a.
- ThÃªm \	oast()\ thay tháº¿ cho \lert()\ trong \OrderHistoryPage\.
- Dá»n dáº¹p Clean Code (xÃ³a FQCN) trong cÃ¡c file \OrderEmailServiceImpl\, \AuthenticationServiceImpl\, \OrderController\, \OrderRepository\.
- Sá»­a lá»—i Dependency Inversion (tiÃªm Interface \IOrderEmailService\) trong \OrderEmailRetryJob\.
- Thay \Random\ báº±ng \SecureRandom\ trong \TwoFactorAuthServiceImpl\.
- ThÃªm \existsByOrderId\ vÃ o \InvoiceRepository\ Ä‘á»ƒ kiá»ƒm tra tÃ­nh lÅ©y Ä‘áº³ng trong \PaymentServiceImpl\ khi nháº­n webhook.
- CÃ i Ä‘áº·t truy váº¥n DB thá»±c táº¿ cho \NotificationServiceImpl\.


## [21/07/2026] - Fix PayOS API Exception

- **Logic Added**: Truncated the description field when calling PayOS create payment link API to ensure it doesn't exceed the 25 characters limit.
- **Files Modified**: PaymentServiceImpl.java

## [21/07/2026] - Redesign Order Details UI
- **Logic Added**: Redesigned the order details section to be more compact, matching the requested 'siÃªu nhá» nháº¯n' UI/UX standard with refined typography, colors, and layout.
- **Files Modified**: client/src/features/orders/pages/OrderHistoryPage.tsx

- **Bug Fix**: Added productImageUrl to OrderItem entity and mapped it in OrderItemResponse so order history displays the correct product image instead of a placeholder. Note: Only applies to newly placed orders.
- **UI Tweak**: Adjusted PENDING status badge color (amber-100 bg, amber-800 text) in OrderHistoryPage to match the visual weight of the Há»§y Ä‘Æ¡n button.

## [21/07/2026] - Redesign Email Templates
- **UI Tweak**: Redesigned both order-confirmation.html (COD) and payment-success.html (PayOS) to a modern, premium 'siÃªu nhá» nháº¯n' UI/UX standard with softer backgrounds, rounded corners, and cleaner typography.
- **Files Modified**: server/src/main/resources/templates/email/order-confirmation.html, server/src/main/resources/templates/email/payment-success.html

- **UI Tweak**: Removed the XCircle icon from the 'Há»§y Ä‘Æ¡n' button in OrderHistoryPage to make it look cleaner.

### 2026-07-21
- Updated database.md to sync with Java entity changes: converted money fields to DECIMAL(19,2), added email_status, email_retry_count in orders, product_image_url in order_items, and last_seen_notification_at in users.

- Added real data logic to Admin Dashboard: updated \DashboardService.java\ to calculate metrics from database.
- Added shipping status functionality: created \ShippingStatus.java\ enum, updated \Order.java\, \OrderDto.java\, \OrderResponse.java\, \OrderServiceImpl.java\, \OrderEmailServiceImpl.java\, and \order-confirmation.html\ to handle \shippingStatus\ and \estimatedDeliveryDate\.

## 2026-07-22
- **Fix (Client):** Added optional `shippingFee?: number` property to `OrderResponse` interface in `client\src\features\orders\services\order.api.ts` to fix TypeScript compilation error regarding missing property.
- **Fix (Client & Server):** Fixed staff creation bug where empty phone numbers caused unique constraint violation in database. Added strict frontend validation for phone format (must be 10 digits starting with 0 if provided). Added backend validation and handled empty phone strings by treating them as null to avoid DuplicateResourceException on empty strings.
- **Fix (Client):** Sá»­a lá»—i hiá»ƒn thá»‹ badge chÆ°a Ä‘á»c áº£o á»Ÿ Widget Chat (ChatWidget.tsx). Badge máº·c Ä‘á»‹nh khÃ´ng cÃ²n hiá»ƒn thá»‹ sá»‘ 1 ngay khi vÃ o trang, mÃ  thay vÃ o Ä‘Ã³ Ä‘áº¿m sá»‘ tin nháº¯n chÆ°a Ä‘á»c thá»±c sá»± nháº­n Ä‘Æ°á»£c khi widget Ä‘ang Ä‘Ã³ng.
- **Feature (Client & Server):** Bot chat auto-replies are now persisted in the database via a new endpoint (/api/v1/chat/{conversationId}/bot-reply). Bot messages are broadcasted properly over WebSocket and rendered on the left side of the chat interface as an admin/staff, ensuring chat history is fully saved instead of disappearing on reload.
- **Feature (Server & Client):** Refactored chat unread count to emulate Messenger/Zalo behavior. Unread message count and "mark as read" are now bidirectional and user-specific. Admin sees unread count of customer messages, and Customer sees unread count of admin/bot messages.
- **Fix (Client):** Chat widget now accurately shows historical unread count upon page load (instead of 0) and prevents auto-marking messages as read while the widget is closed.
- **Fix (Client):** Replaced hardcoded badge "3" on the Admin Sidebar ("Há»— trá»£ KhÃ¡ch hÃ ng") with a dynamic unread conversations counter. The sidebar now fetches real-time unread counts from the database and updates via WebSocket.
- **Fix (Client):** Removed auto-selection of the first conversation when opening Admin Inbox. The inbox now opens to a blank screen, preserving the unread badge of the first conversation until the admin explicitly clicks on it.
### 22/07/2026 - Fix Chat System Critical Bugs (Phase 1)
- **client/src/core/types/chat.ts**: Xï¿½a cï¿½c fields data vï¿½ success l?i trong ConversationDTO.
- **client/src/core/components/common/ChatWidget.tsx**: S?a l?i logic guestReady gï¿½y k?t mï¿½n hï¿½nh guest form, xï¿½a dead code, t?i uu vi?c truy?n thï¿½ng tin user.
- **client/src/core/store/useChatWebSocket.ts**: X? lï¿½ Optimistic Update (hi?n th? g?i ngay l?p t?c), fix l?i duplicate tin nh?n, kh?c ph?c stale closure c?a isViewing, dï¿½ng WS URL qua env vï¿½ thï¿½m tï¿½nh nang fetch l?i tin nh?n b? miss sau khi reconnect.
- **server/src/main/java/atmin/modules/chat/controller/ChatWebSocketController.java**: S?a Full Qualified Class Name thï¿½nh standard import.

### 22/07/2026 - Feature Enhancements Chat System (Phase 2)
- **server/.../repository/ChatMessageRepository.java**: Thï¿½m query indByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc ph?c v? cursor-based pagination.
- **server/.../service/ChatServiceImpl.java**: Tï¿½ch h?p cursor pagination cho method getMessages.
- **server/.../controller/ChatWebSocketController.java**: Thï¿½m endpoint @MessageMapping("/chat.typing") d? pub/sub s? ki?n typing.
- **client/src/core/store/useChatWebSocket.ts**: Thï¿½m tr?ng thï¿½i vï¿½ logic debounce typing, debounce markAsRead, hï¿½m loadMore h? tr? infinity scroll.
- **client/src/core/components/common/ChatWidget.tsx**: Thï¿½m UI Infinite Scroll, skeleton loading, hi?n th? indicator Typing vï¿½ tick tr?ng thï¿½i tin nh?n (?/??).

### 22/07/2026 - Sync Phase 2 Features to Admin Inbox
- **client/src/features/inbox/pages/AdminInbox.tsx**: C?p nh?t logic hi?n th? d?m s? lu?ng khï¿½ch hï¿½ng ch? (unreadConversations). Tï¿½ch h?p Infinite Scroll, hi?u ?ng Typing Indicator, vï¿½ hi?n th? tr?ng thï¿½i tin nh?n (Sent/Delivered/Read) cho mï¿½n hï¿½nh chat c?a nhï¿½n viï¿½n.

### 22/07/2026 - Fix loi Realtime Read Receipts
- **client/src/core/store/useChatWebSocket.ts**: Sua loi kiem tra sai userId khi nhan su kien STOMP `/read`. Cap nhat logic de danh dau toan bo tin nhan khong phai cua `readerId` thanh `READ` thay vi phu thuoc vao custom `myId`, giup xu ly that nhanh va chinh xac status "Da doc" theo thoi gian thuc tren ca 2 phia Admin & Khach hang.
