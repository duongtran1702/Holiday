import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load('Template-Technical.repaired.xlsx'));
const price = wb.worksheets.getItem('2. Price');
const plan = wb.worksheets.getItem('3. Master Plan');
const people = wb.worksheets.getItem('4. Nhân sự dự án');
const tracking = wb.worksheets.getItem('7. Cập nhật tiến độ');

function set(sheet, cell, value) { sheet.getRange(cell).values = [[value]]; }
function setRow(sheet, row, vals) { sheet.getRange(`A${row}:F${row}`).values = [vals]; }
function task(row, id, name, note, days, effort, comment='') { setRow(price,row,[id,name,note,days,effort,comment]); }

// 2. Price - effort baseline. Values are estimates and are intentionally editable.
set(price,'B1','DỰ ÁN HOLIDAY FASHION');
set(price,'B4','Công ty: Atmin Company');
set(price,'B5','Dự án: HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ B2C/B2B');
set(price,'E5','Từ ngày: 07/07/2026');
set(price,'B6','Khách hàng: ATMIN');
set(price,'E6','Đến ngày: 01/08/2026');
task(12,1,'Lập kế hoạch dự án','Lập kế hoạch, phân công và thiết lập baseline.',2,1.5,'PM/BA');
task(13,2,'Phân tích yêu cầu nghiệp vụ','Phân tích B2C, B2B, Admin; hoàn thiện SRS và acceptance criteria.',4,3,'BA');
task(14,3,'Thiết kế kiến trúc hệ thống','Thiết kế React/Vite, Spring Boot, MySQL, Redis, JWT và Cloudinary.',2,2,'Architect/Backend');
task(15,4,'Thiết kế module và CSDL','Mô hình Product, User/Role/Permission; đề xuất Order/Payment/Cart.',3,3,'BA/Backend');
task(16,5,'Thiết kế giao diện','Thiết kế luồng B2C, B2B, Admin và responsive UI.',4,3,'UI/UX');
setRow(price,18,[1,'Quản trị hệ thống','Xác thực, phân quyền, bảo mật và vận hành.',null,null,null]);
task(19,'1.1','Đăng nhập và xác thực','Đăng ký, đăng nhập, refresh token, logout, quên/đặt lại mật khẩu, 2FA.',4,4,'Backend + Frontend');
task(20,'',' + Token, phiên và bảo mật','JWT, refresh token cookie, blacklist Redis, bảo vệ route.',2,2,'Backend');
task(21,'1.2','Quản lý tài khoản','Hồ sơ, đổi mật khẩu, trạng thái active/locked/suspended.',3,3,'Frontend + Backend');
task(22,'',' + Xem/cập nhật hồ sơ','Hiển thị và cập nhật thông tin tài khoản.',1,1,'Frontend');
task(23,'',' + Đổi mật khẩu','Xác minh mật khẩu hiện tại và cập nhật an toàn.',1,1,'Backend');
task(24,'1.3','Phân quyền RBAC','Role, permission, quản lý nhân viên và kiểm soát API theo quyền.',4,4,'Backend + Admin UI');
task(25,'',' + Role và permission','Tạo/cập nhật role, lấy danh sách permission.',2,2,'Backend');
task(26,'',' + Tạo nhân viên','Tạo staff, gán role, gửi mật khẩu tạm qua email.',2,2,'Backend + Admin UI');
task(27,'1.4','Audit log và xử lý lỗi','Chuẩn hóa lỗi 401/403/404, MDC logging, lưu vết thao tác admin.',2,2,'Backend');
task(30,'1.5','Cấu hình triển khai','Biến môi trường, CORS, bảo mật production và cấu hình database.',2,1.5,'DevOps/Backend');
setRow(price,32,[2,'Nghiệp vụ thương mại điện tử','Sản phẩm, B2C, B2B và vận hành admin.',null,null,null]);
task(33,'2.1','Quản lý sản phẩm và tồn kho','Danh mục, sản phẩm, biến thể size/màu, ảnh và tồn theo SKU.',6,6,'Backend + Frontend');
task(34,'',' + Catalog và tìm kiếm','Hiển thị/lọc/tìm kiếm danh sách và chi tiết sản phẩm.',3,3,'B2C UI + API');
task(35,'',' + Biến thể và tồn kho','Tồn theo size × màu; cảnh báo tồn thấp và kiểm tra số lượng.',3,3,'Backend + Admin UI');
task(36,'2.2','Cổng bán lẻ B2C','Giỏ hàng, checkout, thanh toán, đơn hàng và đánh giá.',8,8,'Full-stack');
task(37,'',' + Giỏ hàng và voucher','Thêm/sửa/xóa giỏ, kiểm tra tồn, áp dụng voucher.',3,3,'Full-stack');
task(38,'',' + Đặt hàng và thanh toán','Tạo đơn, COD/cổng thanh toán, webhook, giữ/giải phóng tồn.',4,4,'Backend + Frontend');
task(39,'',' + Lịch sử đơn và review','Theo dõi trạng thái, hủy đơn hợp lệ, đánh giá sản phẩm.',2,2,'Full-stack');
task(40,'2.3','Cổng đại lý B2B','Đặt sỉ ma trận, chiết khấu bậc, công nợ và lịch sử đơn.',6,6,'Full-stack');
task(41,'',' + Đặt hàng ma trận','Nhập nhanh số lượng theo Size × Màu và tính giá bậc.',3,3,'B2B UI + API');
task(42,'',' + Hạng chiết khấu và công nợ','Theo dõi tiến độ hạng, hạn mức và dư nợ đại lý.',3,3,'B2B UI + API');
task(44,'2.4','Vận hành Admin','Dashboard, đơn hàng, đại lý, khuyến mãi và inbox.',6,6,'Admin UI + API');
task(45,'',' + Dashboard và sản phẩm','KPI B2C/B2B, cảnh báo tồn thấp, CRUD sản phẩm.',3,3,'Admin UI');
task(46,'',' + Đại lý, khuyến mãi và đơn','Duyệt đại lý, voucher, can thiệp đơn và báo cáo.',3,3,'Admin UI + API');
setRow(price,48,[3,'Tích hợp mở rộng','Các dịch vụ ngoài hệ thống.',null,null,null]);
task(49,'3.1','Tích hợp email','Gửi email reset password và thông báo tài khoản/đơn hàng.',2,2,'SMTP');
task(50,'3.2','Tích hợp Cloudinary','Tải, lưu và hiển thị ảnh sản phẩm.',2,2,'Cloudinary');
task(51,'3.3','Tích hợp Redis/notification','Refresh token, blacklist và khung thông báo.',2,2,'Redis');
task(52,'3.4','Đa ngôn ngữ (Vi, En)','Chuẩn bị cấu trúc i18n; phạm vi release hiện tại là Tiếng Việt.',1,1,'Frontend');
set(price,'D53','TỔNG');
price.getRange('E53').formulas = [['=SUM(E12:E52)']];
price.getRange('D12:E53').format.numberFormat = '0.0';

