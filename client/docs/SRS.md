# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM
*(Software Requirements Specification - SRS)*

**HỆ THỐNG QUẢN LÝ VÀ KINH DOANH THỜI TRANG TÍCH HỢP ABC**
Bán lẻ trực tuyến (B2C) và Quản lý đại lý/khách sỉ phân phối (B2B)
cho Cửa hàng thời trang ABC

**Phiên bản:** 1.0  
**Ngày phát hành:** 08/07/2026  
**Trạng thái:** Dự thảo (Draft)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này đặc tả đầy đủ các yêu cầu nghiệp vụ và chức năng của Hệ thống Thương mại điện tử B2C/B2B phục vụ hoạt động bán lẻ quần áo trực tuyến cho khách hàng cá nhân, quản lý đại lý/khách sỉ phân phối và kiểm soát tồn kho sản phẩm thời trang tại cửa hàng ABC. Tài liệu là cơ sở để đội ngũ phát triển thiết kế, xây dựng, kiểm thử hệ thống, đồng thời là căn cứ để các bên liên quan (chủ cửa hàng, đội vận hành, đội kỹ thuật) thống nhất phạm vi và tiêu chí nghiệm thu.

### 1.2 Phạm vi hệ thống
Hệ thống bao gồm 3 nhóm phân hệ chính:
- **Phân hệ B2C (Cổng Bán lẻ):** phục vụ khách hàng cá nhân (như anh Mynato) mua sắm quần áo trực tuyến với giá niêm yết, thanh toán tiền tươi qua cổng thanh toán hoặc COD.
- **Phân hệ B2B (Cổng Bán sỉ):** phục vụ đại lý, chủ buôn, đối tác kinh doanh (như ông ATMIN) đặt hàng số lượng lớn theo cơ chế chiết khấu bậc thang và chính sách công nợ.
- **Phân hệ Quản trị (Admin Dashboard):** quản lý sản phẩm/biến thể, tồn kho, đơn hàng cả hai luồng, đại lý, khuyến mãi và báo cáo doanh thu/dòng tiền.

**Hệ thống không bao gồm:** hạ tầng mạng/máy chủ vật lý, hệ thống POS bán hàng tại quầy, hệ thống quản trị nội bộ khác (HRM, Accounting tổng, BI toàn doanh nghiệp), hệ thống logistics/vận chuyển nội bộ — các hệ thống này được xem là ngoài phạm vi (out of scope) hoặc chỉ tích hợp ở mức API.

### 1.3 Đối tượng sử dụng tài liệu
- **Chủ cửa hàng / Ban quản lý dự án:** đối chiếu phạm vi, phê duyệt yêu cầu.
- **Đội phát triển phần mềm (Full-stack Developer):** làm căn cứ thiết kế và lập trình.
- **Đội kiểm thử (QA/Tester):** xây dựng test case dựa trên yêu cầu.
- **Đơn vị vận hành cửa hàng:** xác nhận nghiệp vụ đúng với thực tế vận hành.

### 1.4 Định nghĩa, từ viết tắt

| Thuật ngữ | Giải thích |
| :--- | :--- |
| **B2C** | Business to Customer – Giao dịch giữa cửa hàng và khách hàng cá nhân mua lẻ. |
| **B2B** | Business to Business – Giao dịch giữa cửa hàng và đại lý/khách sỉ. |
| **Agent (Đại lý/Khách sỉ)** | Đối tác phân phối hoặc chủ buôn, được cấp tài khoản B2B và mức chiết khấu riêng. |
| **SRS** | Software Requirements Specification – Tài liệu đặc tả yêu cầu phần mềm. |
| **SKU** | Stock Keeping Unit – Đơn vị quản lý tồn kho, ứng với một biến thể cụ thể (sản phẩm + size + màu). |
| **RBAC** | Role-Based Access Control – Kiểm soát truy cập theo vai trò. |
| **Matrix Order** | Biểu mẫu đặt hàng dạng ma trận (Size × Màu) để nhập số lượng nhanh cho nhiều biến thể. |
| **Công nợ đại lý** | Số tiền đại lý/khách sỉ còn nợ hệ thống sau khi đặt hàng theo hình thức ghi nợ. |
| **Chiết khấu bậc thang** | Chính sách giá giảm dần theo số lượng mua: mua càng nhiều, giá càng rẻ. |
| **Tồn kho (Inventory)** | Số lượng sản phẩm còn lại có thể bán theo từng SKU (Size × Màu). |
| **Voucher** | Mã giảm giá áp dụng khi mua hàng trên cổng B2C. |
| **COD** | Cash on Delivery – Thanh toán khi nhận hàng. |

### 1.5 Tài liệu tham khảo
- Bảng giá và chính sách chiết khấu bậc thang nội bộ của cửa hàng ABC.
- Tài liệu API cổng thanh toán VNPay / Momo Sandbox.
- Quy chuẩn UI/UX nội bộ (nếu có).
- Danh mục sản phẩm và cấu trúc phân loại quần áo hiện hành.

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG

