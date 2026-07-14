package atmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 255)
    private String description;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
