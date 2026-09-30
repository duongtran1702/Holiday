package atmin.modules.notification.controller;

import atmin.modules.notification.sse.SseNotificationService;
import atmin.modules.user.api.UserDto;
import atmin.notification.client.UserClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationSseController {

    private final SseNotificationService sseNotificationService;
    private final UserClient userClient;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @RequestParam(value = "userId", required = false) String paramUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Roles", required = false) String headerRoles,
            Authentication authentication) {

        String userId = resolveUserId(paramUserId, headerUserId, authentication);
        boolean isAdmin = resolveIsAdmin(headerRoles, authentication);

        log.info("Khởi tạo luồng SSE cho userId={}, isAdmin={}", userId, isAdmin);
        return sseNotificationService.subscribe(userId, isAdmin);
    }

    private String resolveUserId(String paramUserId, String headerUserId, Authentication authentication) {
        if (paramUserId != null && !paramUserId.isBlank()) {
            return paramUserId;
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (authentication != null && authentication.getName() != null) {
            try {
                UserDto user = userClient.getUserByEmail(authentication.getName());
                if (user != null) {
                    return user.getId();
                }
            } catch (Exception e) {
                log.warn("Không thể lấy user từ email trong SSE: {}", e.getMessage());
            }
        }
        return "anonymous";
    }

    private boolean resolveIsAdmin(String headerRoles, Authentication authentication) {
        if (headerRoles != null && (headerRoles.contains("ADMIN") || headerRoles.contains("ROLE_ADMIN"))) {
            return true;
        }
        if (authentication != null) {
            return authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
        }
        return false;
    }
}
