package atmin.modules.notification.service;

import atmin.modules.notification.dto.NotificationListResponse;

import java.util.List;

public interface NotificationService {
    NotificationListResponse getNotifications(); // For admin
    NotificationListResponse getMyNotifications(String userId); // For customer
    void markAsRead(List<String> notificationIds);
}
