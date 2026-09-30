package atmin.modules.notification.api;

public interface NotificationInternalApi {
    void createNotification(String type, String entityType, String entityId, String title, String message, String severity, String targetRole, String targetUserId, String actionUrl, String metadata);
    void resolveNotification(String type, String entityType, String entityId);
}
