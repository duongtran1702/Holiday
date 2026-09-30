package atmin.modules.product.service;

import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.dto.CreateProductDto;
import atmin.modules.product.entity.Product;
import atmin.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ProductDto> getProducts(String search, String category, String sort, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));
            
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("Tất cả")) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        if (sort != null && !sort.trim().isEmpty()) {
            Sort springSort = Sort.unsorted();
            switch (sort) {
                case "Giá tăng":
                    springSort = Sort.by("price").ascending();
                    break;
                case "Giá giảm":
                    springSort = Sort.by("price").descending();
                    break;
                case "Đánh giá":
                    springSort = Sort.by("rating").descending();
                    break;
                case "Mới nhất":
                default:
                    springSort = Sort.by("createdAt").descending();
                    break;
            }
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), springSort);
        }

        Page<Product> page = productRepository.findAll(spec, pageable);
        return page.map(this::mapToDto);
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
        product.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
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
                .status(product.getStatus())
                .colors(product.getColors())
                .sizes(product.getSizes())
                .stock(product.getStock())
                .build();
    }
}
