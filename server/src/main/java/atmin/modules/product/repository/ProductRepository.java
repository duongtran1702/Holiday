package atmin.modules.product.repository;

import atmin.modules.product.entity.Product;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
    @NullMarked
    @EntityGraph(attributePaths = {"colors", "sizes", "stock"})
    List<Product> findAll();

    @Query("SELECT DISTINCT c FROM Product p JOIN p.colors c")
    List<String> findAllDistinctColors();
}
