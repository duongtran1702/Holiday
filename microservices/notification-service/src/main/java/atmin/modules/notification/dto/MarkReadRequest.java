package atmin.modules.notification.dto;

import lombok.Data;
import java.util.List;

@Data
public class MarkReadRequest {
    private List<String> notificationIds;
}
