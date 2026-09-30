package atmin.modules.chat.config;

import atmin.chat.client.UserClient;
import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.chat.entity.Conversation;
import atmin.modules.chat.repository.ConversationRepository;
import atmin.modules.user.api.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
@Slf4j
public class ChatSubscriptionSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private static final String CONVERSATION_TOPIC = "/topic/conversation/";
    private static final String ADMIN_TOPIC = "/topic/admin/";

    private final ConversationRepository conversationRepository;
    private final UserClient userClient;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    authorizeSubscription(accessor.getDestination(), accessor.getUser());
                }
                return message;
            }
        });
    }

    void authorizeSubscription(String destination, Principal principal) {
        if (destination == null || (!destination.startsWith(CONVERSATION_TOPIC)
                && !destination.startsWith(ADMIN_TOPIC))) {
            return;
        }
        if (!(principal instanceof Authentication authentication) || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("WebSocket chưa được xác thực");
        }

        boolean supportAccess = hasSupportAccess(authentication);
        if (destination.startsWith(ADMIN_TOPIC)) {
            if (!supportAccess) {
                throw new AccessDeniedException("Bạn không có quyền theo dõi kênh hỗ trợ");
            }
            return;
        }

        String conversationPath = destination.substring(CONVERSATION_TOPIC.length());
        String conversationId = conversationPath.contains("/")
                ? conversationPath.substring(0, conversationPath.indexOf('/'))
                : conversationPath;
        if (conversationId.isBlank()) {
            throw new AccessDeniedException("Kênh hội thoại không hợp lệ");
        }

        UserDto user = null;
        try {
            user = userClient.getUserByEmail(authentication.getName());
        } catch (Exception e) {
            log.error("Error retrieving user for websocket auth: {}", e.getMessage());
        }

        if (user == null) {
            throw new AccessDeniedException("Không tìm thấy người dùng");
        }

        String userId = user.getId();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!supportAccess && !conversation.getCustomerId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền theo dõi hội thoại này");
        }
    }

    private boolean hasSupportAccess(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("VIEW_INBOX")
                        || authority.getAuthority().equals("CREATE_INBOX"));
    }
}
