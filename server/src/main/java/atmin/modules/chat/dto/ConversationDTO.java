package atmin.modules.chat.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private String id;
    private String type;
    private String name;
    private String avatarUrl;
    private String participantId;
    private int unreadCount;
    private MessageDTO lastMessage;
    private LocalDateTime createdAt;
}
