package atmin.modules.user.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class StaffResponseDTO {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String status;
    private List<String> permissions;
}
