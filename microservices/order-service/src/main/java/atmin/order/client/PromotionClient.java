package atmin.order.client;

import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.service.PromotionService;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@FeignClient(name = "promotion-service", path = "/api/v1/internal/promotions", fallback = PromotionClientFallback.class)
public interface PromotionClient extends PromotionService {

    @Override
    @GetMapping("/validate")
    PromotionDTO validateVoucher(@RequestParam("code") String code,
                                @RequestParam("totalAmount") BigDecimal totalAmount,
                                @RequestParam("userId") String userId);

    @Override
    @PostMapping("/use")
    void useVoucher(@RequestParam("code") String code, @RequestParam("userId") String userId);
}
