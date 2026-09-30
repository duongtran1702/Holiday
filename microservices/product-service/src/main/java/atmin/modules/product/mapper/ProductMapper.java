package atmin.modules.product.mapper;

import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.entity.Product;
import org.springframework.stereotype.Component;

@Component
@SuppressWarnings("unused")
public class ProductMapper {
    public ProductDto toDto(Product product) {
        if (product == null) {
            return null;
        }
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