### 2.1 Bối cảnh nghiệp vụ
Cửa hàng thời trang ABC hiện vận hành bán hàng theo hình thức truyền thống (tại cửa hàng vật lý) kết hợp một phần trực tuyến qua các kênh phân phối riêng lẻ (fanpage Facebook, Zalo, Shopee), chưa có hệ thống thống nhất để: 
(1) khách hàng cá nhân tự xem hàng, đặt mua và thanh toán trực tuyến trên website riêng; 
(2) đại lý/khách sỉ đặt hàng số lượng lớn với chính sách giá chiết khấu bậc thang và quản lý công nợ tự động; 
(3) chủ shop theo dõi doanh thu, tồn kho theo từng biến thể (size × màu) và công nợ đại lý theo thời gian thực.

Hệ thống B2C/B2B được xây dựng nhằm số hóa toàn bộ quy trình bán hàng và phân phối sỉ, giảm phụ thuộc vào thao tác thủ công (nhắn tin báo giá, ghi sổ tay công nợ), tăng khả năng kiểm soát tồn kho và mở rộng kênh bán hàng chuyên nghiệp.

### 2.2 Sơ đồ tổng quan chức năng hệ thống
Hệ thống được tổ chức theo mô hình 3 lớp chức năng chính, tương tác với nhau qua một cơ sở dữ liệu tập trung:
1. Lớp giao dịch B2C – Website bán lẻ quần áo cho khách hàng cá nhân.
2. Lớp giao dịch B2B – Cổng đặt hàng sỉ dành cho đại lý/chủ buôn.
3. Lớp quản trị nội bộ – Admin Dashboard (Chủ shop, Nhân viên kho, Kế toán, Sales).

```text
                          +------------------------------------------+
                          |        HỆ THỐNG SHOP THỜI TRANG ABC      |
                          +------------------------------------------+
                                              |
               +------------------------------+------------------------------+
               |                              |                              |
   [CỔNG BÁN LẺ - B2C]            [CỔNG BÁN SỈ - B2B]          [ADMIN DASHBOARD]
 - Khách: Anh Mynato             - Khách: Ông ATMIN            - Chủ shop ABC
 - Mua lẻ: 1-5 bộ               - Mua sỉ: >= 10 bộ           - Nhân viên kho
 - Giá: Niêm yết cố định        - Giá: Chiết khấu bậc thang  - Kế toán
 - TT: Momo/VNPAY/COD           - TT: Ký quỹ, Ghi sổ nợ      - Sales
 - UX: Đẹp, Voucher, Review     - UX: Matrix Order Form      - Báo cáo BI, Phân quyền
 - Live Chat Hỗ trợ Khách hàng  - Live Chat Hỗ trợ Khách hàng - Trả lời Live Chat
```

Cả 3 lớp cùng thao tác trên một tập dữ liệu dùng chung: sản phẩm/biến thể, tồn kho theo SKU, đơn hàng, thanh toán, công nợ, người dùng — đảm bảo tính nhất quán dữ liệu theo thời gian thực (real-time) giữa các kênh bán.

### 2.3 Các nhóm người dùng (Actors)

| Vai trò | Mô tả | Quyền hạn chính |
| :--- | :--- | :--- |
| **Khách hàng lẻ (B2C Customer)** | Khách hàng cá nhân, vãng lai hoặc hội viên, mua quần áo số lượng nhỏ. | Xem sản phẩm, thêm giỏ hàng, đặt hàng, thanh toán, đánh giá sản phẩm, xem lịch sử đơn hàng. |
| **Đại lý / Khách sỉ (B2B Partner)** | Chủ shop, đại lý, tổ chức doanh nghiệp đã được Admin phê duyệt. | Đặt hàng số lượng lớn theo giá chiết khấu bậc thang, sử dụng Matrix Order Form, ghi nợ, xem công nợ, xem báo cáo doanh số. |
| **Nhân viên Sales** | Nhân viên vận hành nội bộ của cửa hàng ABC. | Xử lý đơn hàng, hỗ trợ khách hàng qua Live Chat, quản lý khuyến mãi. |
| **Nhân viên Kho** | Nhân viên quản lý kho hàng vật lý. | Xem đơn hàng, cập nhật tồn kho, không có quyền xóa dữ liệu. |
| **Kế toán** | Nhân viên kế toán nội bộ. | Quản lý công nợ, xem báo cáo, không có quyền can thiệp sản phẩm/đơn hàng. |
| **Quản trị viên (Admin)** | Chủ cửa hàng ABC hoặc quản lý cấp cao. | Toàn quyền: quản lý sản phẩm, người dùng, đại lý, khuyến mãi, xem báo cáo BI, phân quyền. |

### 2.4 Giả định và ràng buộc
- Hệ thống sử dụng cổng thanh toán VNPay/Momo (môi trường Sandbox) trong giai đoạn thử nghiệm, có thể thay thế bằng cổng chính thức khi vận hành thật.
- Chính sách chiết khấu bậc thang được áp dụng thống nhất cho tất cả đại lý trong giai đoạn 1 (chưa phân hạng đại lý Vàng/Bạc/Đồng); việc phân hạng là hướng mở rộng.
- Mỗi sản phẩm quần áo có nhiều biến thể (variant) theo tổ hợp Size × Màu sắc. Tồn kho được quản lý tới cấp SKU (một biến thể = một SKU).
- Hệ thống giả định người dùng có kết nối Internet ổn định khi thực hiện giao dịch.
- Vận chuyển đơn hàng được xử lý ngoài hệ thống (qua đơn vị vận chuyển bên thứ 3); hệ thống chỉ cập nhật trạng thái đơn hàng.
- Ngôn ngữ hệ thống: Tiếng Việt (giai đoạn 1); có thể mở rộng đa ngôn ngữ.

