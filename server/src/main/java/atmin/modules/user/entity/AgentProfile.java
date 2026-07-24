package atmin.modules.user.entity;

import atmin.core.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "agent_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentProfile extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "business_address", nullable = false, length = 500)
    private String businessAddress;

    @Column(name = "credit_limit")
    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "used_credit")
    @Builder.Default
    private BigDecimal usedCredit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AgentStatus status;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
