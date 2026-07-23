package atmin.modules.promotion.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionCreateReq {
    private String code;
    private Double discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal minOrderValue;
    private String type; // PERCENT, FIXED
    private LocalDateTime expiryDate;
    private Integer usageLimit;
    private String targetType; // CUSTOMER, AGENT, SPECIFIC_EMAILS, ALL
    private String specificEmails; // comma separated
}
