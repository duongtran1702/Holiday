package atmin.modules.notification.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.notification.dto.MarkReadRequest;
import atmin.modules.notification.dto.NotificationListResponse;
import atmin.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import atmin.modules.user.entity.User;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications() {
        NotificationListResponse response = notificationService.getNotifications();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo thành công", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getMyNotifications(Authentication authentication) {
        String userId = ((User) authentication.getPrincipal()).getId();
        NotificationListResponse response = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo của tôi thành công", response));
    }

    @PutMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@RequestBody MarkReadRequest request) {
        notificationService.markAsRead(request.getNotificationIds());
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc thành công", null));
    }
}
