package atmin.modules.promotion.service;

import atmin.modules.promotion.dto.PromotionDTO;
import java.math.BigDecimal;

public interface PromotionService {
    PromotionDTO validateVoucher(String code, BigDecimal totalAmount, String userId);
    void useVoucher(String code, String userId);
}
