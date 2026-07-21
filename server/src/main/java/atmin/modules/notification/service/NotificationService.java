package atmin.modules.notification.service;

import atmin.modules.notification.dto.NotificationListResponse;

import java.util.List;

public interface NotificationService {
    NotificationListResponse getNotifications();
    void markAsRead(List<String> notificationIds);
}
