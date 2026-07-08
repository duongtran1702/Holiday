# ABC Fashion System — Nhật ký phát triển (Changelog)

> **Stack:** React 18 · TypeScript · Tailwind CSS · lucide-react · Recharts  
> **Aesthetic:** Playfair Display (display serif) · DM Sans (body) · DM Mono (mono)  
> **Màu chủ đạo:** Kem `#FAF8F4` · Charcoal `#1C1917` · Vàng đồng `#C9973A`

---

## v1.1 — Nâng cấp Phân quyền (RBAC) & Live Chat Hỗ trợ

### Admin / Staff
- **Hệ thống Ma trận Phân quyền (RBAC Matrix):** Thêm tính năng cấu hình quyền chi tiết (View, Create, Update, Delete) cho từng phân hệ (Products, Inventory, Orders, Agents, Debts, Promotions, Reports, Inbox).
- **Staff Presets:** Hỗ trợ cấu hình nhanh cho các vai trò Nhân viên Kho, Kế toán, và Sales.
- **AdminInbox:** Bảng điều khiển riêng dành cho nhân viên/admin nhận và phản hồi tin nhắn của khách hàng theo thời gian thực.
- **Forbidden403:** Giao diện chặn truy cập trái phép khi nhân viên không có đủ quyền.

### B2C & B2B
- **Live Chat (ChatWidget):** Tích hợp công cụ trò chuyện trực tiếp để khách hàng/đại lý có thể liên hệ với bộ phận CSKH ngay trên hệ thống.

---

## v1.0 — Nền tảng hệ thống 3 cổng

### Kiến trúc tổng thể
- 3 portal tách biệt: **B2C** (bán lẻ), **B2B** (đại lý), **Admin** (quản trị)
- Thanh `PortalSwitcher` cố định trên cùng để chuyển giữa 3 cổng (demo navigator — đã bỏ ở v4.0)
- Thiết lập design tokens trong `theme.css` và Google Fonts trong `fonts.css`

### B2C — Cửa hàng bán lẻ

**Header:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Logo "ABC Fashion" | Không có action (demo) |
| Tab danh mục (Áo, Quần…) | Lọc `PRODUCTS` theo `category`, cập nhật grid tức thì |
| Thanh tìm kiếm | Filter sản phẩm theo `name.toLowerCase().includes(query)` |
| Icon giỏ hàng | Mở `CartDrawer` từ phải vào; badge đỏ hiển thị tổng số lượng |
| Avatar (UserMenu) | Dropdown: Thông tin tài khoản → mở `ProfileModal` tab "Thông tin" · Đổi mật khẩu → mở `ProfileModal` tab "Đổi mật khẩu" · Đăng xuất → `onLogout()` về Login |

**ProductCard:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Chấm màu sắc | Cập nhật `sel.color`, re-check tồn kho ô `{size}-{color}` ngay lập tức |
| Nút size (S/M/L…) | Cập nhật `sel.size`, re-check tồn kho |
| Hiển thị "Còn N" / "Hết" | Đọc từ `product.stock["{size}-{color}"]`, tự động disable nút Thêm nếu stock = 0 |
| Nút "Thêm" | Nếu đã có item cùng productId+size+color trong cart → tăng qty +1, nếu chưa → push item mới. Tự động mở CartDrawer |
| Overlay "Hết hàng" | Hiển thị khi tất cả stock của size+màu đang chọn = 0 |

**CartDrawer:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Nút `−` | Giảm qty item xuống 1, tối thiểu là 1 (không về 0) |
| Nút `+` | Tăng qty item lên 1 (không check stock ở bước này) |
| Nút `×` (xóa item) | Xóa item khỏi cart array bằng index |
| Input voucher + "Dùng" | So sánh `voucher.toUpperCase() === "ABC10"`, nếu đúng → giảm 10% subtotal. Chỉ 1 voucher hợp lệ trong demo |
| "Tổng" | Tính `subtotal - discount`, hiển thị bằng `fmt()` |
| Nút "Thanh toán" | (UI only — demo, chưa kết nối payment gateway) |
| "Tiếp tục mua sắm" | Đóng CartDrawer (`onClose()`) |

**ProfileModal:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Icon Camera | Trigger `<input type="file" accept="image/*">` ẩn, tạo preview bằng `URL.createObjectURL(file)` |
| "Lưu thông tin" | setState cục bộ, hiển thị trạng thái "✓ Đã lưu" trong 2 giây (demo — không POST lên server) |
| Tab "Đổi mật khẩu" → "Đổi mật khẩu" | Disabled khi: current rỗng, new rỗng, hoặc new ≠ confirm. Validate độ dài ≥ 8 ký tự |

