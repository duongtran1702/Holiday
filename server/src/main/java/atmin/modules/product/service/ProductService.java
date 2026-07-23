package atmin.modules.product.service;

import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.dto.CreateProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();
    ProductDto getProductById(String id);
    ProductDto createProduct(CreateProductDto request);
    ProductDto updateProduct(String id, CreateProductDto request);
    void deleteProduct(String id);
    List<String> getAvailableColors();
}
