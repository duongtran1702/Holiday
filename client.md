# TÀI LIỆU TỔNG HỢP NGHIỆP VỤ CLIENT (CLIENT.MD)

Tài liệu này gộp toàn bộ các đặc tả về cấu trúc thư mục, nghiệp vụ các màn hình, cơ chế phân quyền và hệ thống hỗ trợ trực tuyến của Client.

---

# PHẦN 1: Cấu trúc thư mục `client`
Dưới đây là cây thư mục (chỉ hiện các folder) của dự án `client`, kèm theo phân tích chi tiết chức năng của từng thư mục:

```text
client/
├── public/                 # Chứa các tài nguyên public có thể truy cập trực tiếp bằng URL (như favicon, logo tĩnh). Các file ở đây không bị Vite xử lý khi build.
├── src/                    # Thư mục gốc chứa toàn bộ mã nguồn React của ứng dụng.
│   ├── api/                # Nơi định nghĩa các endpoint và cấu hình gọi API (thường dùng Axios/Fetch). Tách biệt logic gọi data với UI.
│   ├── assets/             # Chứa các tài nguyên tĩnh được import trực tiếp vào mã nguồn (như ảnh, css, fonts). Vite sẽ xử lý/tối ưu hóa chúng khi build.
│   │   └── imgs/           # Thư mục con lưu trữ riêng các file hình ảnh.
│   ├── components/         # Chứa các UI component dùng chung có thể tái sử dụng nhiều lần.
│   │   ├── Card/           # Component thẻ hiển thị (ví dụ thẻ phim, thẻ tin tức).
│   │   ├── HomePage/       # Các component con cấu thành nên trang chủ (được tách nhỏ từ file HomePage.tsx lớn).
│   │   └── movieCalendar/  # Component phức tạp hiển thị lịch chiếu phim.
│   ├── hook/               # Chứa các custom hooks của React để tái sử dụng logic (ví dụ useFetch, useAuth...).
│   ├── Layout/             # Chứa component Layout bao bọc toàn bộ ứng dụng (thường bao gồm Header, Footer, Navigation).
│   ├── pages/              # Chứa các file giao diện cấp cao (Pages) tương ứng với mỗi URL route (như HomePage, Booking, Detail).
│   ├── redux/              # Cấu hình quản lý trạng thái toàn cục (State Management) bằng Redux Toolkit.
│   │   ├── slice/          # Nơi định nghĩa các reducers và actions (slices) cho từng tính năng (ví dụ: userSlice, movieSlice...).
│   │   └── store/          # Nơi khởi tạo và cấu hình Redux Store (kết hợp các slices lại).
│   ├── routes/             # Định nghĩa và cấu hình sơ đồ các đường dẫn (routes) của ứng dụng bằng React Router.
│   ├── types/              # Định nghĩa các kiểu dữ liệu, Interface dùng cho TypeScript, giúp code chặt chẽ và an toàn hơn.
│   └── util/               # Nơi chứa các hàm tiện ích nhỏ dùng chung (như format tiền tệ, định dạng ngày tháng, validate form).
├── dist/                   # (Tự sinh) Thư mục chứa code đã được build/đóng gói sẵn sàng để deploy lên server.
└── node_modules/           # (Tự sinh) Thư mục chứa các thư viện bên thứ ba tải về từ `npm` hoặc `pnpm`.
```

### 🧠 Phân tích luồng hoạt động dựa trên các folder:
1. **Routing:** Khi người dùng truy cập một URL, **`routes/`** sẽ quyết định **`pages/`** nào được hiển thị.
2. **UI & Layout:** **`pages/`** này sẽ được bọc trong giao diện khung của **`Layout/`** và sử dụng các mảnh ghép nhỏ được lấy từ **`components/`**.
3. **Data Fetching:** Để lấy dữ liệu, **`pages/`** hoặc **`redux/`** sẽ gọi các hàm được định nghĩa sẵn trong **`api/`**.
4. **State Management:** Kết quả gọi API (như thông tin user đăng nhập, danh sách phim đang chọn) sẽ được lưu trữ và cập nhật vào hệ thống chung thông qua **`redux/`**.
5. **Types & Utilities:** Xuyên suốt quá trình trên, mọi hàm đều được TypeScript kiểm soát kiểu dữ liệu nhờ **`types/`** và tận dụng các hàm có sẵn ở **`util/`**.

---

# PHẦN 2: ĐẶC TẢ GIAO DIỆN VÀ NGHIỆP VỤ MÀN HÌNH (PAGE UI/UX SPECIFICATIONS)

