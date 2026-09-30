package atmin.modules.chat.service;

import atmin.chat.redis.RedisChatPublisher;
import atmin.modules.user.api.UserInternalApi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PresenceManager {

    private static final String ONLINE_USERS_KEY = "holiday:presence:online_users";

    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> pendingOffline = new ConcurrentHashMap<>();

    private final UserInternalApi userInternalApi;
    private final RedisChatPublisher redisChatPublisher;
    private final RedisTemplate<String, Object> redisTemplate;
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
        try {
            userInternalApi.updateUserPresence(userId, online, lastSeenAt);
        } catch (Exception e) {
            log.warn("Không thể cập nhật presence tới identity-service: {}", e.getMessage());
        }

        // Cập nhật trạng thái phân tán trên Redis
        try {
            if (online) {
                redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId);
            } else {
                redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId);
            }
        } catch (Exception e) {
            log.error("Lỗi cập nhật presence Redis: {}", e.getMessage());
        }

        // Broadcast sự kiện presence qua Redis Pub/Sub cho tất cả các node
        Map<String, Object> presenceEvent = Map.of(
                "userId", userId,
                "online", online,
                "lastSeenAt", lastSeenAt.toString()
        );
        redisChatPublisher.publish("/topic/presence", presenceEvent);
    }

    public boolean isOnline(String userId) {
        try {
            Boolean isMember = redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, userId);
            return Boolean.TRUE.equals(isMember);
        } catch (Exception e) {
            return userSessions.containsKey(userId);
        }
    }

    public Set<String> getOnlineUsers() {
        try {
            Set<Object> members = redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
            if (members != null) {
                return members.stream().map(Object::toString).collect(Collectors.toSet());
            }
        } catch (Exception e) {
            log.warn("Lỗi đọc online users từ Redis, fallback sang memory: {}", e.getMessage());
        }
        return Collections.unmodifiableSet(userSessions.keySet());
    }
}
