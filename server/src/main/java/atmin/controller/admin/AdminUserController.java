package atmin.controller.admin;

import atmin.common.response.ApiResponse;
import atmin.controller.admin.dto.CreateStaffRequest;
import atmin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