Tài liệu này mô tả chi tiết luồng nghiệp vụ (Business Logic) và thiết kế trải nghiệm người dùng (UX) cho các màn hình cốt lõi của Hệ thống Thời trang ABC.

## 2.1. MÀN HÌNH ĐĂNG KÝ (REGISTER PAGE)

**Mục đích:** Cho phép người dùng mới tạo tài khoản để sử dụng hệ thống. Điểm nhấn của màn hình này là buộc người dùng phải xác định rõ loại tài khoản (Role) mà họ muốn đăng ký ngay từ đầu: **Khách lẻ (B2C)** hoặc **Đại lý (B2B)**.

**Giao diện & Luồng nghiệp vụ:**
Tại màn hình Đăng ký, hệ thống hiển thị 2 Tab (hoặc 2 nút chọn) rõ ràng:

### Tab 1: Khách hàng cá nhân (Customer - B2C)
Dành cho khách hàng vãng lai mua sắm bán lẻ thông thường.
- **Trường thông tin yêu cầu (Bắt buộc):** Họ và tên, Số điện thoại, Email, Mật khẩu & Xác nhận mật khẩu
- **Hành vi hệ thống:**
  - Sau khi điền đầy đủ và bấm "Đăng ký", hệ thống gửi Email chứa mã OTP (hoặc link xác thực) để xác minh email.
  - Xác thực thành công -> Tạo tài khoản với Role là `Customer`.
  - Khách hàng được tự động đăng nhập và chuyển hướng (redirect) về **Trang chủ mua sắm (B2C Storefront)**. Họ có thể bắt đầu xem giá niêm yết, thêm giỏ hàng và đặt hàng ngay lập tức.

### Tab 2: Đối tác / Đại lý (Agent - B2B)
Dành cho khách mua sỉ, chủ buôn hoặc doanh nghiệp có nhu cầu nhập hàng số lượng lớn.
- **Trường thông tin yêu cầu (Bắt buộc):** Họ và tên người đại diện, Số điện thoại liên hệ, Email (dùng để đăng nhập), Mật khẩu & Xác nhận mật khẩu, Tên cửa hàng / Tên doanh nghiệp, Mã số thuế (Tùy chọn), Địa chỉ kinh doanh chi tiết.
- **Hành vi hệ thống:**
  - Sau khi bấm "Đăng ký", tài khoản được tạo trong Database nhưng bị đưa vào trạng thái **"Chờ duyệt" (Pending Approval)**.
  - Giao diện hiển thị thông báo: *"Cảm ơn bạn đã đăng ký làm đối tác. Hồ sơ của bạn đang được Ban quản trị xem xét. Chúng tôi sẽ liên hệ lại qua email/số điện thoại sớm nhất."*
  - Tài khoản lúc này **bị khóa chặn**, không thể đăng nhập vào cổng B2B để xem giá sỉ hay đặt hàng.
  - Phía Admin Dashboard sẽ có một thông báo đăng ký đại lý mới. Khi Admin kiểm tra thực tế và bấm "Duyệt" (cấp kèm Hạn mức công nợ), hệ thống tự động gửi Email báo tin: *"Tài khoản đại lý đã được kích hoạt"*. Lúc này đại lý mới chính thức được phép đăng nhập.

## 2.2. MÀN HÌNH ĐĂNG NHẬP (LOGIN PAGE)

**Mục đích:** Xác thực danh tính người dùng đã có tài khoản để cấp quyền truy cập không gian làm việc tương ứng. Hệ thống chia làm 2 cổng đăng nhập hoàn toàn tách biệt để bảo đảm tính phân quyền và bảo mật.

### Cổng Đăng nhập Khách hàng & Đại lý (User Portal)
Sử dụng chung một form đăng nhập công khai (Public Login) trên website.
- **Giao diện:** Form cơ bản gồm `Email` và `Mật khẩu`. Có thêm tính năng "Đăng nhập nhanh qua Google/Facebook" (Social Login).
- **Hành vi hệ thống (Routing thông minh dựa trên Role):**
  - Người dùng nhập Email + Mật khẩu và bấm "Đăng nhập". Hệ thống kiểm tra Role trong cơ sở dữ liệu.
  - **Trường hợp 1 (Nếu là Customer):** Đăng nhập thành công -> Điều hướng về Trang chủ mua sắm B2C. Giao diện hiển thị các module mua lẻ bình thường.
  - **Trường hợp 2 (Nếu là Agent - Đã duyệt):** Đăng nhập thành công -> Điều hướng thẳng vào không gian riêng **Cổng B2B Portal**. Tại đây đại lý thấy Bảng giá sỉ (chiết khấu bậc thang), Form đặt hàng Ma trận (Matrix Order), và Sổ công nợ của riêng họ.
  - **Trường hợp 3 (Nếu là Agent - Chờ duyệt / Bị khóa):** Chặn đăng nhập và hiển thị lỗi màu đỏ: *"Tài khoản của bạn đang chờ phê duyệt hoặc đã bị tạm khóa. Vui lòng liên hệ Admin."*

