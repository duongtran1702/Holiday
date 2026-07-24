package atmin.modules.product.api;

import java.util.List;

public interface ProductInternalApi {
    ProductDto getProductById(String id);
    List<ProductDto> getProductsByIds(List<String> ids);
    
    void reduceStock(String productId, String variant, int quantity);
    void reduceStockBatch(List<StockUpdateDto> stockUpdates);
    
    void increaseStock(String productId, String variant, int quantity);
}
