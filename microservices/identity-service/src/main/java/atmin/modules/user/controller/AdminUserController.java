package atmin.modules.user.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.user.dto.CreateStaffRequest;
import atmin.modules.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import atmin.modules.user.dto.CustomerResponseDTO;
import atmin.modules.user.dto.StaffResponseDTO;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<Void>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        adminUserService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo tài khoản nhân viên thành công", null));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffResponseDTO>>> getAllStaffs() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhân viên thành công", adminUserService.getAllStaffs()));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<CustomerResponseDTO>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khách hàng thành công", adminUserService.getAllCustomers()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable String id) {
        adminUserService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", null));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<ApiResponse<Void>> updateStaffPermissions(@PathVariable String id, @RequestBody List<String> permissions) {
        adminUserService.updateStaffPermissions(id, permissions);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền thành công", null));
    }
}
