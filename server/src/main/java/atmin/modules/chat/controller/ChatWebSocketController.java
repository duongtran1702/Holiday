package atmin.modules.chat.controller;

import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.dto.MessageRequest;
import atmin.modules.chat.service.ChatService;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        
        String email = principal.getName();
        String senderId = userRepository.findByEmailAndDeletedAtIsNull(email)
                .map(User::getId)
                .orElse(null);
                
        if (senderId != null) {
            chatService.processMessage(request, senderId);
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        
        String email = principal.getName();
        String senderId = userRepository.findByEmailAndDeletedAtIsNull(email)
                .map(User::getId)
                .orElse(null);
                
        if (senderId != null) {
            messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId() + "/typing", senderId);
        }
    }
}
