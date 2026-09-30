package atmin.modules.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponseDTO {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String status;
}
