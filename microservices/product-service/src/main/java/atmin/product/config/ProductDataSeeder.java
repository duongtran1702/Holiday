package atmin.product.config;

import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("===> product-service đã có dữ liệu sản phẩm, bỏ qua seeder.");
            return;
        }

        log.info("===> Khởi tạo 10 sản phẩm mẫu cho product-service...");

        List<Product> products = List.of(
            Product.builder()
                .name("Áo Polo Atmin Classic")
                .category("Áo")
                .price(BigDecimal.valueOf(280000))
                .material("Cotton piqué 100%")
                .rating(4.7)
                .reviews(128)
                .colors(Set.of("Trắng", "Đen", "Xanh Navy", "Xám"))
                .sizes(Set.of("S", "M", "L", "XL", "XXL"))
                .image("https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=700&fit=crop&auto=format")
                .badge("Bán chạy")
                .status("ACTIVE")
                .stock(Map.of("S-Trắng", 15, "M-Trắng", 22, "L-Trắng", 18, "XL-Trắng", 10, "M-Đen", 20))
                .build(),
            Product.builder()
                .name("Đầm Floral Summer")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(490000))
                .material("Vải lụa viscose, họa tiết hoa")
                .rating(4.9)
                .reviews(87)
                .colors(Set.of("Hồng Pastel", "Xanh Mint", "Vàng Chanh"))
                .sizes(Set.of("XS", "S", "M", "L"))
                .image("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop&auto=format")
                .badge("Mới")
                .status("ACTIVE")
                .stock(Map.of("XS-Hồng Pastel", 5, "S-Hồng Pastel", 12, "M-Hồng Pastel", 8, "S-Xanh Mint", 10))
                .build(),
            Product.builder()
                .name("Quần Jeans Slim Fit")
                .category("Quần")
                .price(BigDecimal.valueOf(420000))
                .material("Denim cotton stretch 98%")
                .rating(4.5)
                .reviews(203)
                .colors(Set.of("Xanh Indigo", "Đen", "Xám nhạt"))
                .sizes(Set.of("28", "29", "30", "31", "32", "34"))
                .image("https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=700&fit=crop&auto=format")
                .badge("Hot")
                .status("ACTIVE")
                .stock(Map.of("28-Xanh Indigo", 8, "29-Xanh Indigo", 15, "30-Xanh Indigo", 20, "31-Đen", 14))
                .build(),
            Product.builder()
                .name("Áo Sơ Mi Oxford Nam")
                .category("Áo")
                .price(BigDecimal.valueOf(350000))
                .material("Cotton Oxford")
                .rating(4.8)
                .reviews(156)
                .colors(Set.of("Trắng", "Xanh Nhạt", "Hồng Nhạt"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=700&fit=crop&auto=format")
                .badge("Phổ biến")
                .status("ACTIVE")
                .stock(Map.of("M-Trắng", 20, "L-Trắng", 25, "M-Xanh Nhạt", 15, "L-Xanh Nhạt", 12))
                .build(),
            Product.builder()
                .name("Chân Váy Xếp Ly")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(290000))
                .material("Polyester pha thun")
                .rating(4.6)
                .reviews(92)
                .colors(Set.of("Đen", "Be", "Caro"))
                .sizes(Set.of("S", "M", "L"))
                .image("https://images.unsplash.com/photo-1583496661160-c588c4fa8408?w=600&h=700&fit=crop&auto=format")
                .badge("Thanh lịch")
                .status("ACTIVE")
                .stock(Map.of("S-Đen", 10, "M-Đen", 15, "S-Be", 12, "M-Be", 14))
                .build(),
            Product.builder()
                .name("Áo Khoác Bomber Streetwear")
                .category("Áo Khoác")
                .price(BigDecimal.valueOf(650000))
                .material("Nylon chống thấm nhẹ")
                .rating(4.7)
                .reviews(114)
                .colors(Set.of("Đen", "Xanh Rêu"))
                .sizes(Set.of("M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=700&fit=crop&auto=format")
                .badge("Best Seller")
                .status("ACTIVE")
                .stock(Map.of("M-Đen", 15, "L-Đen", 20, "M-Xanh Rêu", 10, "L-Xanh Rêu", 8))
                .build(),
            Product.builder()
                .name("Áo Thun Cổ Tròn Basic")
                .category("Áo")
                .price(BigDecimal.valueOf(150000))
                .material("Cotton 100%")
                .rating(4.9)
                .reviews(310)
                .colors(Set.of("Trắng", "Đen", "Xám", "Xanh Lá"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop&auto=format")
                .badge("Ưa chuộng")
                .status("ACTIVE")
                .stock(Map.of("M-Trắng", 50, "L-Trắng", 45, "M-Đen", 40, "L-Đen", 35))
                .build(),
            Product.builder()
                .name("Quần Âu Dáng Suông")
                .category("Quần")
                .price(BigDecimal.valueOf(380000))
                .material("Vải Tây mềm, đứng form")
                .rating(4.5)
                .reviews(88)
                .colors(Set.of("Đen", "Ghi Xám", "Nâu Tây"))
                .sizes(Set.of("S", "M", "L", "XL"))
                .image("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=700&fit=crop&auto=format")
                .badge("Công sở")
                .status("ACTIVE")
                .stock(Map.of("M-Đen", 15, "L-Đen", 18, "M-Nâu Tây", 12, "L-Nâu Tây", 10))
                .build(),
            Product.builder()
                .name("Đầm Dạ Hội Sang Trọng")
                .category("Đầm/Váy")
                .price(BigDecimal.valueOf(890000))
                .material("Lụa tơ tằm, ren cao cấp")
                .rating(5.0)
                .reviews(45)
                .colors(Set.of("Đỏ Rượu", "Đen Huyền Bí"))
                .sizes(Set.of("XS", "S", "M"))
                .image("https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=700&fit=crop&auto=format")
                .badge("Premium")
                .status("ACTIVE")
                .stock(Map.of("S-Đỏ Rượu", 5, "M-Đỏ Rượu", 7, "S-Đen Huyền Bí", 4, "M-Đen Huyền Bí", 6))
                .build(),
            Product.builder()
                .name("Áo Len Cardigan Nữ")
                .category("Áo Khoác")
                .price(BigDecimal.valueOf(450000))
                .material("Len lông cừu mềm mại")
                .rating(4.8)
                .reviews(134)
                .colors(Set.of("Be", "Trắng", "Nâu Nhạt"))
                .sizes(Set.of("Freesize"))
                .image("https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=700&fit=crop&auto=format")
                .badge("Mùa đông")
                .status("ACTIVE")
                .stock(Map.of("Freesize-Be", 25, "Freesize-Trắng", 15, "Freesize-Nâu Nhạt", 18))
                .build()
        );

        productRepository.saveAll(products);
        log.info("===> Đã nạp thành công 10 sản phẩm mẫu vào database holiday_product!");
    }
}
