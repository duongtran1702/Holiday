package atmin.core.config;

import atmin.modules.user.entity.Permission;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.PermissionRepository;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class IdentityDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("===> Kiểm tra và nạp dữ liệu ban đầu cho identity-service...");
        seedPermissionsAndRoles();
        seedAdminAndSampleUsers();
        log.info("===> Hoàn thành nạp dữ liệu ban đầu cho identity-service!");
    }

    private void seedPermissionsAndRoles() {
        String[] permissions = {
                "VIEW_PRODUCTS", "CREATE_PRODUCTS", "UPDATE_PRODUCTS", "DELETE_PRODUCTS",
                "VIEW_INVENTORY", "CREATE_INVENTORY", "UPDATE_INVENTORY",
                "VIEW_ORDERS", "CREATE_ORDERS", "UPDATE_ORDERS", "DELETE_ORDERS",
                "VIEW_AGENTS", "CREATE_AGENTS", "UPDATE_AGENTS", "DELETE_AGENTS",
                "VIEW_DEBTS", "UPDATE_DEBTS",
                "VIEW_PROMOTIONS", "CREATE_PROMOTIONS", "UPDATE_PROMOTIONS", "DELETE_PROMOTIONS",
                "VIEW_REPORTS",
                "VIEW_INBOX", "CREATE_INBOX",
                "VIEW_USERS", "CREATE_USERS", "UPDATE_USERS", "DELETE_USERS"
        };

        Set<Permission> allPerms = new HashSet<>();
        for (String permName : permissions) {
            Permission p = permissionRepository.findByNameAndDeletedAtIsNull(permName)
                    .orElseGet(() -> {
                        log.info("Tạo Permission: {}", permName);
                        return permissionRepository.save(Permission.builder()
                                .name(permName)
                                .description("Quyền " + permName)
                                .build());
                    });
            allPerms.add(p);
        }

        // Tạo Role ADMIN với toàn quyền
        Role adminRole = roleRepository.findByNameAndDeletedAtIsNull("ADMIN")
                .orElseGet(() -> {
                    log.info("Khởi tạo Role ADMIN...");
                    return roleRepository.save(Role.builder().name("ADMIN").build());
                });
        adminRole.setPermissions(allPerms);
        roleRepository.save(adminRole);

        // Khởi tạo các Role khác: STAFF, CUSTOMER, AGENT
        for (String roleName : new String[] { "STAFF", "CUSTOMER", "AGENT" }) {
            roleRepository.findByNameAndDeletedAtIsNull(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        }
    }

    private void seedAdminAndSampleUsers() {
        Role adminRole = roleRepository.findByNameAndDeletedAtIsNull("ADMIN").orElseThrow();
        Role customerRole = roleRepository.findByNameAndDeletedAtIsNull("CUSTOMER").orElseThrow();

        // Tài khoản Admin mẫu: admin@holiday.com / Admin@123
        createOrUpdateAdmin("admin@holiday.com", "Admin@123", "Quản Trị Viên", "0900000001", adminRole);

        // Tài khoản Khách hàng mẫu: customer@holiday.com / customer123
        if (!userRepository.existsByEmailAndDeletedAtIsNull("customer@holiday.com")) {
            User customerUser = User.builder()
                    .email("customer@holiday.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Nguyễn Văn Khách")
                    .phoneNumber("0987654321")
                    .address("123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh")
                    .status("active")
                    .isEnabled(true)
                    .roles(Set.of(customerRole))
                    .build();
            userRepository.save(customerUser);
            log.info("Đã tạo tài khoản Khách hàng mẫu: customer@holiday.com / customer123");
        }
    }

    private void createOrUpdateAdmin(String email, String rawPassword, String fullName, String phone, Role adminRole) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phoneNumber(phone)
                    .address("Trung tâm điều hành Holiday, TP. Hồ Chí Minh")
                    .status("active")
                    .isEnabled(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(user);
            log.info("Đã khởi tạo tài khoản Admin chính: {} / {}", email, rawPassword);
        } else {
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRoles(Set.of(adminRole));
            user.setStatus("active");
            user.setIsEnabled(true);
            userRepository.save(user);
            log.info("Đã đồng bộ mật khẩu Admin chính: {} / {}", email, rawPassword);
        }
    }
}
