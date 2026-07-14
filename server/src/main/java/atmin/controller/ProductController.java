package atmin.controller;

import atmin.common.response.ApiResponse;
import atmin.controller.dto.ProductDto;
import atmin.service.ProductService;
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
}