### Cổng Đăng nhập Nội bộ (Admin & Staff Login Portal)
Dành riêng cho **Admin** (Chủ shop) và **Staff** (Nhân viên nội bộ). Đây là khu vực "bất khả xâm phạm", thiết kế bảo mật cao nhất để đề phòng lộ mật khẩu hoặc lừa đảo (Phishing) trộm link.
- **Đường dẫn (URL) ẩn & Độc lập:** Không dùng `/login` chung với khách. Sử dụng một subdomain riêng biệt hoặc URL bí mật.
- **Hành vi hệ thống & Quy tắc bảo mật (Security Rules):**
  - **Bước 1 (Xác thực mật khẩu):** Nhập `Email` và `Mật khẩu` do hệ thống cấp riêng (không tự đăng ký).
  - **Bước 2 (Xác thực 2 yếu tố - 2FA Bắt buộc):** Sau khi đúng mật khẩu, màn hình chuyển sang yêu cầu nhập mã OTP. Nếu không có mã OTP hợp lệ, từ chối quyền truy cập ngay lập tức.
  - **Chống dò mật khẩu (Rate Limiting):** Nếu gõ sai mật khẩu hoặc mã OTP quá 5 lần liên tiếp trong vòng 5 phút -> Tự động khóa địa chỉ IP và khóa tài khoản đó tạm thời trong 30 phút. Gửi ngay Email khẩn cấp cảnh báo xâm nhập cho Chủ shop.
  - **Ghi log hoạt động (Audit Trail):** Khi Admin/Nhân viên đăng nhập thành công, hệ thống lưu vết toàn bộ thông tin: Địa chỉ IP, Trình duyệt, Thời gian. 
  - **Phân quyền Backend (Dynamic UI Routing):** Đưa người dùng vào Admin Dashboard. Giao diện sẽ tự động thay đổi (ẩn/hiện các module Menu) dựa trên chuỗi Quyền hạn (Permissions) mà Admin đã cấp cho tài khoản Staff đó trong Bảng phân quyền.

---

# PHẦN 3: PHÂN QUYỀN VÀ QUẢN LÝ VAI TRÒ (AUTHORIZATION & DYNAMIC RBAC)

Tài liệu này đặc tả Cơ chế Kiểm soát Truy cập Dựa trên Vai trò (Role-Based Access Control) của Hệ thống Thời trang ABC. Điểm nổi bật của hệ thống là cơ chế **Phân quyền Động (Dynamic Permissions)** dành cho nhân viên nội bộ.

## 3.1. DANH SÁCH 4 VAI TRÒ (ROLES) CỐT LÕI
Hệ thống được thiết kế tối giản và tập trung với **4 Roles** chính, chia thành 2 nhóm:

### Nhóm Người dùng bên ngoài (External Users)
1. **Khách lẻ (Customer - B2C):** Người tiêu dùng cuối cùng. Tự đăng ký tài khoản trên website. Mua lẻ với giá niêm yết.
2. **Đại lý (Agent - B2B):** Đối tác mua sỉ, chủ buôn. Phải được Admin xét duyệt mới có hiệu lực. Được phép mua sỉ qua Matrix Order Form, hưởng giá chiết khấu và có chính sách công nợ.

### Nhóm Nội bộ (Internal Backend Users)
3. **Quản trị viên (Admin):** Quyền lực tối cao. Kiểm soát toàn bộ hệ thống, thiết lập cấu hình lõi, và là người duy nhất có quyền tạo tài khoản cũng như phân quyền cho Staff.
4. **Nhân viên (Staff):** Nhân viên làm thuê cho cửa hàng (Sales, Kế toán, Kho, v.v.). Quyền hạn của Staff **không bị cố định** cứng ngắc mà được Admin cấp phát linh hoạt (tích chọn) thông qua Bảng Phân Quyền.