---

## 3. YÊU CẦU NGHIỆP VỤ CHI TIẾT

### 3.1 Nhóm chức năng B2C (Khách hàng cá nhân)

#### 3.1.1 Đăng ký / Đăng nhập
Mô tả: Khách hàng có thể đăng ký tài khoản, đăng nhập, hoặc mua hàng không cần tài khoản (Guest checkout).
- Đăng ký bằng email + mật khẩu, xác thực qua email/OTP.
- Đăng nhập bằng email/mật khẩu; hỗ trợ đăng nhập nhanh qua Google (tùy chọn mở rộng).
- Cho phép đặt hàng không cần đăng nhập (Guest), yêu cầu nhập họ tên, email, số điện thoại, địa chỉ giao hàng.
- Quên mật khẩu: gửi liên kết đặt lại mật khẩu qua email.

#### 3.1.2 Tra cứu, xem sản phẩm quần áo
- Hiển thị danh sách sản phẩm quần áo theo danh mục (Áo, Quần, Đầm/Váy, Phụ kiện, ...).
- Hiển thị thông tin chi tiết sản phẩm: hình ảnh (nhiều góc), giá niêm yết, mô tả chất liệu, hướng dẫn chọn size, các biến thể có sẵn (Size × Màu).
- Hiển thị tình trạng còn hàng/hết hàng theo từng biến thể (SKU).
- Tìm kiếm và lọc sản phẩm theo: danh mục, khoảng giá, size, màu sắc, từ khóa.
- Sắp xếp sản phẩm theo: mới nhất, giá tăng/giảm, bán chạy nhất.

#### 3.1.3 Giỏ hàng
- Thêm sản phẩm vào giỏ hàng với biến thể cụ thể (Size + Màu) và số lượng.
- Xóa hoặc cập nhật số lượng sản phẩm trong giỏ hàng.
- Hiển thị tổng tạm tính, cho phép nhập mã giảm giá (Voucher) nếu có.
- Kiểm tra tồn kho theo SKU thời gian thực trước khi cho phép thanh toán.
- Hệ thống khóa kho tạm thời (Lock Inventory) cho các SKU trong giỏ hàng khi khách bắt đầu thanh toán để tránh tranh chấp dữ liệu (Concurrency Control).

#### 3.1.4 Đặt hàng & Thanh toán
Quy trình: Chọn sản phẩm (Size/Màu) → Giỏ hàng → Nhập thông tin giao hàng → Chọn phương thức thanh toán → Thanh toán → Xác nhận đơn hàng.
- Phương thức thanh toán hỗ trợ: Thanh toán trực tuyến qua VNPay/Momo, Thanh toán khi nhận hàng (COD).
- Hệ thống tạo đơn hàng ở trạng thái "Chờ thanh toán" trước khi chuyển hướng sang cổng thanh toán.
- Sau khi nhận callback/webhook từ cổng thanh toán, hệ thống cập nhật trạng thái đơn hàng: Đã thanh toán / Thanh toán thất bại.
- Nếu thanh toán thất bại hoặc đơn hàng "Chờ thanh toán" quá 15 phút, hệ thống tự động hủy đơn và giải phóng tồn kho (release inventory) để bán cho khách khác.
- Luồng trừ kho và luồng tạo đơn hàng phải nằm trong cùng một Database Transaction. Nếu một trong hai bước lỗi, hệ thống phải Rollback toàn bộ.

#### 3.1.5 Đánh giá sản phẩm
- Khách hàng đã mua và nhận hàng thành công có quyền để lại đánh giá cho sản phẩm đã mua.
- Đánh giá bao gồm: số sao (1-5), nội dung bình luận, ảnh thực tế (tùy chọn).
- Hiển thị đánh giá trung bình và danh sách review trên trang chi tiết sản phẩm.

#### 3.1.6 Quản lý đơn hàng cá nhân
- Xem lịch sử đơn hàng đã đặt, trạng thái đơn hàng: Chờ thanh toán → Đã thanh toán → Đang xử lý → Đang giao → Đã giao → Hoàn thành.
- Xem chi tiết từng đơn hàng: danh sách sản phẩm, số lượng, giá, tổng tiền, thông tin giao hàng.
- Hủy đơn hàng (chỉ khi đơn ở trạng thái "Chờ xử lý", chưa đóng gói).

### 3.2 Nhóm chức năng B2B (Đại lý / Khách sỉ)

#### 3.2.1 Đăng ký & Xét duyệt tài khoản doanh nghiệp
- Đối tác/khách sỉ đăng ký tài khoản đại lý qua biểu mẫu riêng biệt: thông tin doanh nghiệp/cửa hàng, mã số thuế (nếu có), tên người đại diện, số điện thoại, email, địa chỉ.
- Tài khoản đại lý ở trạng thái "Chờ duyệt" cho đến khi Admin/Sales xác nhận. Đại lý không thể đăng nhập giao dịch khi chưa được duyệt.
- Sau khi duyệt, hệ thống cấp: tài khoản đăng nhập cổng B2B, hạn mức công nợ (credit limit).
- Admin có thể tạm khóa / ngừng hợp tác với đại lý bất kỳ lúc nào.

