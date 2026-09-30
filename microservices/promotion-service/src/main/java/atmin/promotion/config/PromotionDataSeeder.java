package atmin.promotion.config;

import atmin.modules.promotion.entity.Promotion;
import atmin.modules.promotion.entity.UserVoucherWallet;
import atmin.modules.promotion.repository.PromotionRepository;
import atmin.modules.promotion.repository.UserVoucherWalletRepository;
import atmin.modules.user.api.UserDto;
import atmin.promotion.client.UserClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionDataSeeder implements CommandLineRunner {

    private final PromotionRepository promotionRepository;
    private final UserVoucherWalletRepository userVoucherWalletRepository;
    private final UserClient userClient;

    @Override
    @Transactional
    public void run(String... args) {
        if (promotionRepository.count() > 0) {
            log.info("===> promotion-service đã có dữ liệu khuyến mãi, bỏ qua seeder.");
            return;
        }

        log.info("===> Khởi tạo mã khuyến mãi mẫu cho promotion-service...");

        List<Promotion> promotions = List.of(
            Promotion.builder()
                .code("CHAOBANMOI")
                .discountAmount(BigDecimal.valueOf(20000))
                .minOrderValue(BigDecimal.valueOf(100000))
                .type("FIXED")
                .expiryDate(LocalDateTime.now().plusYears(2))
                .usageLimit(1000)
                .usedCount(0)
                .targetType("ALL")
                .status("ACTIVE")
                .build(),
            Promotion.builder()
                .code("HOLIDAY50")
                .discountAmount(BigDecimal.valueOf(50000))
                .minOrderValue(BigDecimal.valueOf(300000))
                .type("FIXED")
                .expiryDate(LocalDateTime.now().plusYears(2))
                .usageLimit(500)
                .usedCount(0)
                .targetType("ALL")
                .status("ACTIVE")
                .build(),
            Promotion.builder()
                .code("SALE10")
                .discountPercentage(10.0)
                .minOrderValue(BigDecimal.valueOf(150000))
                .type("PERCENT")
                .expiryDate(LocalDateTime.now().plusYears(2))
                .usageLimit(1000)
                .usedCount(0)
                .targetType("ALL")
                .status("ACTIVE")
                .build(),
            Promotion.builder()
                .code("VIP20")
                .discountPercentage(20.0)
                .minOrderValue(BigDecimal.valueOf(500000))
                .type("PERCENT")
                .expiryDate(LocalDateTime.now().plusYears(2))
                .usageLimit(200)
                .usedCount(0)
                .targetType("CUSTOMER")
                .status("ACTIVE")
                .build()
        );

        List<Promotion> savedPromotions = promotionRepository.saveAll(promotions);
        log.info("===> Đã tạo xong {} mã khuyến mãi.", savedPromotions.size());

        // Phân phối vào ví cho các user hiện có
        try {
            List<UserDto> users = userClient.getAllUsers();
            if (users != null && !users.isEmpty()) {
                List<UserVoucherWallet> wallets = new ArrayList<>();
                for (UserDto user : users) {
                    for (Promotion promo : savedPromotions) {
                        wallets.add(UserVoucherWallet.builder()
                                .userId(user.getId())
                                .promotionId(promo.getId())
                                .status("AVAILABLE")
                                .build());
                    }
                }
                userVoucherWalletRepository.saveAll(wallets);
                log.info("===> Đã nạp voucher vào ví cho {} tài khoản người dùng!", users.size());
            }
        } catch (Exception e) {
            log.warn("Chưa thể liên lạc với identity-service để phân phối voucher vào ví: {}", e.getMessage());
        }
    }
}
