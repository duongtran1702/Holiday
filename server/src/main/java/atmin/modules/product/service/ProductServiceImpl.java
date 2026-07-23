package atmin.modules.product.service;

import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.dto.CreateProductDto;
import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDto(product);
    }

    @Override
    public ProductDto createProduct(CreateProductDto dto) {
        Product product = new Product();
        mapToEntity(dto, product);
        Product savedProduct = productRepository.save(product);
        return mapToDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(String id, CreateProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        mapToEntity(dto, product);
        Product updatedProduct = productRepository.save(product);
        return mapToDto(updatedProduct);
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    @Override
    public List<String> getAvailableColors() {
        return productRepository.findAllDistinctColors();
    }

    private void mapToEntity(CreateProductDto dto, Product product) {
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setPrice(dto.getPrice());
        product.setMaterial(dto.getMaterial());
        product.setRating(dto.getRating() != null ? dto.getRating() : 0.0);
        product.setReviews(dto.getReviews() != null ? dto.getReviews() : 0);
        product.setImage(dto.getImage());
        product.setBadge(dto.getBadge());
        product.setColors(dto.getColors());
        product.setSizes(dto.getSizes());
        product.setStock(dto.getStock());
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
