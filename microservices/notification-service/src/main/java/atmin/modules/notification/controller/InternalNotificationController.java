package atmin.modules.notification.controller;

import atmin.modules.notification.api.NotificationInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {

    private final NotificationInternalApi notificationInternalApi;

    @PostMapping
    public void createNotification(@RequestParam("type") String type,
                                   @RequestParam("entityType") String entityType,
                                   @RequestParam("entityId") String entityId,
                                   @RequestParam("title") String title,
                                   @RequestParam("message") String message,
                                   @RequestParam("severity") String severity,
                                   @RequestParam("targetRole") String targetRole,
                                   @RequestParam("targetUserId") String targetUserId,
                                   @RequestParam("actionUrl") String actionUrl,
                                   @RequestParam(value = "metadata", required = false) String metadata) {
        notificationInternalApi.createNotification(type, entityType, entityId, title, message, severity, targetRole, targetUserId, actionUrl, metadata);
    }

    @PostMapping("/resolve")
    public void resolveNotification(@RequestParam("type") String type,
                                    @RequestParam("entityType") String entityType,
                                    @RequestParam("entityId") String entityId) {
        notificationInternalApi.resolveNotification(type, entityType, entityId);
    }
}
