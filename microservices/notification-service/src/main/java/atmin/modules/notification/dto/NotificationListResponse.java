package atmin.modules.notification.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class NotificationListResponse {
    private long unresolvedCount;
    private long unreadCount;
    private List<NotificationResponse> notifications;
}
