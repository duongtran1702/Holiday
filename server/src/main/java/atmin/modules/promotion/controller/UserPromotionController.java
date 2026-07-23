package atmin.modules.promotion.controller;

import atmin.modules.promotion.dto.UserVoucherDTO;
import atmin.modules.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class UserPromotionController {

    private final PromotionService promotionService;
    
    @GetMapping("/my-vouchers")
    public ResponseEntity<List<UserVoucherDTO>> getMyVouchers(@AuthenticationPrincipal atmin.modules.user.entity.User user) {
        return ResponseEntity.ok(promotionService.getMyVouchers(user.getId()));
    }

    @DeleteMapping("/my-vouchers/{id}")
    public ResponseEntity<Void> deleteMyVoucher(
            @PathVariable String id,
            @AuthenticationPrincipal atmin.modules.user.entity.User user) {
        promotionService.deleteMyVoucher(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
