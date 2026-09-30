package atmin.modules.chat.controller;

import atmin.chat.client.UserClient;
import atmin.common.exception.ResourceNotFoundException;
import atmin.common.response.ApiResponse;
import atmin.modules.chat.dto.ConversationDTO;
import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.dto.MessageRequest;
import atmin.modules.chat.service.ChatService;
import atmin.modules.chat.service.PresenceManager;
import atmin.modules.user.api.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserClient userClient;
    private final PresenceManager presenceManager;

    private String resolveUserId(String headerUserId, Authentication authentication) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (authentication != null && authentication.getName() != null) {
            UserDto user = userClient.getUserByEmail(authentication.getName());
            if (user != null) {
                return user.getId();
            }
        }
        throw new ResourceNotFoundException("User not found");
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<ConversationDTO>> startConversation(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String customerId = resolveUserId(headerUserId, authentication);
        ConversationDTO conversation = chatService.startOrGetConversation(customerId);
        return ResponseEntity.ok(ApiResponse.success("Thành công", conversation));
    }

    @GetMapping("/my-conversations")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getMyConversations(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String customerId = resolveUserId(headerUserId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Thành công", chatService.getMyConversations(customerId)));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAuthority('VIEW_INBOX') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ConversationDTO>>> getAllConversations(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String adminId = resolveUserId(headerUserId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Thành công", chatService.getAllConversations(adminId)));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        return ResponseEntity.ok(ApiResponse.success("Thành công",
                chatService.getMessages(conversationId, cursor, limit, userId, hasSupportAccess(authentication))));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        chatService.markAsRead(conversationId, userId, hasSupportAccess(authentication));
        return ResponseEntity.ok(ApiResponse.success("Thành công", null));
    }

    @PostMapping("/{conversationId}/bot-reply")
    @PreAuthorize("hasAuthority('CREATE_INBOX') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MessageDTO>> sendBotReply(
            @PathVariable String conversationId,
            @RequestBody MessageRequest request) {
        request.setConversationId(conversationId);
        MessageDTO messageDTO = chatService.processMessage(request, "bot", true);
        return ResponseEntity.ok(ApiResponse.success("Thành công", messageDTO));
    }

    @GetMapping("/presence")
    @PreAuthorize("hasAuthority('VIEW_INBOX') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Set<String>>> getOnlineUsers() {
        return ResponseEntity.ok(ApiResponse.success("Thành công", presenceManager.getOnlineUsers()));
    }

    private boolean hasSupportAccess(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("VIEW_INBOX")
                        || authority.getAuthority().equals("CREATE_INBOX"));
    }
}
