# <p align="center">🛍️ HOLIDAY E-COMMERCE PLATFORM</p>
<p align="center">
  <strong>Hệ Thống Thương Mại Điện Tử & Quản Lý Phân Phối Đa Kênh (B2C & B2B)</strong><br>
  <em>Kiến trúc Microservices Phân Tán • Event-Driven • Transactional Outbox • Resilience4j • Zipkin Tracing</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21%20LTS-orange?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.0-brightgreen?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.4" />
  <img src="https://img.shields.io/badge/Spring%20Cloud-2024.0.0-blue?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Cloud" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-7.5%20KRaft-black?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Redis-7%20Alpine-red?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/React-18%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Zipkin-Distributed%20Tracing-yellow?style=for-the-badge&logo=openzipkin&logoColor=black" alt="Zipkin" />
</p>

---

## 🌟 Điểm Nhấn Kiến Trúc (Architecture Highlights)

| Tính Năng Cốt Lõi | Công Nghệ Triển Khai | Giá Trị Thực Chiến Doanh Nghiệp |
| :--- | :--- | :--- |
| **Microservices Isolation** | Spring Cloud Netflix Eureka + Gateway | Tách biệt hoàn toàn 12 modules, độc lập triển khai (CI/CD) và scale theo nhu cầu. |
| **Database-per-Service** | 7 Databases MySQL 8.0 riêng biệt | Không chia sẻ database, đảm bảo tính đóng gói dữ liệu và chuẩn Domain-Driven Design (DDD). |
| **Zero Dual-Write Anomaly** | **Transactional Outbox Pattern** | Đảm bảo tính nhất quán dữ liệu tuyệt đối giữa MySQL và Kafka trong Saga Checkout. |
| **Chống Sập Dây Chuyền** | **Resilience4j Circuit Breaker** | 100% FeignClient có Fallback và TimeLimiter, hệ thống vẫn hoạt động dù dịch vụ vệ tinh bị sự cố. |
| **Real-time Hybrid** | **Redis Pub/Sub & SSE** | Scale ngang cụm chat đa container không mất tin nhắn; đẩy thông báo tức thì bằng Server-Sent Events. |
| **Distributed Tracing** | **Micrometer + Brave + Zipkin** | Gắn `traceId` xuyên suốt Gateway -> Feign -> Kafka -> Database; xem biểu đồ trễ tại `port 9411`. |
| **Thanh Toán Trực Tuyến** | PayOS Open Banking QR | Tích hợp xác minh Webhook ngân hàng tự động, đồng bộ trạng thái đơn hàng thời gian thực. |

---

## 📊 1. Ma Trận Dịch Vụ & Cổng Kết Nối (Service Matrix)

| Module | Cổng (Port) | Cơ Sở Dữ Liệu | Nhiệm Vụ & Công Nghệ Chính |
| :--- | :---: | :--- | :--- |
| **`api-gateway`** | **`8080`** | *(Stateless)* | Cổng điều phối duy nhất, Spring Cloud Gateway WebFlux, CORS, Static Routing, Atmin Error Handler. |
| **`identity-service`**| **`8081`** | `holiday_identity` | Xác thực JWT, 2FA OTP qua Redis, Google OAuth2, Quản lý Nhân sự & Phân quyền RBAC. |
| **`product-service`** | **`8082`** | `holiday_product` | Quản lý sản phẩm thời trang, biến thể (Size/Color), tồn kho, Kafka Saga Stock Consumer. |
| **`order-service`** | **`8083`** | `holiday_order` | Giỏ hàng, Checkout, Saga Orchestrator, **Transactional Outbox Pattern**, Dashboard B2C/B2B. |
| **`payment-service`** | **`8084`** | `holiday_payment` | Cổng thanh toán PayOS, QR chuyển khoản, Hóa đơn điện tử, Webhook signature verification. |
| **`promotion-service`**| **`8085`** | `holiday_promotion`| Chiến dịch khuyến mãi, ví voucher khách hàng, Saga Voucher Consumer. |
| **`notification-service`**| **`8086`** | `holiday_notification`| Thông báo chuông in-app, **Server-Sent Events (SSE) stream** thời gian thực. |
| **`chat-service`** | **`8087`** | `holiday_chat` | Chat trực tuyến tư vấn viên qua WebSocket STOMP, **Redis Pub/Sub Clustered Broker**, Online Presence. |
| **`media-service`** | **`8088`** | *(Cloudinary)* | Tải lên hình ảnh sản phẩm & avatar lên đám mây Cloudinary, kiểm tra định dạng an toàn. |
| **`eureka-server`** | **`8761`** | *(In-Memory)* | Trung tâm khám phá và đăng ký dịch vụ (Service Discovery & Registry). |
| **`config-server`** | **`8888`** | *(Native Repo)* | Quản lý cấu hình tập trung phân phối động qua HTTP cho toàn bộ 8 Microservices. |
| **`zipkin`** | **`9411`** | *(Tracing Store)*| Thu thập và trực quan hóa luồng Distributed Tracing, phân tích độ trễ liên service. |

