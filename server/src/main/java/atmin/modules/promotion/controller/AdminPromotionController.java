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
@RequestMapping("/api/v1/staff/promotions")
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PROMOTIONS')")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable String id, @RequestBody PromotionCreateReq req) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PROMOTIONS')")
    public ResponseEntity<Void> deletePromotion(@PathVariable String id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('UPDATE_PROMOTIONS')")
    public ResponseEntity<Void> togglePromotionStatus(@PathVariable String id) {
        promotionService.togglePromotionStatus(id);
        return ResponseEntity.ok().build();
    }
}
