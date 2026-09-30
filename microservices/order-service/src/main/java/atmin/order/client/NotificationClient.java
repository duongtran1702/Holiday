package atmin.order.client;

import atmin.modules.notification.api.NotificationInternalApi;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "notification-service", path = "/api/v1/internal/notifications", fallback = NotificationClientFallback.class)
public interface NotificationClient extends NotificationInternalApi {

    @Override
    @PostMapping
    void createNotification(@RequestParam("type") String type,
                            @RequestParam("entityType") String entityType,
                            @RequestParam("entityId") String entityId,
                            @RequestParam("title") String title,
                            @RequestParam("message") String message,
                            @RequestParam("severity") String severity,
                            @RequestParam("targetRole") String targetRole,
                            @RequestParam("targetUserId") String targetUserId,
                            @RequestParam("actionUrl") String actionUrl,
                            @RequestParam("metadata") String metadata);

    @Override
    @PostMapping("/resolve")
    void resolveNotification(@RequestParam("type") String type,
                             @RequestParam("entityType") String entityType,
                             @RequestParam("entityId") String entityId);
}
