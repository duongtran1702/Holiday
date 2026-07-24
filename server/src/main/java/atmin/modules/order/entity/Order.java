package atmin.modules.order.entity;

import atmin.core.base.BaseEntity;

import atmin.modules.payment.entity.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE orders SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Order extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    // Unique numeric code for PayOS
    @Column(name = "order_code", unique = true, nullable = false)
    private Long orderCode;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Transient
    private List<OrderItem> orderItems;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status", nullable = false)
    @Builder.Default
    private ShippingStatus shippingStatus = ShippingStatus.NOT_SHIPPED;

    @Column(name = "estimated_delivery_date")
    private java.time.LocalDate estimatedDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_status")
    @Builder.Default
    private EmailStatus emailStatus = EmailStatus.PENDING;

    @Column(name = "email_retry_count", nullable = false)
    @Builder.Default
    private int emailRetryCount = 0;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
