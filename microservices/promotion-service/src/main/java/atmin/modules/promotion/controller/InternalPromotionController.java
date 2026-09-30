package atmin.modules.promotion.controller;

import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/internal/promotions")
@RequiredArgsConstructor
public class InternalPromotionController {

    private final PromotionService promotionService;

    @GetMapping("/validate")
    public PromotionDTO validateVoucher(@RequestParam("code") String code,
                                        @RequestParam("totalAmount") BigDecimal totalAmount,
                                        @RequestParam("userId") String userId) {
        return promotionService.validateVoucher(code, totalAmount, userId);
    }

    @PostMapping("/use")
    public void useVoucher(@RequestParam("code") String code, @RequestParam("userId") String userId) {
        promotionService.useVoucher(code, userId);
    }

    @PostMapping("/rollback")
    public void rollbackVoucher(@RequestParam("code") String code, @RequestParam("userId") String userId) {
        promotionService.rollbackVoucher(code, userId);
    }
}
