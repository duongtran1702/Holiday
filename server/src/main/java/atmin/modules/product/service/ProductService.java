package atmin.modules.product.service;

import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.dto.CreateProductDto;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    List<ProductDto> getAllProducts();
    Page<ProductDto> getProducts(String search, String category, String sort, Pageable pageable);
    ProductDto getProductById(String id);
    ProductDto createProduct(CreateProductDto request);
    ProductDto updateProduct(String id, CreateProductDto request);
    void deleteProduct(String id);
    List<String> getAvailableColors();
}
