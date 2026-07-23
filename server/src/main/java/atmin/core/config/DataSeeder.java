package atmin.core.config;

import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import atmin.modules.user.entity.Permission;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.PermissionRepository;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final PermissionRepository permissionRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String @NonNull ... args) {
        seedPermissionsAndRoles();
        seedAdminAccount();
        seedProducts();
    }

    private void seedProducts() {
        if (productRepository.count() >= 10) {
            return;
        }

        log.info("Khởi tạo 10 Sản phẩm mẫu...");

        List<Product> products = List.of(
            Product.builder()
                .id("p1")
                .name("Áo Polo Atmin Classic")
                .category("Áo")
                .price(BigDecimal.valueOf(280000.0))
                .material("Cotton piqué 100%")
                .rating(4.7)
                .reviews(128)
                .colors(Set.of("Trắng", "Đen", "Xanh Navy", "Xám"))
                .sizes(Set.of("S", "M", "L", "XL", "XXL"))
                .image("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop&auto=format")
                .badge("Bán chạy")
                .stock(Map.of("S-Trắng", 15, "M-Trắng", 22, "L-Trắng", 18, "XL-Trắng", 10, "XXL-Trắng", 5))
                .build(),
            Product.builder()
                .id("p2")
                .name("Đầm Floral Summer")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(490000.0))
                .material("Vải lụa viscose, họa tiết hoa")
                .rating(4.9)
                .reviews(87)
                .colors(Set.of("Hồng Pastel", "Xanh Mint", "Vàng Chanh"))
                .sizes(Set.of("XS", "S", "M", "L"))
                .image("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop&auto=format")
                .badge("Mới")
                .stock(Map.of("XS-Hồng Pastel", 5, "S-Hồng Pastel", 12, "M-Hồng Pastel", 8))
                .build(),
            Product.builder()
                .id("p3")
                .name("Quần Jeans Slim Fit")
                .category("Quần")
                .price(BigDecimal.valueOf(420000.0))
                .material("Denim cotton stretch 98%")
                .rating(4.5)
                .reviews(203)
                .colors(Set.of("Xanh Indigo", "Đen", "Xám nhạt"))
                .sizes(Set.of("28", "29", "30", "31", "32", "34"))
                .image("https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&auto=format")
                .badge(null)
                .stock(Map.of("28-Xanh Indigo", 8, "29-Xanh Indigo", 15, "30-Xanh Indigo", 20))
                .build(),
            Product.builder()
                .id("p4")
                .name("Áo Sơ Mi Oxford Nam")
                .category("Áo")
                .price(BigDecimal.valueOf(350000.0))
                .material("Cotton Oxford")
                .rating(4.8)
                .reviews(156)
                .colors(Set.of("Trắng", "Xanh Nhạt", "Hồng Nhạt"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=700&fit=crop&auto=format")
                .badge("Phổ biến")
                .stock(Map.of("M-Trắng", 20, "L-Trắng", 25, "M-Xanh Nhạt", 15))
                .build(),
            Product.builder()
                .id("p5")
                .name("Chân Váy Xếp Ly")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(290000.0))
                .material("Polyester pha thun")
                .rating(4.6)
                .reviews(92)
                .colors(Set.of("Đen", "Be", "Caro"))
                .sizes(Set.of("S", "M", "L"))
                .image("https://images.unsplash.com/photo-1583496661160-c588c4fa8408?w=600&h=700&fit=crop&auto=format")
                .badge(null)
                .stock(Map.of("S-Đen", 10, "M-Đen", 15, "S-Be", 12))
                .build(),
            Product.builder()
                .id("p6")
                .name("Áo Khoác Bomber")
                .category("Áo Khoác")
                .price(BigDecimal.valueOf(650000.0))
                .material("Nylon chống thấm nhẹ")
                .rating(4.7)
                .reviews(114)
                .colors(Set.of("Đen", "Xanh Rêu"))
                .sizes(Set.of("M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=700&fit=crop&auto=format")
                .badge("Best Seller")
                .stock(Map.of("M-Đen", 15, "L-Đen", 20, "M-Xanh Rêu", 10))
                .build(),
            Product.builder()
                .id("p7")
                .name("Áo Thun Cổ Tròn Basic")
                .category("Áo")
                .price(BigDecimal.valueOf(150000.0))
                .material("Cotton 100%")
                .rating(4.9)
                .reviews(310)
                .colors(Set.of("Trắng", "Đen", "Xám", "Xanh Lá"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop&auto=format")
                .badge("Giảm giá")
                .stock(Map.of("M-Trắng", 50, "L-Trắng", 45, "M-Đen", 40))
                .build(),
            Product.builder()
                .id("p8")
                .name("Quần Âu Dáng Suông")
                .category("Quần")
                .price(BigDecimal.valueOf(380000.0))
                .material("Vải Tây mềm, đứng form")
                .rating(4.5)
                .reviews(88)
                .colors(Set.of("Đen", "Ghi Xám", "Nâu Tây"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=700&fit=crop&auto=format")
                .badge(null)
                .stock(Map.of("M-Đen", 15, "L-Đen", 18, "M-Nâu Tây", 12))
                .build(),
            Product.builder()
                .id("p9")
                .name("Đầm Dạ Hội Sang Trọng")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(890000.0))
                .material("Lụa tơ tằm, ren cao cấp")
                .rating(5.0)
                .reviews(45)
                .colors(Set.of("Đỏ Rượu", "Đen Huyền Bí"))
                .sizes(Set.of("XS", "S", "M"))
                .image("https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=700&fit=crop&auto=format")
                .badge("Premium")
                .stock(Map.of("S-Đỏ Rượu", 5, "M-Đỏ Rượu", 7, "S-Đen Huyền Bí", 4))
                .build(),
            Product.builder()
                .id("p10")
                .name("Áo Len Cardigan Nữ")
                .category("Áo Khoác")
                .price(BigDecimal.valueOf(450000.0))
                .material("Len lông cừu mềm mại")
                .rating(4.8)
                .reviews(134)
                .colors(Set.of("Be", "Trắng", "Nâu Nhạt"))
                .sizes(Set.of("Freesize"))
                .image("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=700&fit=crop&auto=format")
                .badge("Mùa đông")
                .stock(Map.of("Freesize-Be", 25, "Freesize-Trắng", 15))
                .build()
        );

        productRepository.saveAll(products);
        log.info("Đã khởi tạo xong 10 Sản phẩm mẫu.");
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
