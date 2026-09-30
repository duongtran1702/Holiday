package atmin.modules.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "title")
    private String title;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "severity")
    private String severity; // INFO, WARNING, CRITICAL

    @Column(name = "target_role")
    private String targetRole; // ADMIN, CUSTOMER, DAILY...

    @Column(name = "target_user_id")
    private String targetUserId;

    @Column(name = "action_url")
    private String actionUrl;

    @Column(name = "metadata", columnDefinition = "text")
    private String metadata; // JSON string

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "is_resolved", nullable = false)
    @Builder.Default
    private boolean isResolved = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
