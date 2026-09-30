package atmin.modules.chat.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private String contentType;
    private String mediaUrl;
    private String replyToId;
    private String status;
    private LocalDateTime createdAt;
}
