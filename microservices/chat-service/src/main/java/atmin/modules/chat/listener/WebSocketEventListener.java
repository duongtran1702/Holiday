package atmin.modules.chat.listener;

import atmin.modules.chat.service.PresenceManager;
import atmin.modules.user.api.UserInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final PresenceManager presenceManager;
    private final UserInternalApi userInternalApi;

    @EventListener
    public void handleConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = extractUserId(accessor);
        if (userId != null) {
            presenceManager.onConnect(userId, accessor.getSessionId());
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = extractUserId(accessor);
        if (userId != null) {
            presenceManager.onDisconnect(userId, accessor.getSessionId());
        }
    }

    private String extractUserId(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal != null) {
            String email = principal.getName();
            try {
                return userInternalApi.getUserByEmail(email).getId();
            } catch (Exception e) {
                // Ignore or log error
            }
        }
        return null;
    }
}
