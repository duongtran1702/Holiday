package atmin.controller.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken;
    private UserInfo user;
    private boolean require2fa;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String phone;
        private String address;
        private String role;
        private String status;
        private String authProvider;
        private java.util.List<String> permissions;
    }
}
