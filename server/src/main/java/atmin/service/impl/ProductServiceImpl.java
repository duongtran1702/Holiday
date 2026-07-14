package atmin.service.impl;

import atmin.controller.dto.ProductDto;
import atmin.entity.Product;
import atmin.repository.ProductRepository;
import atmin.service.ProductService;
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
