package atmin.service;

import atmin.controller.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();
}
