package atmin.modules.notification.service;

import atmin.modules.notification.dto.NotificationListResponse;
import atmin.modules.notification.dto.NotificationResponse;
import atmin.modules.notification.entity.Notification;
import atmin.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications() {
        long unresolvedCount = notificationRepository.countByIsResolvedFalse();
        long unreadCount = notificationRepository.countByIsReadFalse();
        
        List<Notification> latestNotifications = notificationRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 50));
        
        List<NotificationResponse> responses = latestNotifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return NotificationListResponse.builder()
                .unresolvedCount(unresolvedCount)
                .unreadCount(unreadCount)
                .notifications(responses)
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(List<String> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            List<UUID> ids = notificationIds.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());
            notificationRepository.markAsRead(ids);
        }
    }
}
