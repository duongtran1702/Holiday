package atmin.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import atmin.modules.user.entity.User;
import java.util.List;
import java.util.ArrayList;

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
        private List<String> permissions;

        public static UserInfo fromUser(User user) {
            String primaryRole = user.getRoles() != null && !user.getRoles().isEmpty()
                    ? user.getRoles().iterator().next().getName()
                    : "CUSTOMER";

            List<String> permissionsList = new ArrayList<>();
            if (user.getRoles() != null) {
                user.getRoles().forEach(role -> {
                    if (role.getPermissions() != null) {
                        role.getPermissions().forEach(p -> permissionsList.add(p.getName()));
                    }
                });
            }

            return UserInfo.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .avatarUrl(user.getAvatarUrl())
                    .phone(user.getPhoneNumber())
                    .address(user.getAddress())
                    .role(primaryRole)
                    .status(user.getStatus())
                    .authProvider(user.getAuthProvider())
                    .permissions(permissionsList)
                    .build();
        }
    }
}
