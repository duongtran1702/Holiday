package atmin.modules.notification.api;

import atmin.modules.notification.entity.Notification;
import atmin.modules.notification.repository.NotificationRepository;
import atmin.modules.notification.sse.SseNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationInternalApiImpl implements NotificationInternalApi {

    private final NotificationRepository notificationRepository;
    private final SseNotificationService sseNotificationService;

    @Override
    @Transactional
    public void createNotification(String type, String entityType, String entityId, String title, String message, String severity, String targetRole, String targetUserId, String actionUrl, String metadata) {
        Optional<Notification> existing = notificationRepository
                .findFirstByTypeAndEntityIdAndIsResolvedFalse(type, entityId);
        
        if (existing.isPresent()) {
            log.info("Notification of type {} for entity {} already exists and is unresolved.", type, entityId);
            return;
        }

        Notification notification = Notification.builder()
                .type(type)
                .entityType(entityType)
                .entityId(entityId)
                .title(title)
                .message(message)
                .severity(severity)
                .targetRole(targetRole)
                .targetUserId(targetUserId)
                .actionUrl(actionUrl)
                .metadata(metadata)
                .isRead(false)
                .isResolved(false)
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Created notification: {}", message);

        // Bắn thông báo thời gian thực qua Server-Sent Events (SSE)
        try {
            if (targetUserId != null && !targetUserId.isBlank()) {
                sseNotificationService.sendToUser(targetUserId, notification);
            }
            if (targetRole == null || "ADMIN".equalsIgnoreCase(targetRole) || "ALL".equalsIgnoreCase(targetRole)) {
                sseNotificationService.sendToAdmin(notification);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi bắn thông báo SSE: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void resolveNotification(String type, String entityType, String entityId) {
        notificationRepository.findFirstByTypeAndEntityIdAndIsResolvedFalse(type, entityId)
                .ifPresent(notification -> {
                    notification.setResolved(true);
                    notificationRepository.save(notification);
                    log.info("Resolved notification of type {} for entity {}", type, entityId);
                });
    }
}
