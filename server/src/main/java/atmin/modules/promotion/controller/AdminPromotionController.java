package atmin.modules.promotion.controller;

import atmin.modules.promotion.dto.PromotionCreateReq;
import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PROMOTIONS')")
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PROMOTIONS')")
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionCreateReq req) {
        return ResponseEntity.ok(promotionService.createPromotion(req));
    }
}
