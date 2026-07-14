package atmin.controller.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoleRequest {
    @NotBlank(message = "Tên Role không được để trống")
    private String name;

    private List<String> permissionIds;
}
