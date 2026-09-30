package atmin.modules.user.dto;

import atmin.modules.user.entity.AgentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponseDTO {
    private String id;
    private String name; // Tên doanh nghiệp
    private String contact; // Số điện thoại (từ User)
    private BigDecimal credit; // Hạn mức
    private BigDecimal used; // Nợ đã dùng
    private long orders; // Số đơn hàng
    private AgentStatus status; // Trạng thái
}
