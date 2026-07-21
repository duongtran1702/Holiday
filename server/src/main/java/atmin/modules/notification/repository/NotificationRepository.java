package atmin.modules.notification.repository;

import atmin.modules.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    long countByIsResolvedFalse();
    long countByIsReadFalse();

    List<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Notification> findAllByTargetRoleOrderByCreatedAtDesc(String targetRole, Pageable pageable);

    Optional<Notification> findFirstByTypeAndEntityIdAndIsResolvedFalse(String type, String entityId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id IN :ids")
    void markAsRead(List<UUID> ids);
}
