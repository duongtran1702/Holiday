package atmin.modules.user.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.user.dto.UpdateProfileRequest;
import atmin.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> uploadAvatar(
            @AuthenticationPrincipal String username,
            @RequestParam("file") MultipartFile file) {
        AuthResponse.UserInfo userInfo = userService.uploadAvatar(username, file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công", userInfo));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> updateProfile(
            @AuthenticationPrincipal String username,
            @RequestBody UpdateProfileRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu cập nhật không được để trống");
        }
        
        AuthResponse.UserInfo userInfo = userService.updateProfile(username, request.getFullName(), request.getPhone(), request.getAddress());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", userInfo));
    }
}


