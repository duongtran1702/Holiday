package atmin.modules.promotion.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PromotionDTO {
    private String id;
    private String code;
    private Double discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    private String type;
    private LocalDateTime expiryDate;
    private Integer usageLimit;
    private Integer usedCount;
    private String targetType;
    private String status;
}