## 3.2. CƠ CHẾ PHÂN QUYỀN ĐỘNG CHO STAFF (DYNAMIC PERMISSIONS)
Thay vì tạo ra các Role cứng, Admin sẽ tạo một tài khoản mang Role là `Staff`. Sau đó, Admin sẽ vào **Bảng Phân Quyền** để tích chọn những màn hình và hành động mà nhân viên đó được phép làm.

**Bảng Phân Quyền mà Admin nhìn thấy:**
| Tên Module (Chức năng) | Quyền Xem (View) | Quyền Thêm (Create) | Quyền Sửa (Update) | Quyền Xóa (Delete) |
| :--- | :---: | :---: | :---: | :---: |
| **Quản lý Sản phẩm** | [ ] | [ ] | [ ] | [ ] |
| **Quản lý Tồn kho** | [ ] | [ ] | [ ] | Không áp dụng |
| **Quản lý Đơn hàng**| [ ] | [ ] | [ ] | [ ] |
| **Quản lý Đại lý** | [ ] | [ ] | [ ] | [ ] |
| **Quản lý Công nợ** | [ ] | Không áp dụng | [ ] | Không áp dụng |
| **Mã Khuyến mãi**| [ ] | [ ] | [ ] | [ ] |
| **Báo cáo Thống kê**| [ ] | Không áp dụng | Không áp dụng | Không áp dụng |
| **Hỗ trợ KH (Inbox)**| [ ] | [ ] | Không áp dụng | Không áp dụng |

**Cách ứng dụng:**
- **"Kế toán"**: Tích vào ô *Xem Báo cáo Thống kê* và *Xem/Sửa Quản lý Công nợ*.
- **"Nhân viên Kho"**: Tích vào ô *Xem/Sửa Quản lý Tồn kho* và *Xem/Sửa Đơn hàng*.

## 3.3. BẢO MẬT GIAO DIỆN & TRUY CẬP (Dynamic UI Routing)
Khi một `Staff` đăng nhập vào Admin Dashboard, hệ thống sẽ đọc chuỗi quyền hạn (Permissions) mà Admin đã cấp.
- Thanh Menu bên trái sẽ **tự động ẩn đi** tất cả những Module mà Staff đó không có quyền *View*. 
- Nếu Staff cố tình gõ trực tiếp URL của Module không được cấp phép, hệ thống chặn và hiển thị **403 Forbidden**.

---

# PHẦN 4: ĐẶC TẢ NGHIỆP VỤ HỖ TRỢ TRỰC TUYẾN (LIVE CHAT SUPPORTER)

Tính năng **Live Chat** cho phép Khách hàng và Đại lý nhắn tin trực tiếp với nhân viên thông qua Widget.

## 4.1. GIAO DIỆN NGƯỜI DÙNG (FRONT-END WIDGET)
- **Vị trí:** Luôn nổi ở góc dưới cùng bên phải màn hình (Cả B2C và B2B).
- **Đối với khách chưa đăng nhập (Guest):** Yêu cầu nhập **Họ tên** và **Số điện thoại** trước khi bắt đầu.
- **Đối với người dùng đã đăng nhập:** Tự động lấy Tên và Role để hiển thị cho nhân viên chăm sóc biết. Lưu lại lịch sử chat.

## 4.2. GIAO DIỆN QUẢN TRỊ (ADMIN / STAFF BACKEND)
- Bổ sung module **"Hỗ trợ Khách hàng" (Inbox/Chat)** trên Admin Dashboard.
- Cột trái: Danh sách khách hàng đang nhắn tin, tự động **gắn nhãn (label)** phân biệt *Khách vãng lai*, *Khách lẻ* hay *Đại lý*.
- Cột phải: Khung chat chi tiết để gửi tin nhắn, ảnh, và phản hồi 1-1.
- **Notification:** Âm thanh "ping" và Toast hiện lên khi có tin nhắn.
- **Chuyển luồng:** Chuyển phiên chat sang cho Admin nếu vượt thẩm quyền.

## 4.3. TÍNH NĂNG TỰ ĐỘNG & BẢO MẬT
- **Auto-reply:** Gửi lời chào tự động, báo ngoài giờ làm việc sau 22h, gợi ý câu hỏi thường gặp (FAQ).
- **Phân quyền:** Chỉ Staff có quyền xem `Inbox` mới thấy và trả lời tin nhắn. Admin toàn quyền kiểm tra toàn bộ cuộc hội thoại.
