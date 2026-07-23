package atmin.modules.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductDto {
    private String name;
    private String category;
    private BigDecimal price;
    private String material;
    private Double rating;
    private Integer reviews;
    private String image;
    private String badge;
    private Set<String> colors;
    private Set<String> sizes;
    private Map<String, Integer> stock;
}
