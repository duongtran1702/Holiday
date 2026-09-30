package atmin.modules.promotion.entity;

import atmin.core.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE promotions SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Promotion extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "discount_percentage")
    private Double discountPercentage; // e.g. 10.0 for 10%

    @Column(name = "discount_amount")
    private BigDecimal discountAmount; // e.g. 50000 for 50k VND

    @Column(name = "min_order_value", nullable = false)
    private BigDecimal minOrderValue;

    @Column(nullable = false, length = 20)
    private String type; // PERCENT, FIXED

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate; // null means unlimited time

    @Column(name = "usage_limit")
    private Integer usageLimit; // null means unlimited quantity

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private Integer usedCount = 0;

    @Column(name = "target_type", nullable = false, length = 30)
    private String targetType; // CUSTOMER, AGENT, SPECIFIC_EMAILS, ALL

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
