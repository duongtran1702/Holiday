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
}
