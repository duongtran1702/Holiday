package atmin.modules.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCreditLimitRequestDTO {
    
    @NotNull(message = "Hạn mức công nợ không được để trống")
    @Min(value = 0, message = "Hạn mức công nợ không được nhỏ hơn 0")
    private BigDecimal creditLimit;
}