**Hero banner:**
| Nút | Nghiệp vụ |
|---|---|
| "Mua sắm ngay" | Scroll xuống grid sản phẩm (UI only demo) |

**Dropdown sort:**
| Option | Nghiệp vụ |
|---|---|
| Mới nhất | Giữ thứ tự mặc định của array `PRODUCTS` |
| Giá tăng | `sort((a,b) => a.price - b.price)` |
| Giá giảm | `sort((a,b) => b.price - a.price)` |
| Đánh giá | `sort((a,b) => b.rating - a.rating)` |

---

### B2B — Cổng đại lý

**B2BOrderTab — Bảng Matrix:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Click sản phẩm (sidebar trái) | Đổi `selectedProduct`, reset `matrixQty = {}` để tránh nhầm qty |
| Ô input số lượng (mỗi cell Size×Màu) | `onChange` cập nhật `matrixQty["{size}-{color}"]`, tính lại `totalQty` ngay |
| Màu đỏ ô input | Khi qty nhập > stock tồn kho của ô đó |
| Màu accent ô input | Khi qty > 0 và hợp lệ |
| "Xóa tất cả" | Reset `matrixQty = {}` |
| Hàng "Tổng/Màu" | Tính `colorTotal(c)` = tổng qty tất cả size của màu đó |
| Cột "Tổng" (mỗi size) | Tính `sizeTotal(s)` = tổng qty tất cả màu của size đó |
| Ô Grand Total (góc phải dưới) | Tổng toàn bộ `matrixQty` |
| `TierProgress` | Highlight bậc đang active theo `totalQty`. Hiển thị gợi ý "Thêm N bộ để đạt bậc tiếp theo" |
| Radio "Thanh toán ngay" / "Ghi nợ" | Chọn phương thức, "Ghi nợ" hiển thị hạn mức còn lại |
| Nút "Đặt N bộ" | Disabled khi `totalQty === 0`. Khi active: hiển thị số lượng tổng (UI only) |

**B2BDebtTab:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "Xuất Excel" | (UI only — download file trong production) |

---

### Admin Dashboard

**AdminOverview:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "Xem tất cả" (đơn hàng) | Chuyển sang tab "Đơn hàng" (UI only demo) |
| Icon Eye (mỗi đơn) | Xem chi tiết đơn hàng (UI only) |

**AdminOrders:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Filter tab trạng thái | Lọc `ORDERS_DATA` theo `status === filter`, "Tất cả" trả về full list |
| Thanh tìm kiếm | (UI only — chưa wire filter) |
| Icon Eye | Xem chi tiết đơn (UI only) |
| Icon Edit | Chỉnh sửa đơn (UI only) |

**AdminProducts:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "+ Thêm sản phẩm" | (UI only) |
| Icon Edit | Chỉnh sửa sản phẩm (UI only) |
| Icon Trash | Xóa sản phẩm (UI only) |

**AdminAgents:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Nút "Duyệt" | Chỉ hiển thị với đại lý có `status === "Chờ duyệt"`. Phê duyệt đại lý (UI only) |
| Icon Edit | Chỉnh sửa thông tin đại lý (UI only) |
| Thanh progress hạn mức | `(used/credit) * 100%`, đổi màu: xanh < 70% · vàng 70-99% · đỏ ≥ 100% |

**AdminPromotions:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "+ Tạo voucher" | (UI only) |
| Icon Edit | Chỉnh sửa voucher (UI only) |
| Icon Trash | Xóa voucher (UI only) |
| Progress bar mỗi voucher | `(used/total) * 100%` — theo dõi lượt dùng |

---

## v2.0 — Cải thiện UI/UX

### Giỏ hàng B2C — Compact
- Thu nhỏ từ `w-96` → `w-72`, compact padding và font
- Voucher "ABC10" → giảm 10% (nghiệp vụ không đổi)

### B2B Portal — Thiết kế lại
- Sidebar sản phẩm: click đổi SP reset matrix ngay
- `TierProgress` dạng bar ngang, ô active highlight vàng đồng
- Gợi ý động "Thêm N bộ để đạt bậc tiếp theo" theo `totalQty`

### Avatar & Profile — Bổ sung nghiệp vụ
- `UserMenu` dropdown: click outside tự đóng (useRef + useEffect event listener)
- Avatar upload: `URL.createObjectURL` tạo preview local không cần upload server
- Đổi mật khẩu: nút disabled khi chưa đủ điều kiện, trạng thái "✓ Đã lưu" 2 giây

---

## v3.0 — Xác thực & Phân quyền RBAC

### Login Page

