package atmin.modules.product.api;

public interface ProductInternalApi {
    ProductDto getProductById(String id);
    void reduceStock(String productId, String variant, int quantity);
}
