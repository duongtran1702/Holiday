package atmin.modules.promotion.repository;

import atmin.modules.promotion.entity.UserVoucherWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherWalletRepository extends JpaRepository<UserVoucherWallet, String> {
    List<UserVoucherWallet> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(String userId);
    Optional<UserVoucherWallet> findByUserIdAndPromotionIdAndDeletedAtIsNull(String userId, String promotionId);
    boolean existsByUserIdAndPromotionIdAndDeletedAtIsNull(String userId, String promotionId);

    @org.springframework.data.jpa.repository.Query("SELECT w.userId FROM UserVoucherWallet w WHERE w.promotionId = :promotionId AND w.userId IN :userIds AND w.deletedAt IS NULL")
    List<String> findExistingUserIdsByPromotionIdAndUserIds(@org.springframework.data.repository.query.Param("promotionId") String promotionId, @org.springframework.data.repository.query.Param("userIds") List<String> userIds);
}