**Tab Khách hàng / Đại lý:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "Đăng nhập" | Delay 800ms giả lập API. Routing: `b2b@abc.vn/123456` → agent, `agent@abc.vn/123456` → thông báo chờ duyệt (màu hổ phách), bất kỳ email khác → customer |
| "Đăng nhập với Google" | (UI only — Social Login) |
| "Đăng ký ngay" | Chuyển sang màn Register |

**Tab Nội bộ (Admin/Staff) — Bước 1 Credentials:**
| Nút / Element | Nghiệp vụ |
|---|---|
| "Tiếp tục" | So sánh password với `"admin123"`. Sai → tăng `failCount`, hiển thị "Còn N lần thử". Đúng → chuyển sang bước OTP |
| Thanh progress 5 ô đỏ | Mỗi lần sai tô đỏ thêm 1 ô. Đầy 5 → chuyển màn Locked |

**Tab Nội bộ — Bước 2 OTP:**
| Nút / Element | Nghiệp vụ |
|---|---|
| 6 ô OTP input | Focus tự động sang ô kế tiếp khi nhập xong. Backspace khi ô rỗng → focus lùi ô trước |
| "Xác thực & Đăng nhập" | Disabled khi chưa đủ 6 chữ số. `"123456"` → role Admin, `"000000"` → role Staff |
| "Gửi lại mã OTP" | Visible sau khi countdown 60s hết. Reset countdown |
| "Quay lại" | Về bước nhập credentials, giữ nguyên email đã nhập |

**Tab Nội bộ — Màn khóa tài khoản:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Đếm ngược mm:ss | `setInterval` đếm từ 1800s (30 phút) xuống 0 |
| "Liên hệ Admin để mở khóa" | Reset `failCount = 0`, về bước credentials (demo — production gửi email) |

### Register Page

**Chọn loại tài khoản:**
| Nút | Nghiệp vụ |
|---|---|
| Card "Khách hàng cá nhân" | Set `tab = "b2c"`, reset form và bước |
| Card "Đối tác / Đại lý" | Set `tab = "b2b"`, hiển thị form mở rộng với cảnh báo xét duyệt |

**B2C — Bước 1 Form:**
| Nút | Nghiệp vụ |
|---|---|
| "Đăng ký & Nhận mã xác thực" | Validate: tất cả trường bắt buộc, pw ≥ 8 ký tự, pw === confirm. Nếu lỗi → hiển thị thông báo đỏ. Nếu hợp lệ → chuyển sang bước OTP |

**B2C — Bước 2 OTP:**
| Nút | Nghiệp vụ |
|---|---|
| "Xác thực & Hoàn tất" | Disabled khi chưa đủ 6 số. Nhập xong → chuyển màn thành công |

**B2B Form:**
| Nút | Nghiệp vụ |
|---|---|
| "Gửi hồ sơ đăng kí" | Validate: tất cả trường bắt buộc (trừ MST). Lỗi → thông báo đỏ. Hợp lệ → màn "Chờ duyệt" với timeline 4 bước |

### AdminUsers — Dynamic RBAC

**Bảng nhân viên:**
| Nút | Nghiệp vụ |
|---|---|
| "+ Thêm nhân viên" | Toggle form inline phía trên bảng |
| "Phân quyền" (mỗi NV) | Mở `StaffPermModal` với permissions hiện tại của nhân viên đó |
| "Khóa" / "Mở" | Toggle `status` giữa `"Hoạt động"` ↔ `"Tạm khóa"`, cập nhật lại badge màu |

**StaffPermModal — Tab Bảng phân quyền:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Preset "Sales" / "Kế toán" / "Nhân viên Kho" | `setPerms(deepCopy(STAFF_PRESETS[preset]))` — ghi đè toàn bộ permissions hiện tại |
| "Xóa tất cả quyền" | `setPerms(defaultPerms())` — tắt tất cả checkbox |
| Checkbox từng ô (View/Create/Update/Delete) | Toggle boolean `perms[module][action]` |
| Checkbox cột "Tất cả" (cuối hàng) | Nếu chưa đủ → bật tất cả action của module đó; Nếu đã đủ → tắt tất cả |
| "—" (Không áp dụng) | Hiển thị khi action không thuộc module (ví dụ: Báo cáo không có Create/Update/Delete) |
| "Lưu phân quyền" | `onSave(id, perms, meta)` → cập nhật state `staff[]`. Hiển thị "✓ Đã lưu" 1.2 giây rồi đóng modal |
| "Hủy" | Đóng modal, không lưu |

