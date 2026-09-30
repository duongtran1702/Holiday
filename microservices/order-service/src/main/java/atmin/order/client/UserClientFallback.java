package atmin.order.client;

import atmin.modules.user.api.UserDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
public class UserClientFallback implements UserClient {

    @Override
    public UserDto getUserById(String id) {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới identity-service để lấy user id: {}", id);
        return UserDto.builder()
                .id(id)
                .fullName("Khách hàng hệ thống (Offline)")
                .email("offline@holiday.local")
                .status("ACTIVE")
                .roles(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Override
    public UserDto getUserByEmail(String email) {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới identity-service để lấy user email: {}", email);
        return UserDto.builder()
                .email(email)
                .fullName("Khách hàng hệ thống (Offline)")
                .status("ACTIVE")
                .roles(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Override
    public List<UserDto> getUsersByIds(List<String> ids) {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới identity-service để lấy danh sách user: {}", ids);
        return Collections.emptyList();
    }

    @Override
    public List<UserDto> getAllUsers() {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới identity-service getAllUsers");
        return Collections.emptyList();
    }
}
