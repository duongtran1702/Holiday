package atmin.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    private String conversationId;
    private String content;
    private String contentType; // TEXT, IMAGE, FILE
    private String mediaUrl;
    private String replyToId;
}