#### 3.2.2 Chính sách giá sỉ – Chiết khấu bậc thang
Hệ thống tự động tính giá dựa trên tổng số lượng sản phẩm trong đơn hàng, áp dụng chính sách chiết khấu bậc thang:

*Ví dụ minh họa (có thể cấu hình bởi Admin):*

| Bậc | Số lượng mua | Đơn giá | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Bậc 1** | 1 – 9 bộ | 200.000 đ/bộ | Giá niêm yết (không chiết khấu) |
| **Bậc 2** | 10 – 49 bộ | 150.000 đ/bộ | Giảm 25% |
| **Bậc 3** | 50 – 99 bộ | 120.000 đ/bộ | Giảm 40% |
| **Bậc 4** | ≥ 100 bộ | 100.000 đ/bộ | Giảm 50% |

- Giá hiển thị cho đại lý khi đặt hàng là giá đã áp dụng chiết khấu bậc thang, tự động cập nhật khi đại lý thay đổi số lượng. Khác hoàn toàn với giá hiển thị cho khách B2C.
- Admin có thể tạo nhiều bảng chiết khấu bậc thang khác nhau cho từng danh mục sản phẩm hoặc theo mùa.

#### 3.2.3 Đặt hàng theo Ma trận (Matrix Order Form)
Đây là tính năng cốt lõi dành riêng cho B2B, cho phép đại lý nhập nhanh số lượng đặt hàng của tất cả các biến thể (Size × Màu) trên một bảng duy nhất, thay vì phải thêm từng biến thể vào giỏ hàng.

*Ví dụ minh họa Matrix Order Form cho sản phẩm "Áo Polo ABC Classic":*

| Size \ Màu | Trắng | Đen | Xanh Navy | Xám | Tổng/Size |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S** | 5 | 10 | 0 | 5 | 20 |
| **M** | 10 | 15 | 10 | 10 | 45 |
| **L** | 10 | 20 | 15 | 5 | 50 |
| **XL** | 5 | 10 | 5 | 0 | 20 |
| **Tổng/Màu**| 30 | 55 | 30 | 20 | 135 bộ |

- Đại lý chỉ cần nhập số vào ô tương ứng, hệ thống tự tính tổng và áp dụng giá chiết khấu bậc thang dựa trên tổng số lượng toàn đơn (ví dụ: 135 bộ → Bậc 4: 100.000 đ/bộ).
- Hệ thống kiểm tra tồn kho theo từng SKU (Size × Màu) trước khi xác nhận đặt hàng. Nếu SKU nào hết hàng, hệ thống cảnh báo ngay trên ô tương ứng.

#### 3.2.4 Thanh toán & Ghi nợ đại lý
Đại lý có thể chọn một trong hai hình thức thanh toán cho mỗi đơn hàng:
- **(a) Thanh toán ngay:** Toàn bộ giá trị đơn hàng được thanh toán trực tuyến qua cổng thanh toán hoặc chuyển khoản.
- **(b) Ghi nợ (Credit):** Đặt hàng trước, thanh toán sau. Hệ thống ghi nhận vào sổ công nợ. Đại lý có thể trả trước một phần (ví dụ 30%), phần còn lại ghi nợ.
- Đơn hàng ghi nợ chỉ được xác nhận nếu: Tổng công nợ hiện tại + Giá trị đơn hàng mới ≤ Hạn mức công nợ được cấp.

#### 3.2.5 Quản lý Công nợ
- Hệ thống ghi nhận từng đơn hàng ghi nợ vào bảng công nợ đại lý, kèm hạn thanh toán.
- Đại lý xem được: tổng công nợ hiện tại, hạn mức còn lại, danh sách đơn hàng chưa thanh toán, lịch sử thanh toán.
- Hệ thống tự động gửi email nhắc nợ định kỳ khi công nợ gần đến hạn hoặc quá hạn.
- Admin/Kế toán xác nhận thanh toán công nợ (cập nhật thủ công hoặc đối soát chuyển khoản), cập nhật trạng thái "Đã thanh toán".

#### 3.2.6 Báo cáo doanh số đại lý
- Đại lý xem được báo cáo: số đơn hàng đã đặt, tổng số lượng sản phẩm, doanh số theo tháng, tổng chiết khấu được hưởng.

### 3.3 Nhóm chức năng Quản trị (Admin Dashboard)

#### 3.3.1 Quản lý sản phẩm & Biến thể (Catalog/Inventory)
- Thêm/sửa/xóa/ẩn sản phẩm quần áo. Mỗi sản phẩm bao gồm: tên, mô tả, chất liệu, hình ảnh, danh mục, giá niêm yết, trạng thái (hiển thị/ẩn).
- Quản lý biến thể (Variant): Mỗi sản phẩm có nhiều biến thể theo tổ hợp Size × Màu sắc. Mỗi biến thể tương ứng một SKU riêng.
- Quản lý tồn kho theo từng SKU (Size × Màu). Cập nhật số lượng tồn kho khi nhập hàng mới.
- Hệ thống khóa kho tạm thời (Lock Inventory) cho các SKU đang trong quá trình thanh toán để tránh tranh chấp dữ liệu (Concurrency Control) giữa nhiều khách mua cùng lúc.
- Theo dõi số lượng tồn kho theo thời gian thực, cảnh báo khi sản phẩm sắp hết hàng.

