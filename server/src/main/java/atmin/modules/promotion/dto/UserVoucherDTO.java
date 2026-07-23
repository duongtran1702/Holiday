package atmin.modules.promotion.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserVoucherDTO {
    private String id;
    private PromotionDTO promotion;
    private String status;
    private LocalDateTime createdAt;
}
