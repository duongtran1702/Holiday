package atmin.modules.promotion.service;

import atmin.modules.notification.entity.Notification;
import atmin.modules.notification.repository.NotificationRepository;
import atmin.modules.promotion.dto.PromotionCreateReq;
import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.dto.UserVoucherDTO;
import atmin.modules.promotion.entity.Promotion;
import atmin.modules.promotion.entity.UserVoucherWallet;
import atmin.modules.promotion.repository.PromotionRepository;
import atmin.modules.promotion.repository.UserVoucherWalletRepository;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserVoucherWalletRepository userVoucherWalletRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public PromotionDTO createPromotion(PromotionCreateReq req) {
        if (promotionRepository.findByCodeAndDeletedAtIsNull(req.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã khuyến mãi đã tồn tại: " + req.getCode());
        }

        Promotion promotion = Promotion.builder()
                .code(req.getCode())
                .discountPercentage(req.getDiscountPercentage())
                .discountAmount(req.getDiscountAmount())
                .minOrderValue(req.getMinOrderValue())
                .type(req.getType())
                .expiryDate(req.getExpiryDate())
                .usageLimit(req.getUsageLimit())
                .targetType(req.getTargetType())
                .status("ACTIVE")
                .usedCount(0)
                .build();

        promotion = promotionRepository.save(promotion);

        List<User> targetUsers;
        if ("SPECIFIC_EMAILS".equals(req.getTargetType())) {
            List<String> emails = Arrays.stream(req.getSpecificEmails().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            targetUsers = userRepository.findByEmailInAndDeletedAtIsNull(emails);
        } else if ("CUSTOMER".equals(req.getTargetType()) || "AGENT".equals(req.getTargetType())) {
            targetUsers = userRepository.findByRoles_NameAndDeletedAtIsNull(req.getTargetType());
        } else {
            targetUsers = userRepository.findAll(); // ALL
        }

        List<String> targetUserIds = targetUsers.stream().map(User::getId).collect(Collectors.toList());
        List<String> existingUserIds = userVoucherWalletRepository.findExistingUserIdsByPromotionIdAndUserIds(promotion.getId(), targetUserIds);
        java.util.Set<String> existingSet = new java.util.HashSet<>(existingUserIds);

        List<UserVoucherWallet> walletsToSave = new java.util.ArrayList<>();
        List<Notification> notificationsToSave = new java.util.ArrayList<>();

        for (User user : targetUsers) {
            if (!existingSet.contains(user.getId())) {
                UserVoucherWallet wallet = UserVoucherWallet.builder()
                        .userId(user.getId())
                        .promotionId(promotion.getId())
                        .status("AVAILABLE")
                        .build();
                walletsToSave.add(wallet);

                Notification notification = Notification.builder()
                        .type("promotion")
                        .entityType("Promotion")
                        .entityId(promotion.getId())
                        .title("\uD83C\uDF89 Bạn nhận được Voucher mới: " + promotion.getCode())
                        .message("Voucher giảm giá vừa được thêm vào ví của bạn. Kiểm tra ngay!")
                        .targetRole(user.getRoles().stream().findFirst().map(r -> r.getName()).orElse("CUSTOMER"))
                        .targetUserId(user.getId())
                        .actionUrl("/promotions")
                        .build();
                notificationsToSave.add(notification);
            }
        }

        if (!walletsToSave.isEmpty()) {
            userVoucherWalletRepository.saveAll(walletsToSave);
        }
        if (!notificationsToSave.isEmpty()) {
            notificationRepository.saveAll(notificationsToSave);
        }

        return mapToDto(promotion);
    }

    @Transactional(readOnly = true)
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .filter(p -> p.getDeletedAt() == null)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PromotionDTO updatePromotion(String id, PromotionCreateReq req) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));

        if (!promotion.getCode().equals(req.getCode()) && promotionRepository.findByCodeAndDeletedAtIsNull(req.getCode()).isPresent()) {
            throw new IllegalArgumentException("Mã khuyến mãi đã tồn tại: " + req.getCode());
        }

        promotion.setCode(req.getCode());
        promotion.setDiscountPercentage(req.getDiscountPercentage());
        promotion.setDiscountAmount(req.getDiscountAmount());
        promotion.setMinOrderValue(req.getMinOrderValue());
        promotion.setType(req.getType());
        promotion.setExpiryDate(req.getExpiryDate());
        promotion.setUsageLimit(req.getUsageLimit());
        // Target type usually shouldn't change after creation because wallets are already distributed, 
        // but we can update basic fields.

        promotion = promotionRepository.save(promotion);
        return mapToDto(promotion);
    }

    @Transactional
    public void deletePromotion(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));
        promotionRepository.delete(promotion); // soft delete via @SQLDelete
    }

    @Transactional
    public void togglePromotionStatus(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));
        if ("ACTIVE".equals(promotion.getStatus())) {
            promotion.setStatus("INACTIVE");
        } else {
            promotion.setStatus("ACTIVE");
        }
        promotionRepository.save(promotion);
    }

    @Transactional(readOnly = true)
    public List<UserVoucherDTO> getMyVouchers(String userId) {
        return userVoucherWalletRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId).stream()
                .map(wallet -> {
                    Promotion p = promotionRepository.findById(wallet.getPromotionId())
                            .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));
                    return UserVoucherDTO.builder()
                            .id(wallet.getId())
                            .promotion(mapToDto(p))
                            .status(wallet.getStatus())
                            .createdAt(wallet.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMyVoucher(String userId, String voucherId) {
        UserVoucherWallet wallet = userVoucherWalletRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher"));
        if (!wallet.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xoá voucher này");
        }
        userVoucherWalletRepository.delete(wallet); // soft delete
    }

    @Transactional(readOnly = true)
    public PromotionDTO validateVoucher(String code, java.math.BigDecimal totalAmount, String userId) {
        Promotion promotion = promotionRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

        if (!"ACTIVE".equals(promotion.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá không còn hoạt động");
        }
        
        if (promotion.getExpiryDate() != null && promotion.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        }

        if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng");
        }

        if (totalAmount.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này");
        }

        UserVoucherWallet wallet = userVoucherWalletRepository.findByUserIdAndPromotionIdAndDeletedAtIsNull(userId, promotion.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bạn không sở hữu mã giảm giá này"));

        if (!"AVAILABLE".equals(wallet.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá này đã được sử dụng hoặc đã hết hạn");
        }

        return mapToDto(promotion);
    }

    @Transactional
    public void useVoucher(String code, String userId) {
        Promotion promotion = promotionRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại"));
                
        UserVoucherWallet wallet = userVoucherWalletRepository.findByUserIdAndPromotionIdAndDeletedAtIsNull(userId, promotion.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bạn không sở hữu mã giảm giá này"));
                
        if (!"AVAILABLE".equals(wallet.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá này đã được sử dụng hoặc đã hết hạn");
        }
        
        wallet.setStatus("USED");
        userVoucherWalletRepository.save(wallet);

        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);
    }

    private PromotionDTO mapToDto(Promotion promotion) {
        return PromotionDTO.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .discountPercentage(promotion.getDiscountPercentage())
                .discountAmount(promotion.getDiscountAmount())
                .minOrderValue(promotion.getMinOrderValue())
                .type(promotion.getType())
                .expiryDate(promotion.getExpiryDate())
                .usageLimit(promotion.getUsageLimit())
                .usedCount(promotion.getUsedCount())
                .targetType(promotion.getTargetType())
                .status(promotion.getStatus())
                .build();
    }

}