#### 3.3.2 Quản lý đơn hàng (Order Fulfillment)
- Xem, tìm kiếm, lọc toàn bộ đơn hàng B2C và B2B theo trạng thái, thời gian, kênh bán, khách hàng.
- Cập nhật trạng thái đơn hàng theo quy trình: Chờ duyệt → Đang đóng gói → Đã giao cho đơn vị vận chuyển → Đã giao → Hoàn thành.
- Xử lý yêu cầu hủy/hoàn tiền đơn hàng (nếu chính sách cho phép, trước khi đóng gói).
- Xem chi tiết từng đơn hàng: sản phẩm + biến thể, khách hàng/đại lý, trạng thái thanh toán.

#### 3.3.3 Quản lý khuyến mãi (Voucher/Promotion)
- Tạo mã giảm giá (Voucher): theo % hoặc số tiền cố định, giới hạn thời gian áp dụng, giới hạn số lượt sử dụng, giá trị đơn hàng tối thiểu.
- Áp dụng khuyến mãi cho toàn bộ hoặc một số danh mục/sản phẩm nhất định.
- Chỉ áp dụng cho kênh B2C (đại lý B2B đã có chính sách chiết khấu bậc thang riêng).

#### 3.3.4 Quản lý đại lý
- Duyệt/từ chối đăng ký đại lý mới, kèm ghi chú lý do (nếu từ chối).
- Thiết lập/điều chỉnh hạn mức công nợ cho từng đại lý.
- Cấu hình bảng chiết khấu bậc thang áp dụng cho kênh B2B.
- Khóa/mở khóa tài khoản đại lý.

#### 3.3.5 Quản lý công nợ đại lý (dành cho Kế toán)
- Xem tổng hợp công nợ toàn bộ đại lý: tổng nợ, nợ quá hạn, nợ trong hạn.
- Xem chi tiết công nợ từng đại lý: danh sách đơn hàng ghi nợ, hạn thanh toán, trạng thái.
- Xác nhận thanh toán công nợ khi nhận được chuyển khoản, cập nhật trạng thái "Đã thanh toán".

#### 3.3.6 Báo cáo & Thống kê (BI Dashboard)
- Báo cáo doanh thu theo ngày/tuần/tháng, phân tách theo kênh B2C và B2B.
- Báo cáo top sản phẩm bán chạy, sản phẩm tồn kho lâu.
- Báo cáo dự báo mặt hàng sắp hết trong kho (Low Stock Alert).
- Biểu đồ trực quan (dashboard) tổng hợp các chỉ số kinh doanh.
- Báo cáo so sánh doanh thu B2B vs B2C theo thời gian.

#### 3.3.7 Quản trị người dùng & Ma trận Phân quyền (RBAC Matrix)
- Hệ thống cung cấp Ma trận Phân quyền (Permission Matrix) với các quyền chi tiết (View, Create, Update, Delete) cho từng phân hệ (Products, Inventory, Orders, Agents, Debts, Promotions, Reports, Inbox).
- Hỗ trợ cấu hình nhanh cho các Role: Nhân viên Kho (chỉ quản lý kho, đơn hàng), Sales (quản lý đơn hàng, đại lý, khuyến mãi, hỗ trợ khách), Kế toán (quản lý công nợ, xem báo cáo).
- Admin toàn quyền điều chỉnh chi tiết từng quyền hạn của từng nhân viên. Giao diện chặn quyền truy cập (Forbidden 403) hiển thị khi truy cập trái phép.

#### 3.3.8 Hỗ trợ khách hàng (Live Chat / Inbox)
- Tích hợp Widget Chat trực tuyến tại cổng B2C và B2B cho phép khách hàng trò chuyện trực tiếp với nhân viên.
- Admin Inbox: Bảng điều khiển riêng dành cho nhân viên/admin nhận và phản hồi tin nhắn của khách hàng theo thời gian thực.

---

## 4. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

| Mã | Quy tắc | Áp dụng cho |
| :--- | :--- | :--- |
| **BR-01** | Đơn hàng "Chờ thanh toán" quá 15 phút sẽ tự động hủy và giải phóng tồn kho. | B2C, B2B |
| **BR-02** | Luồng trừ kho và tạo đơn hàng phải nằm trong cùng một Database Transaction. Nếu một bước lỗi, hệ thống phải Rollback toàn bộ. | B2C, B2B |
| **BR-03** | Đại lý chỉ được đặt hàng ghi nợ nếu (Công nợ hiện tại + Giá trị đơn hàng) ≤ Hạn mức công nợ được cấp. | B2B |
| **BR-04** | Giá bán cho đại lý được tính theo bảng chiết khấu bậc thang, dựa trên tổng số lượng trong đơn hàng. | B2B |
| **BR-05** | Không cho phép đặt hàng vượt quá số lượng tồn kho còn lại của SKU tương ứng (Size × Màu). | B2C, B2B |
| **BR-06** | Mã giảm giá (Voucher) chỉ áp dụng khi còn trong thời hạn hiệu lực, chưa vượt số lượt sử dụng tối đa, và chỉ áp dụng cho kênh B2C. | B2C |
| **BR-07** | Tài khoản đại lý mới phải ở trạng thái "Chờ duyệt" và không thể đăng nhập giao dịch cho đến khi được Admin duyệt. | B2B |
| **BR-08** | Khách hàng chỉ được đánh giá sản phẩm đã mua và nhận hàng thành công. | B2C |
| **BR-09** | Đơn hàng chỉ được hủy khi ở trạng thái "Chờ xử lý" (chưa đóng gói). | B2C, B2B |
| **BR-10** | Hệ thống tự động gửi email nhắc nợ khi công nợ đại lý gần đến hạn hoặc quá hạn thanh toán. | B2B |

