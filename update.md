# Nhật ký cập nhật hệ thống (Changelog)

File này ghi lại toàn bộ các thay đổi, tính năng mới và cập nhật trong quá trình phát triển dự án.

## [14/07/2026] - Tính năng Đăng nhập bằng Google

**1. Cập nhật thư viện & Cấu hình**
- Thêm thư viện `com.google.api-client:google-api-client:2.2.0` vào `build.gradle` để phục vụ việc xác minh chữ ký ID Token từ Google.
- Khai báo biến môi trường `google.client.id` trong file `application.properties`.

**2. Tầng Controller & DTO**
- Tạo mới class `GoogleLoginRequest.java` tại `atmin.controller.auth.dto` để nhận yêu cầu từ Frontend chứa `idToken`.
- Thêm API endpoint mới `POST /api/v1/auth/google` vào `AuthController.java`.

**3. Tầng Service (Xử lý nghiệp vụ)**
- Cập nhật interface `AuthService.java` và class `AuthServiceImpl.java` với phương thức `loginWithGoogle`.
- Xây dựng luồng tự động kiểm chứng token bằng `GoogleIdTokenVerifier`.
- Xây dựng luồng tự động tạo người dùng mới xuống Database (với Role là `CUSTOMER` và sinh mật khẩu ngẫu nhiên) nếu email đăng nhập lần đầu tiên.
- Tích hợp hàm tạo Access Token và Refresh Token giống như luồng đăng nhập thường.
- Cập nhật (15/07): Đổi phương thức xác thực từ `GoogleIdTokenVerifier` sang sử dụng `RestTemplate` gọi API `userinfo` của Google bằng `access_token` để cho phép tùy chỉnh giao diện Frontend.

**4. Tầng Frontend (Client)**
- Thư viện: Cài đặt `@react-oauth/google`.
- Cấu hình: Bọc `main.tsx` với `<GoogleOAuthProvider>`.
- API: Thêm hàm `loginWithGoogle` trong `auth.api.ts` (gửi `accessToken`).
- Giao diện: Sử dụng Hook `useGoogleLogin` trong `UserLogin.tsx` thay vì nút chuẩn của Google, giúp giữ nguyên 100% giao diện nút thiết kế (UI custom) ban đầu.

## [14/07/2026] - Tính năng Đặt hàng và Thanh toán trực tuyến (PayOS)

**1. Cập nhật thư viện & Cấu hình**
- Thêm thư viện `vn.payos:payos-java:2.0.1` vào `build.gradle` để sử dụng SDK mới nhất của PayOS.
- Khai báo các biến môi trường `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` trong file `application.properties`.
- Tạo class cấu hình `PayOSConfig.java` để nạp thông tin kết nối PayOS.

**2. Tầng Entity & Enum**
- Thêm bảng dữ liệu `Order`, `OrderItem`, `Invoice` có liên kết khoá ngoại phù hợp cho việc thanh toán.
- Định nghĩa enum `OrderStatus` (PENDING, PENDING_PAYMENT, PAID, v.v.) và `PaymentMethod` (COD, PAYOS).

**3. Tầng Controller & DTO**
- Định nghĩa các DTO `OrderRequest` và `OrderResponse`.
- Tạo `OrderController.java` để nhận yêu cầu đặt hàng của khách hàng qua API.
- Tạo `PaymentController.java` mở cổng Webhook nhận trạng thái thanh toán từ hệ thống PayOS.

**4. Tầng Service**
- Tạo `OrderService` xử lý lưu dữ liệu đơn hàng và kiểm tra lựa chọn (nếu chọn PAYOS thì gọi tới `PaymentService`).
- Tạo `PaymentService` đóng vai trò gọi PayOS SDK để tạo Payment Link và xử lý Webhook. Tự động chuyển trạng thái đơn hàng sang `PAID` và sinh `Invoice` khi người dùng thanh toán thành công.

## [15/07/2026] - Kiến trúc Tách bạch Đăng nhập & Phân quyền Cổng (Portal)

**1. Tầng Database & Entity**
- Bổ sung cột `auth_provider` vào entity `User.java` (mặc định `LOCAL`, nếu tạo qua Google thì gán `GOOGLE`).

**2. Tầng Controller & DTO**
- Bổ sung biến `portal` (nhận giá trị `admin` hoặc `customer`) vào `LoginRequest.java` để xác định luồng đăng nhập.

**3. Tầng Service (`AuthServiceImpl.java`)**
- Áp dụng cơ chế **Strict Separation** (Tách bạch hoàn toàn):
  - Chặn tài khoản tạo bằng Mật khẩu không được dùng nút Đăng nhập Google.
  - Chặn tài khoản tạo bằng Google không được dùng form Đăng nhập Mật khẩu.
  - Chặn tài khoản Google sử dụng tính năng "Quên mật khẩu" và "Đổi mật khẩu" để bảo vệ luồng xác thực.
