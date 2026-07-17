package atmin.modules.product.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private String id;
    private String name;
    private String category;
    private Double price;
    private String material;
    private Double rating;
    private Integer reviews;
    private String image;
    private String badge;
    private Set<String> colors;
    private Set<String> sizes;
    private Map<String, Integer> stock;
}
