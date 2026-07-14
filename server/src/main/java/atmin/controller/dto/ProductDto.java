package atmin.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

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
    private java.util.Set<String> colors;
    private java.util.Set<String> sizes;
    private Map<String, Integer> stock;
}
