package atmin.modules.promotion.service;

import atmin.modules.promotion.dto.PromotionCreateReq;
import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.dto.UserVoucherDTO;
import atmin.modules.promotion.entity.Promotion;
import atmin.modules.promotion.entity.UserVoucherWallet;
import atmin.modules.promotion.repository.PromotionRepository;
import atmin.modules.promotion.repository.UserVoucherWalletRepository;
import atmin.modules.user.api.UserDto;
import atmin.promotion.client.NotificationClient;
import atmin.promotion.client.UserClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserVoucherWalletRepository userVoucherWalletRepository;
    private final UserClient userClient;
    private final NotificationClient notificationClient;

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

        List<UserDto> targetUsers;
        try {
            if ("SPECIFIC_EMAILS".equals(req.getTargetType()) && req.getSpecificEmails() != null) {
                Set<String> emailSet = Arrays.stream(req.getSpecificEmails().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());
                targetUsers = userClient.getAllUsers().stream()
                        .filter(u -> emailSet.contains(u.getEmail()))
                        .collect(Collectors.toList());
            } else if ("CUSTOMER".equals(req.getTargetType()) || "AGENT".equals(req.getTargetType())) {
                String roleFilter = req.getTargetType();
                targetUsers = userClient.getAllUsers().stream()
                        .filter(u -> u.getRoles() != null && u.getRoles().contains(roleFilter))
                        .collect(Collectors.toList());
            } else {
                targetUsers = userClient.getAllUsers();
            }
        } catch (Exception e) {
            log.warn("Không thể lấy danh sách người dùng từ identity-service: {}", e.getMessage());
            targetUsers = new ArrayList<>();
        }

        List<String> targetUserIds = targetUsers.stream().map(UserDto::getId).collect(Collectors.toList());
        List<String> existingUserIds = userVoucherWalletRepository.findExistingUserIdsByPromotionIdAndUserIds(promotion.getId(), targetUserIds);
        Set<String> existingSet = new HashSet<>(existingUserIds);

        List<UserVoucherWallet> walletsToSave = new ArrayList<>();

        for (UserDto user : targetUsers) {
            if (!existingSet.contains(user.getId())) {
                UserVoucherWallet wallet = UserVoucherWallet.builder()
                        .userId(user.getId())
                        .promotionId(promotion.getId())
                        .status("AVAILABLE")
                        .build();
                walletsToSave.add(wallet);

                String role = (user.getRoles() != null && !user.getRoles().isEmpty()) ? user.getRoles().get(0) : "CUSTOMER";
                try {
                    notificationClient.createNotification(
                            "promotion",
                            "Promotion",
                            promotion.getId(),
                            "\uD83C\uDF89 Bạn nhận được Voucher mới: " + promotion.getCode(),
                            "Voucher giảm giá vừa được thêm vào ví của bạn. Kiểm tra ngay!",
                            "INFO",
                            role,
                            user.getId(),
                            "/promotions",
                            null
                    );
                } catch (Exception ex) {
                    log.warn("Không thể gửi thông báo cho user {}: {}", user.getId(), ex.getMessage());
                }
            }
        }

        if (!walletsToSave.isEmpty()) {
            userVoucherWalletRepository.saveAll(walletsToSave);
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

        promotion = promotionRepository.save(promotion);
        return mapToDto(promotion);
    }

    @Transactional
    public void deletePromotion(String id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khuyến mãi không tồn tại"));
        promotionRepository.delete(promotion);
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
        userVoucherWalletRepository.delete(wallet);
    }

    @Transactional(readOnly = true)
    public PromotionDTO validateVoucher(String code, BigDecimal totalAmount, String userId) {
        Promotion promotion = promotionRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại hoặc đã hết hạn"));

        if (!"ACTIVE".equals(promotion.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá không còn hoạt động");
        }
        
        if (promotion.getExpiryDate() != null && promotion.getExpiryDate().isBefore(LocalDateTime.now())) {
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
        Promotion promotion = promotionRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại"));
                
        UserVoucherWallet wallet = userVoucherWalletRepository.findOwnedVoucherForUpdate(userId, promotion.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bạn không sở hữu mã giảm giá này"));
                
        if (!"AVAILABLE".equals(wallet.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá này đã được sử dụng hoặc đã hết hạn");
        }

        validatePromotionAvailability(promotion);
        
        wallet.setStatus("USED");
        userVoucherWalletRepository.save(wallet);

        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);
    }

    @Transactional
    public void rollbackVoucher(String code, String userId) {
        log.info("Khôi phục voucher: code={}, userId={}", code, userId);
        promotionRepository.findByCodeForUpdate(code).ifPresent(promotion -> {
            userVoucherWalletRepository.findOwnedVoucherForUpdate(userId, promotion.getId()).ifPresent(wallet -> {
                if ("USED".equals(wallet.getStatus())) {
                    wallet.setStatus("AVAILABLE");
                    userVoucherWalletRepository.save(wallet);

                    if (promotion.getUsedCount() != null && promotion.getUsedCount() > 0) {
                        promotion.setUsedCount(promotion.getUsedCount() - 1);
                        promotionRepository.save(promotion);
                    }
                }
            });
        });
    }

    private void validatePromotionAvailability(Promotion promotion) {
        if (!"ACTIVE".equals(promotion.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá không còn hoạt động");
        }
        if (promotion.getExpiryDate() != null && promotion.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        }
        if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng");
        }
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
