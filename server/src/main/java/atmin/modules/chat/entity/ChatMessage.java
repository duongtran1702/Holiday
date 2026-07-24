package atmin.modules.chat.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_type")
    @Builder.Default
    private String contentType = "TEXT"; // e.g. "TEXT", "IMAGE", "FILE", "SYSTEM"

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "reply_to_id")
    private String replyToId;

    @Column(name = "status")
    @Builder.Default
    private String status = "SENT"; // "SENT", "DELIVERED", "READ"

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
