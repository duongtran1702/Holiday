package atmin.order.client;

import atmin.modules.promotion.dto.PromotionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
public class PromotionClientFallback implements PromotionClient {

    @Override
    public PromotionDTO validateVoucher(String code, BigDecimal totalAmount, String userId) {
        log.warn("[Circuit Breaker Fallback] promotion-service không khả dụng khi kiểm tra mã voucher: {}", code);
        throw new IllegalStateException("Hệ thống khuyến mãi đang bảo trì, vui lòng thử lại sau.");
    }

    @Override
    public void useVoucher(String code, String userId) {
        log.warn("[Circuit Breaker Fallback] promotion-service không khả dụng khi dùng mã voucher: {}", code);
    }
}
