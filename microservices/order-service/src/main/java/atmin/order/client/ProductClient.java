package atmin.order.client;

import atmin.modules.product.api.ProductDto;
import atmin.modules.product.api.ProductInternalApi;
import atmin.modules.product.api.StockUpdateDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "product-service", path = "/api/v1/internal/products", fallback = ProductClientFallback.class)
public interface ProductClient extends ProductInternalApi {

    @Override
    @GetMapping("/{id}")
    ProductDto getProductById(@PathVariable("id") String id);

    @Override
    @PostMapping("/batch")
    List<ProductDto> getProductsByIds(@RequestBody List<String> ids);

    @Override
    @GetMapping("/all")
    List<ProductDto> getAllProducts();

    @Override
    @PostMapping("/reduce-stock")
    void reduceStock(@RequestParam("productId") String productId,
                     @RequestParam("variant") String variant,
                     @RequestParam("quantity") int quantity);

    @Override
    @PostMapping("/reduce-stock-batch")
    void reduceStockBatch(@RequestBody List<StockUpdateDto> stockUpdates);

    @Override
    @PostMapping("/increase-stock")
    void increaseStock(@RequestParam("productId") String productId,
                      @RequestParam("variant") String variant,
                      @RequestParam("quantity") int quantity);
}
