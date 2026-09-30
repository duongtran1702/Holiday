package atmin.order.client;

import atmin.modules.product.api.ProductDto;
import atmin.modules.product.api.StockUpdateDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
public class ProductClientFallback implements ProductClient {

    @Override
    public ProductDto getProductById(String id) {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới product-service để lấy sản phẩm id: {}", id);
        return ProductDto.builder()
                .id(id)
                .name("Sản phẩm đang cập nhật")
                .price(BigDecimal.ZERO)
                .status("UNAVAILABLE")
                .build();
    }

    @Override
    public List<ProductDto> getProductsByIds(List<String> ids) {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới product-service để lấy danh sách sản phẩm: {}", ids);
        return Collections.emptyList();
    }

    @Override
    public List<ProductDto> getAllProducts() {
        log.warn("[Circuit Breaker Fallback] Không thể kết nối tới product-service getAllProducts");
        return Collections.emptyList();
    }

    @Override
    public void reduceStock(String productId, String variant, int quantity) {
        log.error("[Circuit Breaker Fallback] Thất bại khi giảm tồn kho qua Feign (product-service offline): productId={}, variant={}, quantity={}", productId, variant, quantity);
        throw new IllegalStateException("Hệ thống kho đang bận, vui lòng thử lại sau");
    }

    @Override
    public void reduceStockBatch(List<StockUpdateDto> stockUpdates) {
        log.error("[Circuit Breaker Fallback] Thất bại khi giảm tồn kho qua Feign (product-service offline): {}", stockUpdates);
        throw new IllegalStateException("Hệ thống kho đang bận, vui lòng thử lại sau");
    }

    @Override
    public void increaseStock(String productId, String variant, int quantity) {
        log.warn("[Circuit Breaker Fallback] Không thể gọi increaseStock tới product-service: productId={}, variant={}", productId, variant);
    }
}
