package atmin.modules.product.controller;

import atmin.modules.product.api.ProductDto;
import atmin.modules.product.api.ProductInternalApi;
import atmin.modules.product.api.StockUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/products")
@RequiredArgsConstructor
public class InternalProductController {

    private final ProductInternalApi productInternalApi;

    @GetMapping("/{id}")
    public ProductDto getProductById(@PathVariable String id) {
        return productInternalApi.getProductById(id);
    }

    @GetMapping("/all")
    public List<ProductDto> getAllProducts() {
        return productInternalApi.getAllProducts();
    }

    @PostMapping("/batch")
    public List<ProductDto> getProductsByIds(@RequestBody List<String> ids) {
        return productInternalApi.getProductsByIds(ids);
    }

    @PostMapping("/reduce-stock-batch")
    public void reduceStockBatch(@RequestBody List<StockUpdateDto> stockUpdates) {
        productInternalApi.reduceStockBatch(stockUpdates);
    }

    @PostMapping("/increase-stock")
    public void increaseStock(@RequestParam String productId,
                              @RequestParam String variant,
                              @RequestParam int quantity) {
        productInternalApi.increaseStock(productId, variant, quantity);
    }
}