---

## 5. YÊU CẦU PHI CHỨC NĂNG

### 5.1 Hiệu năng (Performance)
- Thời gian tải trang chủ B2C và trang danh sách sản phẩm không quá 2 giây trong điều kiện mạng bình thường, để tránh khách hàng rời bỏ trang web.
- Sử dụng Cache (như Redis) cho các dữ liệu ít thay đổi: danh mục sản phẩm, cấu hình trang web, bảng chiết khấu — để giảm tải cho Database.
- Hệ thống xử lý đồng thời tối thiểu 100 giao dịch đặt hàng/phút ở giai đoạn cao điểm (mục tiêu thiết kế, không bắt buộc kiểm thử tải đầy đủ trong giai đoạn MVP).

### 5.2 Bảo mật (Security)
- Mật khẩu người dùng được mã hóa (hashing) trước khi lưu trữ (sử dụng bcrypt hoặc tương đương).
- Phân quyền truy cập API theo vai trò (RBAC): đảm bảo khách lẻ B2C không thể truy cập cổng xem giá sỉ B2B, nhân viên kho không thể can thiệp module kế toán/công nợ.
- Giao dịch thanh toán tuân thủ cơ chế callback/webhook có xác thực chữ ký (checksum) từ cổng thanh toán.
- Toàn bộ kết nối sử dụng HTTPS.

### 5.3 Tính toàn vẹn dữ liệu (Data Consistency)
- Luồng trừ kho và tạo đơn hàng phải nằm trong cùng một Database Transaction. Nếu một trong hai bước lỗi, hệ thống phải Rollback lại toàn bộ (tránh: khách bị trừ tiền nhưng kho không trừ, đơn không tạo).
- Dữ liệu tồn kho phải nhất quán giữa các kênh bán (B2C và B2B) khi có giao dịch phát sinh.

### 5.4 Khả năng mở rộng (Scalability)
- Kiến trúc cho phép bổ sung thêm kênh bán (Mobile App, Kiosk tại cửa hàng) thông qua API dùng chung.
- Thiết kế dữ liệu cho phép mở rộng đa cấp đại lý trong tương lai mà không cần thay đổi cấu trúc lớn.

### 5.5 Khả năng sử dụng (Usability)
- Giao diện B2C responsive, tối ưu cho thiết bị di động (mobile-first), trải nghiệm mua sắm thân thiện.
- Quy trình đặt hàng B2C không quá 4 bước thao tác chính.
- Giao diện B2B (Matrix Order Form) tối ưu cho việc nhập liệu nhanh số lượng lớn trên desktop.

### 5.6 Độ tin cậy & Sẵn sàng (Reliability)
- Dữ liệu giao dịch (đơn hàng, thanh toán, công nợ) phải được lưu trữ nhất quán, không thất thoát khi xảy ra lỗi trong quá trình thanh toán.
- Không có đơn hàng "treo" không xác định trạng thái.

---

## 6. MÔ HÌNH DỮ LIỆU (DATA REQUIREMENTS)

### 6.1 Danh sách thực thể chính

| Thực thể | Mô tả |
| :--- | :--- |
| **users** | Tài khoản người dùng (khách hàng B2C, nhân viên, admin), lưu trữ quyền hạn (permissions) dưới dạng JSON. |
| **chat_messages** | Lưu trữ nội dung tin nhắn giữa khách hàng và bộ phận hỗ trợ (Live Chat). |
| **agents** | Thông tin đại lý/khách sỉ: mức chiết khấu, hạn mức công nợ, trạng thái duyệt. |
| **categories** | Danh mục sản phẩm (Áo, Quần, Đầm/Váy, Phụ kiện...). |
| **products** | Sản phẩm quần áo: tên, mô tả, chất liệu, hình ảnh, giá niêm yết. |
| **product_variants** | Biến thể sản phẩm theo tổ hợp Size × Màu sắc, mỗi biến thể là một SKU. |
| **inventory** | Tồn kho theo từng SKU (product_variant_id), bao gồm số lượng available và locked. |
| **promotions** | Mã giảm giá (Voucher) và điều kiện áp dụng cho kênh B2C. |
| **pricing_tiers** | Bảng chiết khấu bậc thang cho kênh B2B (bậc, khoảng số lượng, giá/chiết khấu). |
| **orders** | Đơn hàng (B2C và B2B), trạng thái đơn hàng, trạng thái thanh toán. |
| **order_items** | Chi tiết từng sản phẩm/biến thể trong đơn hàng, số lượng, đơn giá. |
| **payments** | Giao dịch thanh toán liên kết với đơn hàng. |
| **agent_debts** | Công nợ phát sinh từ đơn hàng ghi nợ của đại lý. |
| **reviews** | Đánh giá sản phẩm của khách hàng B2C (sao, bình luận, hình ảnh). |

