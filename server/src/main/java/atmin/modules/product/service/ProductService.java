package atmin.modules.product.service;

import atmin.modules.product.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();
}