- Phân quyền Cổng đăng nhập (Portal):
  - Chặn tài khoản `ADMIN` và `STAFF` đăng nhập qua cổng Customer (`portal="customer"`).
  - Chặn người dùng thường (Customer) đăng nhập qua cổng Admin (`portal="admin"`).
- Cải thiện UX: Rút ngắn toàn bộ các thông báo lỗi (Exception messages) để tránh hiện tượng vỡ layout trên Frontend.

**4. Tầng Frontend**
- Bổ sung cấu hình truyền tham số `portal: 'customer'` trong `UserLogin.tsx`.
- Bổ sung cấu hình truyền tham số `portal: 'admin'` trong `AdminLogin.tsx`.

## [15/07/2026] - Hoàn thiện UI & Kết nối dữ liệu người dùng (Profile)

**1. Tầng Backend**
- Bổ sung trường dữ liệu `authProvider` và `phone` vào trong DTO trả về `AuthResponse.UserInfo`.
- Cập nhật hàm `buildAuthResponse` trong `AuthServiceImpl` để truyền `authProvider` và `phone` xuống Frontend sau khi người dùng đăng nhập thành công.

**2. Tầng Frontend**
- Cập nhật Interface `User` và `UserInfo` trong `types/index.ts` để đồng bộ cấu trúc dữ liệu trả về từ Backend (thêm `phone` và `authProvider`).
- **ProfileModal.tsx (Tài khoản của tôi) & UserMenu.tsx (Menu góc trên)**:
  - Loại bỏ hoàn toàn dữ liệu giả (Mock Data) và kết nối trực tiếp với trạng thái người dùng lưu trong Redux (`state.auth.user`).
  - Giao diện: Tự động trích xuất chữ cái đầu tiên trong tên thật của khách hàng để làm ảnh đại diện (Avatar initial).
  - Trải nghiệm (UX): Khóa cứng trường `Email` (chỉ cho phép xem) để bảo vệ tính vẹn toàn dữ liệu định danh.
  - Bảo vệ luồng đăng nhập (Strict Separation): Tự động ẩn hoàn toàn nút/tab "Đổi mật khẩu" ở mọi nơi nếu hệ thống phát hiện người dùng đang đăng nhập bằng Google (`authProvider === "GOOGLE"`).
  - Tích hợp logic upload file ảnh lên Cloudinary thông qua API.
  - Cập nhật Redux Store ngay sau khi gọi API thành công để thay thế hình Avatar chữ cái bằng Ảnh thật của User mà không cần reload trang.
  - Tự động gọi API cập nhật Họ Tên và Số điện thoại khi bấm "Lưu thông tin".

## [15/07/2026] - Triển khai luồng Đặt Hàng (Checkout Flow) & Tính năng Tự động lưu thông tin

**1. Tầng Database & Backend**
- Bổ sung trường `address` (Địa chỉ giao hàng) vào Entity `User.java` và cập nhật các luồng DTO liên quan (`UpdateProfileRequest`, `AuthResponse.UserInfo`).
- Tích hợp logic **Auto-save** trong `OrderServiceImpl.java`: Khi người dùng tạo một đơn hàng mới, nếu họ cung cấp số điện thoại hoặc địa chỉ khác với thông tin có sẵn trong tài khoản, hệ thống sẽ tự động cập nhật đè những thông tin này vào Profile của họ để tiết kiệm thời gian cho lần mua hàng sau.

**2. Tầng Frontend (Giao diện & Logic)**
- Bổ sung ô nhập "Địa chỉ nhận hàng" vào form của `ProfileModal.tsx`.
- Tạo mới file `order.api.ts` để tương tác với các endpoint Đặt hàng của Backend.
- Xây dựng **CheckoutModal.tsx** (Giao diện Thanh toán Pop-up):
  - **Auto-fill**: Tự động điền sẵn Họ tên, SĐT và Địa chỉ từ `user` state trong Redux.
  - Tích hợp hai hình thức thanh toán: COD (Thanh toán khi nhận hàng) và PAYOS (Thanh toán online quét mã QR).
  - Tích hợp **Validate chặt chẽ** (Strict Validation) theo châm ngôn "Thừa hơn thiếu": Số điện thoại phải đúng regex Việt Nam (10 số, đầu 0 hoặc +84), Địa chỉ giao hàng bắt buộc dài hơn 10 ký tự để hạn chế sai sót.
- Nâng cấp `CartDrawer.tsx` & `B2CPortal.tsx`:
  - **Bảo vệ luồng thanh toán**: Chặn người dùng vãng lai (Guest), yêu cầu phải Đăng nhập mới được ấn "Tiến hành thanh toán" (Tự động redirect về `/login`).
  - Xử lý mượt mà quá trình điều hướng URL (đối với PayOS) và làm trống giỏ hàng (đối với COD).

