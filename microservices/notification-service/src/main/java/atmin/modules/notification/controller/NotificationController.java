package atmin.modules.notification.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.notification.dto.MarkReadRequest;
import atmin.modules.notification.dto.NotificationListResponse;
import atmin.modules.notification.service.NotificationService;
import atmin.modules.user.api.UserDto;
import atmin.notification.client.UserClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserClient userClient;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications() {
        NotificationListResponse response = notificationService.getNotifications();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo thành công", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<NotificationListResponse>> getMyNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        NotificationListResponse response = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thông báo của tôi thành công", response));
    }

    @PutMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @RequestBody MarkReadRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            Authentication authentication) {
        String userId = resolveUserId(headerUserId, authentication);
        boolean canManageAdminNotifications = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("VIEW_REPORTS"));
        notificationService.markAsRead(request.getNotificationIds(), userId, canManageAdminNotifications);
        return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đọc thành công", null));
    }

    private String resolveUserId(String headerUserId, Authentication authentication) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (authentication != null && authentication.getName() != null) {
            UserDto user = userClient.getUserByEmail(authentication.getName());
            if (user != null) {
                return user.getId();
            }
        }
        throw new IllegalArgumentException("Không tìm thấy thông tin người dùng đang đăng nhập");
    }
}
