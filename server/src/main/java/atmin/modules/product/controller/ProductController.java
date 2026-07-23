package atmin.modules.product.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", productService.getAllProducts()));
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@org.springframework.web.bind.annotation.RequestBody atmin.modules.product.dto.CreateProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", productService.createProduct(dto)));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@org.springframework.web.bind.annotation.PathVariable String id, @org.springframework.web.bind.annotation.RequestBody atmin.modules.product.dto.CreateProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", productService.updateProduct(id, dto)));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@org.springframework.web.bind.annotation.PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @GetMapping("/colors")
    public ResponseEntity<List<String>> getAvailableColors() {
        return ResponseEntity.ok(productService.getAvailableColors());
    }
}
