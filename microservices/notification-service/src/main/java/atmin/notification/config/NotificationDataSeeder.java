package atmin.notification.config;

import atmin.modules.notification.entity.Notification;
import atmin.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDataSeeder implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (notificationRepository.count() > 0) {
            log.info("===> notification-service đã có dữ liệu thông báo, bỏ qua seeder.");
            return;
        }

        log.info("===> Khởi tạo thông báo mẫu cho notification-service...");

        Notification adminWelcome = Notification.builder()
                .type("SYSTEM_WELCOME")
                .entityType("SYSTEM")
                .entityId("SYS-001")
                .title("Chào mừng đến với Hệ thống Holiday")
                .message("Toàn bộ cụm Microservices đã sẵn sàng hoạt động. Bạn có thể bắt đầu quản lý sản phẩm, đơn hàng và nhân viên.")
                .severity("INFO")
                .targetRole("ADMIN")
                .actionUrl("/admin")
                .isRead(false)
                .isResolved(false)
                .build();

        Notification newProductAlert = Notification.builder()
                .type("INVENTORY_ALERT")
                .entityType("PRODUCT")
                .entityId("p1")
                .title("Tồn kho sản phẩm mẫu")
                .message("Các sản phẩm thời trang mẫu đã được nạp thành công vào hệ thống.")
                .severity("INFO")
                .targetRole("ADMIN")
                .actionUrl("/admin/products")
                .isRead(false)
                .isResolved(false)
                .build();

        notificationRepository.saveAll(List.of(adminWelcome, newProductAlert));
        log.info("===> Đã tạo xong các thông báo mẫu!");
    }
}