// 3. Master Plan - concise 4-week implementation schedule.
set(plan,'A1','DỰ ÁN HOLIDAY FASHION - MASTER PLAN');
set(plan,'A2','Đơn vị: Atmin Company');
set(plan,'A3','Người lập: [[BỔ SUNG]]');
set(plan,'G3',new Date('2026-07-07'));
set(plan,'G4','Display:'); set(plan,'H4','Weekly'); set(plan,'G5','Display Period:'); set(plan,'H5',4);
const weekDates=[new Date('2026-07-06'),new Date('2026-07-13'),new Date('2026-07-20'),new Date('2026-07-27')];
plan.getRange('M5:P5').values=[weekDates];
plan.getRange('M6:P6').values=[['06\nThg\n07','13\nThg\n07','20\nThg\n07','27\nThg\n07']];
plan.getRange('M7:P7').values=[[1,2,3,4]];
plan.getRange('G7:L7').values=[['Kế hoạch\nBắt đầu','Kế hoạch\nKết thúc','Kế hoạch\nSố ngày','Thực tế\nBắt đầu','Thực tế\nKết thúc','Thực tế\nSố ngày']];
const rows=[
 [9,'I','Khởi tạo & phân tích thiết kế','', '', 25, new Date('2026-07-07'),new Date('2026-07-11'),5],
 [10,1,'Khởi động dự án','Lập kế hoạch, phân công và kick-off','PM','BA/Dev',20,new Date('2026-07-07'),new Date('2026-07-08'),2],
 [11,2,'Phân tích yêu cầu & SRS','B2C, B2B, Admin; use case, ERD, acceptance criteria','BA','PM/Dev',35,new Date('2026-07-07'),new Date('2026-07-10'),4],
 [12,3,'Thiết kế kiến trúc & dữ liệu','Kiến trúc React/Spring Boot, DB, RBAC, API contract','Backend Lead','BA',20,new Date('2026-07-09'),new Date('2026-07-11'),3],
 [14,'II','Phát triển lõi & catalog','', '', 50, new Date('2026-07-13'),new Date('2026-07-18'),6],
 [15,1,'Xác thực & RBAC','JWT, refresh token, staff/role/permission','Backend','Frontend',40,new Date('2026-07-13'),new Date('2026-07-15'),3],
 [16,2,'Sản phẩm & tồn kho','Catalog, biến thể size/màu, tồn SKU, upload ảnh','Full-stack','QA',30,new Date('2026-07-14'),new Date('2026-07-18'),5],
 [18,'III','B2C & B2B','', '', 50, new Date('2026-07-20'),new Date('2026-07-25'),6],
 [19,1,'Cổng B2C','Catalog, giỏ, checkout, đơn hàng, review','Full-stack','QA',35,new Date('2026-07-20'),new Date('2026-07-23'),4],
 [20,2,'Cổng B2B','Đặt ma trận, tier, công nợ và lịch sử đơn','Full-stack','QA',30,new Date('2026-07-22'),new Date('2026-07-25'),4],
 [22,'IV','Admin, kiểm thử & bàn giao','', '', 25, new Date('2026-07-27'),new Date('2026-08-01'),6],
 [23,1,'Admin dashboard','Sản phẩm, đại lý, khuyến mãi, vận hành đơn','Frontend','Backend',30,new Date('2026-07-27'),new Date('2026-07-29'),3],
 [24,2,'Kiểm thử & sửa lỗi','Smoke test, API test, regression và phân quyền','QA','Full team',20,new Date('2026-07-29'),new Date('2026-07-31'),3],
 [25,3,'Bàn giao','Hướng dẫn sử dụng, SRS, source code và nghiệm thu','PM','Client',10,new Date('2026-08-01'),new Date('2026-08-01'),1]
];
for (const [r,id,name,summary,owner,coord,progress,start,end,duration] of rows) {
  plan.getRange(`A${r}:I${r}`).values=[[id,name,summary,owner,coord,progress,start,end,duration]];
  plan.getRange(`J${r}:L${r}`).clear({applyTo:'contents'});
}
plan.getRange('G9:H25').format.numberFormat='dd/mm/yyyy';
plan.getRange('F9:F25').format.numberFormat='0%';

