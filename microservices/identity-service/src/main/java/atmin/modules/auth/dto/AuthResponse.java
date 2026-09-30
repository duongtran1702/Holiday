package atmin.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import atmin.modules.user.entity.User;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    @JsonIgnore
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
            String primaryRole = resolvePrimaryRole(user);

            List<String> permissionsList = new ArrayList<>();
            if (user.getRoles() != null) {
                user.getRoles().forEach(role -> {
                    if (role.getPermissions() != null) {
                        role.getPermissions().forEach(p -> {
                            if (!permissionsList.contains(p.getName())) {
                                permissionsList.add(p.getName());
                            }
                        });
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

        public static String resolvePrimaryRole(User user) {
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                return "CUSTOMER";
            }

            return user.getRoles().stream()
                    .map(role -> normalizeRoleName(role.getName()))
                    .min(Comparator.comparingInt(UserInfo::rolePriority))
                    .orElse("CUSTOMER");
        }

        public static boolean isAdministrativeRole(String roleName) {
            String normalized = normalizeRoleName(roleName);
            return "ADMIN".equals(normalized) || "STAFF".equals(normalized);
        }

        private static String normalizeRoleName(String roleName) {
            if (roleName == null) {
                return "CUSTOMER";
            }
            if (roleName.equalsIgnoreCase("ADMIN")) {
                return "ADMIN";
            }
            if (roleName.equalsIgnoreCase("STAFF") || roleName.toUpperCase().startsWith("ROLE_STAFF_")) {
                return "STAFF";
            }
            if (roleName.equalsIgnoreCase("AGENT")) {
                return "AGENT";
            }
            if (roleName.equalsIgnoreCase("CUSTOMER")) {
                return "CUSTOMER";
            }
            return roleName.toUpperCase();
        }

        private static int rolePriority(String roleName) {
            return switch (roleName) {
                case "ADMIN" -> 0;
                case "STAFF" -> 1;
                case "AGENT" -> 2;
                case "CUSTOMER" -> 3;
                default -> 4;
            };
        }
    }
}
