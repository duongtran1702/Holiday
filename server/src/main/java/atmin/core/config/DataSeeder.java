package atmin.core.config;

import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final atmin.modules.user.repository.PermissionRepository permissionRepository;
    private final atmin.modules.product.repository.ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String @NonNull ... args) {
        seedPermissionsAndRoles();
        seedAdminAccount();
        seedProducts();
    }

    private void seedProducts() {
        if (!productRepository.existsById("p1")) {
            log.info("Khởi tạo Sản phẩm mẫu p1...");
            atmin.modules.product.entity.Product p1 = atmin.modules.product.entity.Product.builder()
                .id("p1")
                .name("Áo Polo Atmin Classic")
                .category("Áo")
                .price(280000.0)
                .material("Cotton piqué 100%")
                .rating(4.7)
                .reviews(128)
                .colors(java.util.Set.of("Trắng", "Đen", "Xanh Navy", "Xám"))
                .sizes(java.util.Set.of("S", "M", "L", "XL", "XXL"))
                .image("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop&auto=format")
                .badge("Bán chạy")
                .stock(java.util.Map.of("S-Trắng", 15, "M-Trắng", 22, "L-Trắng", 18, "XL-Trắng", 10,
                        "XXL-Trắng", 5))
                .build();
            productRepository.save(p1);
        }

        if (productRepository.count() > 1)
            return;

        log.info("Khởi tạo danh sách Sản phẩm mẫu khác...");

        java.util.List<atmin.modules.product.entity.Product> products = java.util.List.of(
                atmin.modules.product.entity.Product.builder()
                        .id("p2")
                        .name("Đầm Floral Summer")
                        .category("Đầm/Váy")
                        .price(490000.0)
                        .material("Vải lụa viscose, họa tiết hoa")
                        .rating(4.9)
                        .reviews(87)
                        .colors(java.util.Set.of("Hồng Pastel", "Xanh Mint", "Vàng Chanh"))
                        .sizes(java.util.Set.of("XS", "S", "M", "L"))
                        .image("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop&auto=format")
                        .badge("Mới")
                        .stock(java.util.Map.of("XS-Hồng Pastel", 5, "S-Hồng Pastel", 12, "M-Hồng Pastel", 8))
                        .build(),

                atmin.modules.product.entity.Product.builder()
                        .name("Quần Jeans Slim Fit")
                        .category("Quần")
                        .price(420000.0)
                        .material("Denim cotton stretch 98%")
                        .rating(4.5)
                        .reviews(203)
                        .colors(java.util.Set.of("Xanh Indigo", "Đen", "Xám nhạt"))
                        .sizes(java.util.Set.of("28", "29", "30", "31", "32", "34"))
                        .image("https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&auto=format")
                        .badge(null)
                        .stock(java.util.Map.of("28-Xanh Indigo", 8, "29-Xanh Indigo", 15, "30-Xanh Indigo", 20))
                        .build());

        productRepository.saveAll(products);
    }

    private void seedPermissionsAndRoles() {
        // Danh sách quyền dựa trên mockData
        String[] permissions = {
                "VIEW_PRODUCTS", "CREATE_PRODUCTS", "UPDATE_PRODUCTS", "DELETE_PRODUCTS",
                "VIEW_INVENTORY", "CREATE_INVENTORY", "UPDATE_INVENTORY",
                "VIEW_ORDERS", "CREATE_ORDERS", "UPDATE_ORDERS", "DELETE_ORDERS",
                "VIEW_AGENTS", "CREATE_AGENTS", "UPDATE_AGENTS", "DELETE_AGENTS",
                "VIEW_DEBTS", "UPDATE_DEBTS",
                "VIEW_PROMOTIONS", "CREATE_PROMOTIONS", "UPDATE_PROMOTIONS", "DELETE_PROMOTIONS",
                "VIEW_REPORTS",
                "VIEW_INBOX", "CREATE_INBOX"
        };

        Set<atmin.modules.user.entity.Permission> allPerms = new java.util.HashSet<>();
        for (String permName : permissions) {
            atmin.modules.user.entity.Permission p = permissionRepository.findByNameAndDeletedAtIsNull(permName)
                    .orElseGet(() -> {
                        log.info("Tạo Permission: {}", permName);
                        return permissionRepository.save(atmin.modules.user.entity.Permission.builder()
                                .name(permName)
                                .description("Quyền " + permName)
                                .build());
                    });
            allPerms.add(p);
        }

        // Tạo Role ADMIN và gán toàn bộ quyền
        Role adminRole = roleRepository.findByNameAndDeletedAtIsNull("ADMIN")
                .orElseGet(() -> {
                    log.info("Khởi tạo Role ADMIN...");
                    return roleRepository.save(Role.builder().name("ADMIN").build());
                });
        adminRole.setPermissions(allPerms);
        roleRepository.save(adminRole);

        // Khởi tạo các Role cơ bản khác nếu chưa có
        for (String roleName : new String[] { "STAFF", "CUSTOMER", "AGENT" }) {
            roleRepository.findByNameAndDeletedAtIsNull(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        }
    }

    private void seedAdminAccount() {
        Role adminRole = roleRepository.findByNameAndDeletedAtIsNull("ADMIN").orElseThrow();

        String adminEmail = "duong170226@gmail.com";
        if (!userRepository.existsByEmailAndDeletedAtIsNull(adminEmail)) {
            log.info("Khởi tạo tài khoản Admin mặc định (duong170226@gmail.com / admin123)...");
            User adminUser = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản Trị Viên")
                    .phoneNumber("0822817206")
                    .status("active")
                    .isEnabled(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(adminUser);
        }
    }
}