---

## 📁 2. Cấu Trúc Cây Thư Mục Dự Án (Repository Structure)

```text
Holiday/
├── client/                     # 🌐 Frontend React 18 + TypeScript + Vite (Feature-Sliced Architecture)
├── docs/                       # 📚 Tài liệu kỹ thuật, sơ đồ kiến trúc & phân tích nghiệp vụ
├── microservices/              # ⚙️ Hệ thống 12 Modules Backend Microservices (Gradle Multi-Project)
│   ├── api-gateway/            # [Port 8080] Spring Cloud Gateway, Routing & Security
│   ├── chat-service/           # [Port 8087] Chat STOMP WebSocket, Redis Pub/Sub
│   ├── common-library/         # Thư viện dùng chung: BaseEntity, Kafka Events, DTOs, Feign APIs
│   ├── config-server/          # [Port 8888] Spring Cloud Config Server tập trung
│   ├── docker/                 # Scripts khởi tạo cơ sở dữ liệu MySQL
│   ├── docker-compose.yml      # Cấu hình hạ tầng phân tán (MySQL, Redis, Kafka, Zipkin)
│   ├── eureka-server/          # [Port 8761] Spring Cloud Netflix Eureka Service Discovery
│   ├── identity-service/       # [Port 8081] Auth, JWT, OTP 2FA, Quản lý User & RBAC
│   ├── media-service/          # [Port 8088] Upload hình ảnh & avatar lên Cloudinary
│   ├── notification-service/   # [Port 8086] Server-Sent Events (SSE) stream thông báo in-app
│   ├── order-service/          # [Port 8083] Đơn hàng, Saga Orchestrator, Transactional Outbox
│   ├── payment-service/        # [Port 8084] Tích hợp cổng PayOS, Webhook signature verification
│   ├── product-service/        # [Port 8082] Danh mục sản phẩm, biến thể, tồn kho & Saga Stock
│   ├── promotion-service/      # [Port 8085] Ví voucher khách hàng, Saga Voucher
│   ├── build.gradle            # Cấu hình dependency chung toàn bộ microservices
│   ├── settings.gradle         # Khai báo quản lý 12 subprojects
│   ├── gradlew / gradlew.bat   # Gradle Wrapper Java 21
│   ├── .env.example            # 📄 File mẫu biến môi trường cho Backend
│   └── .gitignore              # Bộ quy tắc chặn secrets riêng cho microservices
├── .env.example                # 📄 File mẫu biến môi trường toàn dự án
├── .gitignore                  # 🛡️ Bộ quy tắc chặn secrets và build artifacts toàn hệ thống
└── README.md                   # 📖 Tài liệu kiến trúc toàn diện (File này)
```

---

## 👤 3. Cơ Chế Khởi Tạo Dữ Liệu Tự Động (Data Seeding & Initialization)

Hệ thống được thiết kế với cơ chế tự động nạp dữ liệu ban đầu (Data Seeding) trong môi trường phát triển (Development):
- **Hệ thống Phân quyền (RBAC)**: Tự động khởi tạo đầy đủ danh mục Permissions và Roles chuẩn (`ADMIN`, `STAFF`, `CUSTOMER`, `AGENT`).
- **Tài khoản Quản trị**: Khởi tạo tài khoản quản trị viên ban đầu thông qua các biến môi trường cấu hình (`APP_ADMIN_EMAIL`, `APP_ADMIN_PASSWORD`), đảm bảo an toàn tuyệt đối và không lưu cứng thông tin nhạy cảm trong mã nguồn.
- **Dữ liệu Nghiệp vụ Mẫu**: Tự động chuẩn bị các danh mục sản phẩm thời trang, thuộc tính biến thể, tồn kho và các chính sách khuyến mãi mẫu phục vụ việc kiểm thử tích hợp luồng nghiệp vụ end-to-end.

