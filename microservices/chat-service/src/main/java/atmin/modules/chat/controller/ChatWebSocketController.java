package atmin.modules.chat.controller;

import atmin.chat.client.UserClient;
import atmin.chat.redis.RedisChatPublisher;
import atmin.modules.chat.dto.MessageRequest;
import atmin.modules.chat.service.ChatService;
import atmin.modules.user.api.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserClient userClient;
    private final RedisChatPublisher redisChatPublisher;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        
        String email = principal.getName();
        try {
            UserDto user = userClient.getUserByEmail(email);
            if (user != null) {
                chatService.processMessage(request, user.getId(), hasSupportAccess(principal));
            }
        } catch (Exception e) {
            log.error("Error finding user by email {} in websocket send: {}", email, e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        
        String email = principal.getName();
        try {
            UserDto user = userClient.getUserByEmail(email);
            if (user != null) {
                chatService.validateConversationAccess(request.getConversationId(), user.getId(), hasSupportAccess(principal));
                redisChatPublisher.publish("/topic/conversation/" + request.getConversationId() + "/typing", user.getId());
            }
        } catch (Exception e) {
            log.error("Error finding user by email {} in websocket typing: {}", email, e.getMessage());
        }
    }

    private boolean hasSupportAccess(Principal principal) {
        if (!(principal instanceof Authentication authentication)) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("VIEW_INBOX")
                        || authority.getAuthority().equals("CREATE_INBOX"));
    }
}
