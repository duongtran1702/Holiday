package atmin.modules.product.entity;
import atmin.core.base.BaseEntity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Product extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    private String name;
    private String category;
    private BigDecimal price;
    private String material;
    private Double rating;
    private Integer reviews;
    private String image;
    private String badge;
    private String status = "ACTIVE"; // DRAFT, ACTIVE, OUT_OF_STOCK

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private java.util.Set<String> colors;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "size")
    private java.util.Set<String> sizes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_stocks", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "variant")
    @Column(name = "quantity")
    private Map<String, Integer> stock;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