### 6.2 Từ điển dữ liệu (Data Dictionary) — các bảng chính

**Bảng: products**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính |
| category_id | UUID (FK) | Liên kết đến danh mục sản phẩm |
| name | String | Tên sản phẩm |
| description | Text | Mô tả chi tiết sản phẩm |
| material | String | Chất liệu vải |
| base_price | Decimal | Giá niêm yết (giá bán lẻ B2C) |
| images | JSON/Array | Danh sách đường dẫn hình ảnh sản phẩm |
| status | Enum | Active / Hidden / Discontinued |
| created_at | Datetime | Thời điểm tạo |

**Bảng: product_variants**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính (= SKU ID) |
| product_id | UUID (FK) | Liên kết đến sản phẩm gốc |
| size | String | Size: S, M, L, XL, XXL... |
| color | String | Màu sắc: Trắng, Đen, Xanh Navy... |
| sku_code | String | Mã SKU duy nhất (ví dụ: ABC-POLO-WH-M) |
| stock_quantity | Integer | Số lượng tồn kho khả dụng |
| locked_quantity | Integer | Số lượng đang bị khóa tạm (đang trong quá trình thanh toán) |

**Bảng: orders**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính |
| user_id / agent_id | UUID (FK) | Người mua (khách B2C) hoặc đại lý B2B |
| order_type | Enum | B2C hoặc B2B |
| status | Enum | Chờ thanh toán / Đã thanh toán / Đang xử lý / Đang đóng gói / Đã giao ĐVVC / Đã giao / Hoàn thành / Đã hủy |
| payment_method | Enum | VNPay / Momo / COD / Ghi nợ (chỉ B2B) |
| subtotal | Decimal | Tổng giá trị trước giảm giá |
| discount_amount | Decimal | Số tiền giảm giá (Voucher hoặc chiết khấu bậc thang) |
| total_amount | Decimal | Tổng giá trị đơn hàng sau giảm giá |
| shipping_address | Text | Địa chỉ giao hàng |
| note | Text | Ghi chú đơn hàng |
| created_at | Datetime | Thời điểm tạo đơn |

**Bảng: agent_debts**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính |
| agent_id | UUID (FK) | Đại lý liên quan |
| order_id | UUID (FK) | Đơn hàng ghi nợ tương ứng |
| amount | Decimal | Số tiền công nợ |
| paid_amount | Decimal | Số tiền đã trả trước (nếu có) |
| due_date | Date | Hạn thanh toán |
| paid_status | Enum | Chưa thanh toán / Thanh toán một phần / Đã thanh toán |
| paid_at | Datetime | Thời điểm thanh toán hoàn tất (nếu có) |

**Bảng: chat_messages**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính |
| sender_id | UUID (FK) | Người gửi (Khách hoặc Nhân viên) |
| receiver_id | UUID (FK) | Người nhận (Admin hoặc Khách) |
| content | Text | Nội dung tin nhắn |
| timestamp | Datetime | Thời gian gửi |

**Bảng: reviews**
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| id | UUID | Khóa chính |
| user_id | UUID (FK) | Khách hàng đánh giá |
| product_id | UUID (FK) | Sản phẩm được đánh giá |
| order_id | UUID (FK) | Đơn hàng liên quan (chứng minh đã mua) |
| rating | Integer | Số sao (1-5) |
| comment | Text | Nội dung bình luận |
| images | JSON/Array | Ảnh thực tế kèm theo (tùy chọn) |
| created_at | Datetime | Thời điểm đánh giá |

---

## 7. DANH SÁCH USE CASE TỔNG HỢP

| Mã | Tên Use Case | Actor | Mô tả ngắn |
| :--- | :--- | :--- | :--- |
| **UC-01** | Đăng ký / Đăng nhập | Khách hàng B2C | Tạo tài khoản hoặc đăng nhập hệ thống |
| **UC-02** | Xem danh sách & chi tiết sản phẩm | Khách hàng B2C | Tra cứu, lọc, xem thông tin quần áo |
| **UC-03** | Thêm giỏ hàng & Đặt hàng | Khách hàng B2C | Chọn sản phẩm (Size/Màu), thanh toán |
| **UC-04** | Thanh toán trực tuyến | Khách hàng B2C | Thanh toán qua VNPay/Momo hoặc COD |
| **UC-05** | Đánh giá sản phẩm | Khách hàng B2C | Để lại đánh giá sao, bình luận, ảnh |
| **UC-06** | Áp dụng Voucher giảm giá | Khách hàng B2C | Nhập mã giảm giá khi thanh toán |
| **UC-07** | Đăng ký tài khoản đại lý | Đại lý B2B | Gửi hồ sơ đăng ký đối tác phân phối |
| **UC-08** | Đặt hàng sỉ (Matrix Order) | Đại lý B2B | Nhập nhanh số lượng theo bảng Size × Màu |
| **UC-09** | Thanh toán / Ghi nợ đại lý | Đại lý B2B | Thanh toán ngay hoặc ghi nợ trong hạn mức |
| **UC-10** | Xem công nợ đại lý | Đại lý B2B | Theo dõi công nợ, hạn mức còn lại |
| **UC-11** | Duyệt đại lý mới | Admin / Sales | Xét duyệt hồ sơ đăng ký đại lý |
| **UC-12** | Quản lý sản phẩm & tồn kho | Admin | CRUD sản phẩm, biến thể, tồn kho theo SKU |
| **UC-13** | Quản lý đơn hàng | Admin / Sales / Kho | Xem, xử lý đơn hàng B2C/B2B |
| **UC-14** | Quản lý khuyến mãi | Admin | Tạo và quản lý mã giảm giá Voucher |
| **UC-15** | Xác nhận thanh toán công nợ | Kế toán | Xác nhận đại lý đã thanh toán nợ |
| **UC-16** | Xem báo cáo BI | Admin | Xem dashboard doanh thu B2C/B2B, tồn kho |
| **UC-17** | Phân quyền người dùng | Admin | Quản lý tài khoản nội bộ, phân quyền RBAC |

