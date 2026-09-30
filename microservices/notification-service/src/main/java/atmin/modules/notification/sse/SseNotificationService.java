package atmin.modules.notification.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseNotificationService {

    private static final Long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 phút

    private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe(String userId, boolean isAdmin) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        if (isAdmin) {
            adminEmitters.add(emitter);
            emitter.onCompletion(() -> adminEmitters.remove(emitter));
            emitter.onTimeout(() -> adminEmitters.remove(emitter));
            emitter.onError(e -> adminEmitters.remove(emitter));
            log.info("Admin {} đã đăng ký luồng SSE Notifications. Tổng số Admin online: {}", userId, adminEmitters.size());
        }

        if (userId != null && !userId.isBlank()) {
            userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
            emitter.onCompletion(() -> removeUserEmitter(userId, emitter));
            emitter.onTimeout(() -> removeUserEmitter(userId, emitter));
            emitter.onError(e -> removeUserEmitter(userId, emitter));
            log.info("User {} đã đăng ký luồng SSE Notifications.", userId);
        }

        // Gửi gói tin ping đầu tiên để hoàn tất kết nối
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Kết nối thành công tới luồng Real-time SSE"));
        } catch (IOException e) {
            log.error("Lỗi khi gửi kết nối ban đầu SSE cho user {}: {}", userId, e.getMessage());
        }

        return emitter;
    }

    public void sendToUser(String userId, Object data) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null && !emitters.isEmpty()) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("NOTIFICATION")
                            .data(data));
                } catch (IOException e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        }
    }

    public void sendToAdmin(Object data) {
        if (!adminEmitters.isEmpty()) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : adminEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("ADMIN_NOTIFICATION")
                            .data(data));
                } catch (IOException e) {
                    deadEmitters.add(emitter);
                }
            }
            adminEmitters.removeAll(deadEmitters);
        }
    }

    public void broadcast(Object data) {
        sendToAdmin(data);
        userEmitters.keySet().forEach(userId -> sendToUser(userId, data));
    }

    private void removeUserEmitter(String userId, SseEmitter emitter) {
        List<SseEmitter> list = userEmitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }
}