**3. Cập nhật AI Custom Rules**
- Thêm nguyên tắc `Strict Validation Rule` vào cấu hình `.agents/AGENTS.md` nhằm luôn ưu tiên xử lý dữ liệu người dùng cẩn thận, an toàn và chặt chẽ trong các tác vụ tương lai.

## [15/07/2026] - Khắc phục sự cố (Bug Fixes) Tích hợp Hệ thống Đặt hàng & Thanh toán

**1. Lỗi Xung đột Cấu hình Khởi động Spring Boot**
- **Sự cố:** Ứng dụng Spring Boot bị crash liên tục với lỗi `Failed to configure a DataSource: 'url' attribute is not specified`.
- **Nguyên nhân:** Phiên bản mới của thư viện dùng chung `atmin-library:1.0.4.Beta` vô tình đóng gói kèm một file `application.properties` rác, đè lên cấu hình database cục bộ.
- **Khắc phục:** Đổi tên file cấu hình nội bộ từ `application.properties` sang `application-default.properties` để nâng độ ưu tiên nạp cấu hình (áp dụng cho Profile mặc định `default`), qua đó ghi đè triệt để file rác của thư viện.

**2. Lỗi Tính tổng tiền ra `NaN` và `An unexpected error occurred` khi Checkout**
- **Sự cố:** Giỏ hàng tính ra tổng tiền `NaN đ`, API đặt hàng trả về 500.
- **Nguyên nhân:** Bất đồng bộ định dạng dữ liệu (Data Type Mismatch). Frontend trong mảng `cart` lưu số lượng là `qty`, màu là `color`, kích cỡ là `size`. Nhưng khi map vào đối tượng gửi đi (`CreateOrderRequest`) lại dùng nhầm `item.quantity`, `item.selectedColor`, dẫn đến gửi dữ liệu `null/undefined` xuống Backend.
- **Khắc phục:** Chuẩn hóa lại việc khởi tạo payload ở Frontend: sử dụng đúng `item.qty || 1`, fallback đầy đủ cho `item.color`, `item.size` ở trong file `CheckoutModal.tsx`.

**3. Lỗi `User not found` khi tạo Đơn Hàng (OrderServiceImpl)**
- **Sự cố:** `java.lang.RuntimeException: User not found` văng ra ở bước lưu Database dù người dùng đã đăng nhập.
- **Nguyên nhân:** Hàm `createOrder` sử dụng tham số là `userId` và tìm kiếm bằng `userRepository.findById()`. Tuy nhiên, biến này lấy giá trị từ `authentication.getName()` của JWT (thực chất là chuỗi Email của người dùng, không phải mã UUID).
- **Khắc phục:** Cập nhật lại logic tìm kiếm trong `OrderServiceImpl.java` thành `userRepository.findByEmailAndDeletedAtIsNull(username)` để truy xuất dữ liệu chính xác theo Email. 

**4. Lỗi `Product not found` với dữ liệu Mock**
- **Sự cố:** Báo lỗi `Product not found: p1` ở Backend do người dùng mua sản phẩm `p1` từ giao diện hiển thị mẫu.
- **Nguyên nhân:** Frontend sử dụng ID giả (`"p1"`) từ file `mockData.ts`, nhưng Backend tạo Database rỗng với các ID sản phẩm được sinh tự động bằng mã UUID (random 36 ký tự).
- **Khắc phục:** Viết thêm lệnh can thiệp vào `DataSeeder.java`. Ép Spring Boot khởi tạo cố định (hardcode) một bản ghi Sản phẩm mẫu với tham số `id = "p1"` ngay khi khởi động để đáp ứng chính xác mã ID gọi từ Frontend.

**5. Lỗi `Không thể tạo link thanh toán` qua PayOS**
- **Sự cố:** Phương thức Payment báo lỗi do PayOS SDK từ chối yêu cầu (401 Unauthorized).
- **Nguyên nhân:** Ứng dụng chạy trực tiếp bằng IDE không tự động đọc nội dung file `.env`. Do file `application-default.properties` trước đây thiết lập mặc định (fallback) bằng giá trị giả (`YOUR_CLIENT_ID`), PayOS SDK đã lấy giá trị giả này để gửi đi.
- **Khắc phục:**
  - Hardcode trực tiếp các cặp Key của PayOS làm giá trị mặc định thẳng vào file properties (`${PAYOS_CLIENT_ID:37ef7825...}`).
  - Bổ sung log bắt ngoại lệ chi tiết (`e.getMessage()`) trong `PaymentServiceImpl` để hiển thị tận gốc lý do PayOS từ chối lệnh tạo Payment Link sau này.