---

## 8. YÊU CẦU GIAO DIỆN (TÓM TẮT)
- **Giao diện B2C (Cổng Bán lẻ):** Thiết kế thân thiện, hiện đại, responsive (mobile-first); ưu tiên hình ảnh sản phẩm chất lượng cao, quy trình đặt hàng tối giản, tích hợp mã giảm giá và hiển thị đánh giá sản phẩm. Trải nghiệm mua sắm phải đẹp, chuyên nghiệp, tạo cảm giác tin cậy.
- **Giao diện B2B (Cổng Đại lý):** Tập trung vào chức năng nghiệp vụ, Matrix Order Form nhập liệu nhanh dạng bảng Size × Màu, hiển thị giá chiết khấu bậc thang rõ ràng, dashboard công nợ và doanh số.
- **Giao diện Admin Dashboard:** Dạng dashboard quản trị, có biểu đồ trực quan (doanh thu, tồn kho), bảng dữ liệu có tìm kiếm/lọc/phân trang, giao diện quản lý sản phẩm + biến thể trực quan.

---

## 9. TIÊU CHÍ NGHIỆM THU TỔNG QUÁT
1. Khách hàng B2C có thể hoàn tất một giao dịch đặt hàng từ đầu đến cuối (chọn sản phẩm + Size/Màu → giỏ hàng → thanh toán → nhận xác nhận) mà không gặp lỗi.
2. Đại lý đã được duyệt có thể đặt hàng sỉ qua Matrix Order Form, hệ thống áp dụng đúng giá chiết khấu bậc thang và kiểm tra đúng hạn mức công nợ.
3. Admin có thể xem báo cáo doanh thu tổng hợp, phân tách đúng theo kênh B2C/B2B.
4. Tồn kho sản phẩm (theo SKU: Size × Màu) được cập nhật chính xác, nhất quán giữa các kênh bán khi có giao dịch phát sinh.
5. Hệ thống khóa kho tạm thời (Lock Inventory) hoạt động đúng, tránh tranh chấp dữ liệu khi nhiều khách mua cùng lúc.
6. Luồng trừ kho + tạo đơn hàng nằm trong cùng một Transaction; nếu lỗi giữa chừng, hệ thống Rollback toàn bộ.
7. Toàn bộ giao dịch thanh toán được ghi nhận đầy đủ trạng thái, không có đơn hàng "treo" không xác định trạng thái.
8. Phân quyền RBAC hoạt động đúng: khách B2C không thấy giá sỉ, nhân viên kho không truy cập được module công nợ.

---

## 10. PHỤ LỤC

### 10.1 Kiến nghị công nghệ (Tech Stack)
Để triển khai bản SRS này một cách chuẩn chuyên môn, dưới đây là Stack công nghệ được đề xuất:
- **Backend:** Java Spring Boot (Spring Security để phân quyền RBAC, Spring Data JPA để xử lý dữ liệu).
- **Database:** MySQL hoặc PostgreSQL (xử lý các mối quan hệ thực thể chặt chẽ) kết hợp với Redis làm Cache.
- **Frontend:** ReactJS hoặc Next.js — Dùng TailwindCSS để build giao diện responsive cho B2C, và dùng các thư viện UI như Ant Design/Shadcn để làm bảng biểu Dashboard phức tạp cho B2B/Admin.

### 10.2 Hướng phát triển mở rộng (ngoài phạm vi giai đoạn 1)
- Phân hạng đại lý nhiều cấp (Vàng/Bạc/Đồng) với chính sách chiết khấu khác nhau.
- Chương trình tích điểm thành viên (Loyalty) cho khách hàng B2C.
- Tích hợp CMS quản lý nội dung trang chủ, bài viết, lookbook thời trang.
- Xuất báo cáo đối soát công nợ định dạng Excel/PDF tự động.
- Tích hợp hệ thống vận chuyển (GHN, GHTK, Viettel Post) để tracking đơn hàng.
- Ứng dụng di động (Mobile App) bán hàng B2C.
- Hệ thống POS (Point of Sale) bán hàng tại cửa hàng vật lý, đồng bộ tồn kho.

### 10.3 Lịch sử thay đổi tài liệu
| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
| :--- | :--- | :--- | :--- |
| **1.0** | 08/07/2026 | Nhóm phát triển | Khởi tạo tài liệu SRS đầy đủ nghiệp vụ B2C/B2B cho hệ thống thời trang ABC |