---

## 🚀 4. Hướng Dẫn Vận Hành & Khởi Chạy (Quick Start Runbook)

### Bước 1: Chuẩn bị Biến Môi Trường
Sao chép file mẫu thành `.env`:
```powershell
# Sao chép file cấu hình vào thư mục microservices
copy .env.example microservices\.env
```
> [!NOTE]
> Các tham số kết nối cho môi trường phát triển cục bộ đã được cấu hình sẵn trong `.env.example`. Người vận hành có thể điều chỉnh linh hoạt theo hạ tầng thực tế mà không lo ảnh hưởng đến mã nguồn.

---

### Bước 2: Khởi động Hạ tầng Phân tán (Docker Compose)
Chạy câu lệnh tại thư mục `microservices/`:
```powershell
cd microservices
docker compose up -d
```
> Hệ thống sẽ khởi động toàn bộ: **MySQL 8.0** (7 DBs riêng biệt), **Redis 7**, **Kafka 7.5 KRaft**, và **OpenZipkin Tracing**.

---

### Bước 3: Khởi chạy Microservices
Bạn có thể khởi chạy nhanh bằng Gradle Wrapper:
```powershell
cd microservices

# Thứ tự khuyến nghị:
.\gradlew.bat :eureka-server:bootRun
.\gradlew.bat :config-server:bootRun
.\gradlew.bat :api-gateway:bootRun

# Chạy các service nghiệp vụ:
.\gradlew.bat :identity-service:bootRun
.\gradlew.bat :product-service:bootRun
.\gradlew.bat :order-service:bootRun
.\gradlew.bat :payment-service:bootRun
.\gradlew.bat :promotion-service:bootRun
.\gradlew.bat :notification-service:bootRun
.\gradlew.bat :chat-service:bootRun
.\gradlew.bat :media-service:bootRun
```

---

### Bước 4: Khởi chạy Frontend Client
```powershell
cd client
npm install
npm run dev
```
👉 Mở trình duyệt và truy cập: **[http://localhost:5173](http://localhost:5173)**

---

## 🔍 5. Các Bảng Điều Khiển Giám Sát (DevOps & Monitoring Dashboards)

* **Eureka Service Registry**: [http://localhost:8761](http://localhost:8761) — Theo dõi trạng thái UP/DOWN của toàn bộ microservices.
* **Zipkin Distributed Tracing**: [http://localhost:9411](http://localhost:9411) — Truy vết từng mili-giây độ trễ của từng API request xuyên suốt các service.
* **API Gateway Actuator**: [http://localhost:8080/actuator/gateway/routes](http://localhost:8080/actuator/gateway/routes) — Xem danh sách các tuyến định tuyến đang hoạt động.
* **Config Server Health**: [http://localhost:8888/actuator/health](http://localhost:8888/actuator/health) — Kiểm tra kết nối cấu hình tập trung.

---

## 🛡️ 6. Quy Chuẩn Kỹ Thuật Đạt Chuẩn Enterprise (Production-Ready)

1. **Zero Warning & Clean Imports Rule (OCD Standard)**:
   - 100% không còn IDE warnings, không có import thừa hay code rác.
   - Tuyệt đối không dùng Fully Qualified Class Name (FQCN) trong thân hàm, toàn bộ classes được import chuẩn mực ở đầu file.
2. **Resilience & Cascading Failure Prevention**:
   - Mọi FeignClient liên service đều có bộ ngắt mạch Resilience4j và Fallback handler dự phòng.
3. **Guaranteed Delivery (At-Least-Once)**:
   - Toàn bộ sự kiện thanh toán và đơn hàng áp dụng Transactional Outbox Pattern tránh mất mát dữ liệu khi gặp sự cố mạng.
4. **Bảo Mật An Toàn Tuyệt Đối**:
   - Bộ quy tắc `.gitignore` 2 lớp chặn đứng 100% rủi ro rò rỉ API keys, JWT secret, database passwords hay build artifacts lên Git.

---

<p align="center">
  <em>Được phát triển và hoàn thiện bởi Atmin</em>
</p>
