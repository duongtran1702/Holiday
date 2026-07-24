package atmin.modules.product.api;

import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    @Transactional(readOnly = true)
    public List<ProductDto> getProductsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return productRepository.findAllById(ids).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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

    @Override
    @Transactional
    public void reduceStockBatch(List<StockUpdateDto> stockUpdates) {
        if (stockUpdates == null || stockUpdates.isEmpty()) return;
        
        List<String> productIds = stockUpdates.stream()
                .map(StockUpdateDto::getProductId)
                .distinct()
                .collect(Collectors.toList());
                
        List<Product> products = productRepository.findAllById(productIds);
        Map<String, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
                
        for (StockUpdateDto update : stockUpdates) {
            Product product = productMap.get(update.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found: " + update.getProductId());
            }
            
            String variant = update.getVariant();
            if (product.getStock() != null && product.getStock().containsKey(variant)) {
                int currentStock = product.getStock().get(variant);
                if (currentStock >= update.getQuantity()) {
                    product.getStock().put(variant, currentStock - update.getQuantity());
                } else {
                    throw new RuntimeException("Số lượng tồn kho không đủ cho phân loại: " + variant);
                }
            }
        }
        
        productRepository.saveAll(products);
    }

    @Override
    @Transactional
    public void increaseStock(String productId, String variant, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        if (product.getStock() == null) {
            product.setStock(new java.util.HashMap<>());
        }
        int currentStock = product.getStock().getOrDefault(variant, 0);
        product.getStock().put(variant, currentStock + quantity);
        productRepository.save(product);
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
