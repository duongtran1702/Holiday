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

        for (User user : targetUsers) {
            if (!userVoucherWalletRepository.existsByUserIdAndPromotionIdAndDeletedAtIsNull(user.getId(), promotion.getId())) {
                UserVoucherWallet wallet = UserVoucherWallet.builder()
                        .user(user)
                        .promotion(promotion)
                        .status("AVAILABLE")
                        .build();
                userVoucherWalletRepository.save(wallet);

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
                notificationRepository.save(notification);
            }
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

    @Transactional(readOnly = true)
    public List<UserVoucherDTO> getMyVouchers(String userId) {
        return userVoucherWalletRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToUserVoucherDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMyVoucher(String userId, String voucherId) {
        UserVoucherWallet wallet = userVoucherWalletRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher"));
        if (!wallet.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xoá voucher này");
        }
        userVoucherWalletRepository.delete(wallet); // soft delete
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

    private UserVoucherDTO mapToUserVoucherDto(UserVoucherWallet wallet) {
        return UserVoucherDTO.builder()
                .id(wallet.getId())
                .promotion(mapToDto(wallet.getPromotion()))
                .status(wallet.getStatus())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
