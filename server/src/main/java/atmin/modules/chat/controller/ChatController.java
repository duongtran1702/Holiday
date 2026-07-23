package atmin.modules.chat.controller;

import atmin.common.response.ApiResponse;
import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.chat.dto.ConversationDTO;
import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.service.ChatService;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private String resolveUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<ConversationDTO>> startConversation(Authentication authentication) {
        String customerId = resolveUserId(authentication);
        ConversationDTO conversation = chatService.startOrGetConversation(customerId);
        return ResponseEntity.ok(ApiResponse.success("Thành công", conversation));
    }

    @GetMapping("/my-conversations")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getMyConversations(Authentication authentication) {
        String customerId = resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Thành công", chatService.getMyConversations(customerId)));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getAllConversations(Authentication authentication) {
        String adminId = resolveUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Thành công", chatService.getAllConversations(adminId)));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", chatService.getMessages(conversationId, cursor, limit)));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String conversationId,
            Authentication authentication) {
        String userId = "user";
        if (authentication != null) {
            userId = resolveUserId(authentication);
        }
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success("Thành công", null));
    }

    @PostMapping("/{conversationId}/bot-reply")
    public ResponseEntity<ApiResponse<MessageDTO>> sendBotReply(
            @PathVariable String conversationId,
            @RequestBody atmin.modules.chat.dto.MessageRequest request) {
        request.setConversationId(conversationId);
        MessageDTO messageDTO = chatService.processMessage(request, "bot");
        return ResponseEntity.ok(ApiResponse.success("Thành công", messageDTO));
    }

    @GetMapping("/presence")
    public ResponseEntity<ApiResponse<java.util.Set<String>>> getOnlineUsers(@org.springframework.beans.factory.annotation.Autowired atmin.modules.chat.service.PresenceManager presenceManager) {
        return ResponseEntity.ok(ApiResponse.success("Thành công", presenceManager.getOnlineUsers()));
    }
}