// 4. Nhân sự dự án - replace template people with editable project roles.
set(people,'A1','DANH SÁCH NHÂN SỰ THAM GIA DỰ ÁN HOLIDAY FASHION');
set(people,'A3','Atmin Company');
const team=[
 [1,'[[BỔ SUNG]]','Atmin Company','Project Manager','Quản lý phạm vi, tiến độ, rủi ro và nghiệm thu','[[BỔ SUNG]]','[[BỔ SUNG]]','PM'],
 [2,'[[BỔ SUNG]]','Atmin Company','Business Analyst','Phân tích yêu cầu B2C/B2B/Admin, duy trì SRS','[[BỔ SUNG]]','[[BỔ SUNG]]','BA'],
 [3,'[[BỔ SUNG]]','Atmin Company','Backend Developer','Spring Boot, MySQL, Redis, Security/JWT và API','[[BỔ SUNG]]','[[BỔ SUNG]]','Backend'],
 [4,'[[BỔ SUNG]]','Atmin Company','Frontend Developer','React/Vite, UI B2C/B2B/Admin, tích hợp API','[[BỔ SUNG]]','[[BỔ SUNG]]','Frontend'],
 [5,'[[BỔ SUNG]]','Atmin Company','QA/Tester','Test case, regression, kiểm thử API và nghiệm thu','[[BỔ SUNG]]','[[BỔ SUNG]]','QA'],
 [6,'[[BỔ SUNG]]','Atmin Company','UI/UX Designer','Thiết kế luồng và giao diện responsive','[[BỔ SUNG]]','[[BỔ SUNG]]','UI/UX']
];
people.getRange('A4:H9').values=team;
set(people,'A11','Khách hàng / Product Owner');
people.getRange('A12:H14').values=[
 [1,'[[BỔ SUNG]]','Atmin','Product Owner','Xác nhận yêu cầu và ưu tiên backlog','[[BỔ SUNG]]','[[BỔ SUNG]]','Khách hàng'],
 [2,'[[BỔ SUNG]]','Atmin','Business Owner','Nghiệm thu chức năng và chính sách nghiệp vụ','[[BỔ SUNG]]','[[BỔ SUNG]]','Khách hàng'],
 [3,'[[BỔ SUNG]]','Atmin','Vận hành','Kiểm thử thực tế, dữ liệu mẫu và phản hồi','[[BỔ SUNG]]','[[BỔ SUNG]]','Khách hàng']
];

