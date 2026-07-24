package atmin.modules.product.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.product.dto.CreateProductDto;
import atmin.modules.product.dto.ProductDto;
import atmin.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", productService.getProducts(search, category, sort, pageable)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('VIEW_PRODUCTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        return ResponseEntity.ok(ApiResponse.success("Lấy tất cả sản phẩm thành công", productService.getAllProducts()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PRODUCTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@RequestBody CreateProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", productService.createProduct(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PRODUCTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable String id, @RequestBody CreateProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", productService.updateProduct(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_PRODUCTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @GetMapping("/colors")
    public ResponseEntity<List<String>> getAvailableColors() {
        return ResponseEntity.ok(productService.getAvailableColors());
    }
}
