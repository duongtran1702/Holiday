package atmin.modules.notification.dto;

import atmin.modules.notification.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String type;
    private String entityType;
    private String entityId;
    private String title;
    private String message;
    private String severity;
    private String targetRole;
    private String targetUserId;
    private String actionUrl;
    private String metadata;
    private boolean isRead;
    private boolean isResolved;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification entity) {
        return NotificationResponse.builder()
                .id(entity.getId().toString())
                .type(entity.getType())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .severity(entity.getSeverity())
                .targetRole(entity.getTargetRole())
                .targetUserId(entity.getTargetUserId())
                .actionUrl(entity.getActionUrl())
                .metadata(entity.getMetadata())
                .isRead(entity.isRead())
                .isResolved(entity.isResolved())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
