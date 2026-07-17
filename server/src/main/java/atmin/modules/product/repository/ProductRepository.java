package atmin.modules.product.repository;

import atmin.modules.product.entity.Product;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<Product, String> {
    @NullMarked
    @EntityGraph(attributePaths = {"colors", "sizes", "stock"})
    java.util.List<Product> findAll();
}