**Form thêm nhân viên:**
| Nút | Nghiệp vụ |
|---|---|
| "Tạo & Cài đặt quyền sau" | Validate name + email bắt buộc. Tạo `StaffMember` mới với `permissions = defaultPerms()` (tất cả checkbox tắt), thêm vào mảng `staff`. Nhân viên mới cần mở "Phân quyền" để cấp thêm |
| "Hủy" | Đóng form inline, xóa dữ liệu đang nhập |

---

## v4.0 — Tách biệt hoàn toàn theo Role

### Thay đổi routing
- Xóa `PortalSwitcher` — không còn chuyển cổng tự do
- `handleLogin(role)` → render đúng component theo role
- `onLogout()` → clear `userRole`, về `LoginPage`

**AdminSidebar — Dynamic navigation:**
| Element | Nghiệp vụ |
|---|---|
| Item nav có badge đỏ (Inbox) | Số tin chưa đọc tổng hợp |
| Item nav bị ẩn (Staff) | Các tab mà `staffPerms[permKey].view === false` bị filter khỏi mảng nav trước khi render |
| Khu "Nội bộ" + "NV & Phân quyền" | Chỉ render khi `userRole === "admin"` |
| Avatar footer | Admin → "Nguyễn Hữu Đức · Quản trị viên"; Staff → tên DEMO_STAFF_ACCOUNT |

**Màn 403 Forbidden:**
- Trigger khi `canAccess(tab) === false` — tức `staffPerms[TAB_PERM[tab]]?.view !== true`
- Hiển thị thông báo "audit log đã ghi lại" để nhắc nhở (không phải thật trong demo)

---

## v5.0 — Lịch sử đơn hàng B2B

### B2BHistoryTab

**Filter trạng thái:**
| Nút | Nghiệp vụ |
|---|---|
| Tab "Tất cả" | Hiển thị `AGENT_ORDERS` đầy đủ |
| Tab trạng thái cụ thể | Filter `orders.filter(o => o.status === filter)` |

**Accordion đơn hàng:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Click hàng đơn | Toggle `expanded`: nếu đang mở → đóng; nếu đóng → mở (và đóng cái trước). `ChevronRight` xoay 90° |
| Badge "Đơn:" | Trạng thái vận chuyển: Đang xử lý / Đã giao / Hoàn thành / Đã hủy |
| Badge "Tiền:" | Trạng thái thanh toán: Chưa TT / Thanh toán một phần / Đã TT. Tách riêng vì đơn B2B mua chịu có thể "Đã giao" nhưng "Chưa thanh toán" |
| "Yêu cầu hủy đơn" | Chỉ hiện với `status === "Đang xử lý"`. (UI only) |
| "Tải phiếu đặt hàng" | (UI only — download PDF trong production) |
| "Xuất Excel" | (UI only) |
| Ô size (M×20) | Hiển thị phân bổ số lượng đặt theo từng size, đọc từ `item.sizes` object |

---

## v6.0 — Live Chat & Admin Inbox

### ChatWidget (B2C + B2B, góc phải màn hình)

**Bong bóng nổi:**
| Element | Nghiệp vụ |
|---|---|
| Nút bong bóng (đóng) | Mở chat window, reset `unread = 0` |
| Nút bong bóng (mở) | Đóng chat window |
| Badge đỏ số | Đếm tin nhắn chưa đọc (reset về 0 khi mở chat) |

**Guest form (chưa đăng nhập):**
| Nút | Nghiệp vụ |
|---|---|
| "Bắt đầu chat" | Disabled khi name hoặc phone rỗng. Khi nhấn: `setGuestReady(true)` → trigger `useEffect` khởi tạo tin nhắn chào |

**Khung chat (đã xác nhận danh tính):**
| Nút / Element | Nghiệp vụ |
|---|---|
| Nút FAQ (📏 Bảng size…) | Gửi 2 message liên tiếp: user message = label của FAQ, bot message = answer tương ứng. Sau khi dùng 1 FAQ → ẩn toàn bộ FAQ buttons (`setFaqSent(true)`) |
| Nút `Paperclip` | Trigger `<input type="file" accept="image/*">` ẩn |
| Input text | `onKeyDown Enter (không Shift)` → `sendMsg()` |
| Nút Send | Disabled khi input rỗng. Gửi user message, sau 1500ms tự động thêm staff reply giả lập |
| Bot chào mừng | `useEffect` chạy khi `open === true && messages.length === 0 && guestReady`. Kiểm tra giờ hiện tại: ≥22h hoặc <7h → tin nhắn ngoài giờ; còn lại → tin chào theo tên |
| Nút `×` header | `setOpen(false)` đóng chat window, không reset lịch sử |

### AdminInbox

