package atmin.modules.chat.service;

import atmin.modules.user.api.UserInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class PresenceManager {

    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> pendingOffline = new ConcurrentHashMap<>();

    private final UserInternalApi userInternalApi;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    public void onConnect(String userId, String sessionId) {
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);

        ScheduledFuture<?> pending = pendingOffline.remove(userId);
        if (pending != null) {
            pending.cancel(false);
        }

        if (userSessions.get(userId).size() == 1) {
            setOnline(userId, true);
        }
    }

    public void onDisconnect(String userId, String sessionId) {
        Set<String> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);

                ScheduledFuture<?> task = scheduler.schedule(() -> {
                    setOnline(userId, false);
                    pendingOffline.remove(userId);
                }, 5, TimeUnit.SECONDS);

                pendingOffline.put(userId, task);
            }
        }
    }

    private void setOnline(String userId, boolean online) {
        LocalDateTime lastSeenAt = LocalDateTime.now();
        userInternalApi.updateUserPresence(userId, online, lastSeenAt);

        messagingTemplate.convertAndSend("/topic/presence", 
            (Object) Map.of("userId", userId, "online", online, "lastSeenAt", lastSeenAt.toString()));
    }

    public boolean isOnline(String userId) {
        return userSessions.containsKey(userId);
    }

    public Set<String> getOnlineUsers() {
        return userSessions.keySet();
    }
}
