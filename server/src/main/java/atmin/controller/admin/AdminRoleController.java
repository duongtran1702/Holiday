package atmin.controller.admin;

import atmin.common.response.ApiResponse;
import atmin.controller.admin.dto.CreateRoleRequest;
import atmin.controller.admin.dto.PermissionDto;
import atmin.controller.admin.dto.RoleDto;
import atmin.service.AdminRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quyền thành công", adminRoleService.getAllPermissions()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách vai trò thành công", adminRoleService.getAllRoles()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo vai trò thành công", adminRoleService.createRole(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(@PathVariable String id, @Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", adminRoleService.updateRole(id, request)));
    }
}