// 7. Cập nhật tiến độ - baseline action tracker.
set(tracking,'F2','DỰ ÁN HOLIDAY FASHION');
set(tracking,'F3','Action Tracking Sheet\nNhật ký hoạt động dự án');
set(tracking,'F5','Project Manager: [[BỔ SUNG]]\nQuản trị dự án');
set(tracking,'F6','Workstream Lead: [[BỔ SUNG]]\nTrưởng nhóm công việc');
set(tracking,'F7','Updated by: [[BỔ SUNG]]\nCập nhật bởi');
set(tracking,'F8','Updated on: 14/07/2026\nNgày cập nhật');
const actions=[
 [1,'14/07/2026','Nội bộ','Phân tích & Thiết kế','Hoàn thiện SRS','Rà soát SRS, use case, ERD và sequence diagram','In Progress','17/07/2026',null,'BA / PM','Chờ xác nhận các chính sách B2B và thanh toán'],
 [2,'14/07/2026','Nội bộ','Backend','Hoàn thiện module Order/Payment','Thiết kế API order, transaction tồn kho, webhook thanh toán','Not Started','24/07/2026',null,'Backend Developer','Ưu tiên sau khi duyệt SRS'],
 [3,'14/07/2026','Nội bộ','Frontend','Tích hợp B2C/B2B API','Thay thế mock data bằng API và xử lý trạng thái tải/lỗi','Not Started','28/07/2026',null,'Frontend Developer','Phụ thuộc API contract'],
 [4,'14/07/2026','Nội bộ','QA','Chuẩn bị test case','Viết test case cho auth, RBAC, product, B2C/B2B','Not Started','30/07/2026',null,'QA/Tester','Dựa trên SRS v1.0'],
 [5,'14/07/2026','Khách hàng','Nghiệp vụ B2B','Xác nhận chính sách giá sỉ','Chốt các bậc chiết khấu, hạn mức tín dụng và luồng công nợ','Not Started','17/07/2026',null,'Product Owner','Cần phản hồi từ Atmin'],
 [6,'14/07/2026','Nội bộ','Vận hành','Chuẩn bị dữ liệu mẫu','Sản phẩm, biến thể size/màu, đại lý và tài khoản test','Not Started','29/07/2026',null,'BA / QA','[[BỔ SUNG: nguồn dữ liệu]]'],
 [7,'14/07/2026','Nội bộ','Bàn giao','Checklist nghiệm thu','Chuẩn bị tài liệu, source code, hướng dẫn sử dụng và demo','Not Started','01/08/2026',null,'PM','[[BỔ SUNG: lịch demo]]']
];
tracking.getRange('A13:K19').values=actions;
tracking.getRange('B13:B19').format.numberFormat='dd/mm/yyyy';
tracking.getRange('H13:I19').format.numberFormat='dd/mm/yyyy';

// Verification prior to export.
console.log((await wb.inspect({kind:'table',sheetId:'2. Price',range:'A10:F53',maxChars:8000,tableMaxRows:50,tableMaxCols:6})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:50},summary:'formula error scan'})).ndjson);
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save('Template-Technical_Holiday-Fashion_Completed.xlsx');
const png=await wb.render({sheetName:'2. Price',range:'A1:F53',scale:1.4,format:'png'});
await fs.writeFile('completed_price_preview.png',new Uint8Array(await png.arrayBuffer()));
