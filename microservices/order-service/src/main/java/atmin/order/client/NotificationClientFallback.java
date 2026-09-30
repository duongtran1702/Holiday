package atmin.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {

    @Override
    public void createNotification(String type, String entityType, String entityId,
                                   String title, String message, String severity,
                                   String targetRole, String targetUserId,
                                   String actionUrl, String metadata) {
        log.warn("[Circuit Breaker Fallback] notification-service không phản hồi. Bỏ qua gửi thông báo: type={}, entityId={}", type, entityId);
    }

    @Override
    public void resolveNotification(String type, String entityType, String entityId) {
        log.warn("[Circuit Breaker Fallback] notification-service không phản hồi khi resolveNotification: type={}, entityId={}", type, entityId);
    }
}
