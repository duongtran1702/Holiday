package atmin.modules.promotion.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.dto.UserVoucherDTO;
import atmin.modules.promotion.service.PromotionService;
import atmin.modules.user.api.UserDto;
import atmin.promotion.client.UserClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class UserPromotionController {

    private final PromotionService promotionService;
    private final UserClient userClient;
    
    @GetMapping("/my-vouchers")
    public ResponseEntity<List<UserVoucherDTO>> getMyVouchers(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        return ResponseEntity.ok(promotionService.getMyVouchers(userId));
    }

    @DeleteMapping("/my-vouchers/{id}")
    public ResponseEntity<Void> deleteMyVoucher(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        promotionService.deleteMyVoucher(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<PromotionDTO>> validateCode(
            @RequestParam String code, 
            @RequestParam BigDecimal totalAmount,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        return ResponseEntity.ok(ApiResponse.success(
                "Mã giảm giá hợp lệ", 
                promotionService.validateVoucher(code, totalAmount, userId)
        ));
    }

    private String resolveUserId(String headerUserId, Authentication authentication) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (authentication != null && authentication.getName() != null) {
            UserDto user = userClient.getUserByEmail(authentication.getName());
            if (user != null) {
                return user.getId();
            }
        }
        throw new IllegalArgumentException("Không tìm thấy thông tin người dùng đang đăng nhập");
    }
}