**Danh sách hội thoại (cột trái):**
| Element | Nghiệp vụ |
|---|---|
| Click vào hội thoại | `setActiveId(id)`, `setUnread(0)` cho hội thoại đó |
| Border trái accent | Highlight hội thoại đang chọn |
| Badge phân loại màu | Guest=xám / Customer=xanh dương / Agent=tím — giúp nhân viên nhận ra ngay đối tượng |
| Badge số đỏ (chưa đọc) | Đếm `convo.unread`, reset về 0 khi click vào hội thoại |

**Chat header (cột phải):**
| Nút | Nghiệp vụ |
|---|---|
| "Gắn thẻ" dropdown | Mở list TAGS. Click tag → `setConvos(...)` cập nhật `tag` của hội thoại đang chọn, đóng dropdown |
| "Chuyển Admin" | (UI only — production: tạo notification cho Admin, chuyển ownership hội thoại) |
| Toggle "Tôi: Phải" / "Tôi: Trái" | Đổi `layout` state: `"standard"` = nhân viên bên phải (mặc định kiểu Zalo) / `"reversed"` = nhân viên bên trái. Icon mũi tên xoay 180° theo trạng thái |

**Logic vị trí bubble theo layout:**
```
staffOnRight = (layout === "standard")

msg.from === "staff" hoặc "bot":
  isMyMsg = true
  bubbleRight = staffOnRight   → phải khi standard, trái khi reversed

msg.from === "user":
  isMyMsg = false
  bubbleRight = !staffOnRight  → trái khi standard, phải khi reversed
```

**Bubble màu sắc:**
| Từ ai | Màu bubble |
|---|---|
| `user` (khách) | Muted (xám nhạt) — trung tính |
| `bot` | Card + border — phân biệt với nhân viên |
| `staff` (nhân viên) | Accent (vàng đồng) — làm nổi bật câu trả lời của nhân viên |

**Ô trả lời:**
| Nút / Element | Nghiệp vụ |
|---|---|
| Textarea | `Enter` = gửi reply · `Shift+Enter` = xuống dòng |
| Nút Send | Disabled khi `reply.trim()` rỗng. Gửi: thêm `{from:"staff"}` message vào `active.messages`, cập nhật `lastMsg` và `lastTime` của hội thoại trong danh sách |
| Nút Paperclip | Đính kèm hình ảnh (UI only) |

**Phân quyền Inbox theo RBAC:**
| Role / Staff | Truy cập Inbox |
|---|---|
| Admin | ✅ Toàn quyền, thấy tất cả hội thoại |
| Staff Sales | ✅ Có `inbox.view = true` trong preset Sales |
| Staff Kho | ❌ Không có quyền → tab ẩn trong sidebar, 403 nếu cố truy cập |
| Staff Kế toán | ❌ Không có quyền |

---

## Tổng kết kiến trúc hiện tại

```
App
├── LoginPage          (2 tab: User Portal / Admin Portal + 2FA)
├── RegisterPage       (2 tab: B2C / B2B + pending flow)
└── [Sau đăng nhập]
    ├── B2CPortal      (Customer)
    │   └── ChatWidget (floating, góc phải — loggedIn: customer)
    ├── B2BPortal      (Agent)
    │   ├── Tab: Đặt hàng Matrix
    │   ├── Tab: Công nợ
    │   ├── Tab: Lịch sử đơn
    │   └── ChatWidget (floating, góc phải — loggedIn: agent)
    └── AdminDashboard (Admin | Staff)
        ├── Tổng quan        (reports.view)
        ├── Đơn hàng         (orders.view)
        ├── Sản phẩm & Kho  (products.view)
        ├── Quản lý Đại lý  (agents.view)
        ├── Khuyến mãi       (promotions.view)
        ├── Hỗ trợ KH        (inbox.view)
        └── NV & Phân quyền  ← Admin only, không bao giờ hiện với Staff
```

### Demo accounts nhanh

| Thông tin đăng nhập | Role | Màn hình nhận |
|---|---|---|
| Bất kỳ email + pass | Customer | B2C |
| `b2b@abc.vn` / `123456` | Agent đã duyệt | B2B |
| `agent@abc.vn` / `123456` | Agent chờ duyệt | Bị chặn (thông báo hổ phách) |
| `admin@abc.vn` / `admin123` → OTP `123456` | Admin | Full dashboard |
| `admin@abc.vn` / `admin123` → OTP `000000` | Staff (Sales preset) | Dashboard giới hạn (Orders + Agents + Promotions + Inbox) |

---

*Cập nhật lần cuối: 08/07/2026 — v6.1 (Chat layout toggle)*
