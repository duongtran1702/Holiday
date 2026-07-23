package atmin.modules.product.api;

import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductInternalApiImpl implements ProductInternalApi {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return mapToDto(product);
    }

    @Override
    @Transactional
    public void reduceStock(String productId, String variant, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        if (product.getStock() != null && product.getStock().containsKey(variant)) {
            int currentStock = product.getStock().get(variant);
            if (currentStock >= quantity) {
                product.getStock().put(variant, currentStock - quantity);
                productRepository.save(product);
            } else {
                throw new RuntimeException("Số lượng tồn kho không đủ cho phân loại: " + variant);
            }
        }
    }

    private ProductDto mapToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .material(product.getMaterial())
                .rating(product.getRating())
                .reviews(product.getReviews())
                .image(product.getImage())
                .badge(product.getBadge())
                .colors(product.getColors())
                .sizes(product.getSizes())
                .stock(product.getStock())
                .build();
    }
}
