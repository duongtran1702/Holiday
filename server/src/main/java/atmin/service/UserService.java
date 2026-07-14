package atmin.service;

import org.springframework.web.multipart.MultipartFile;
import atmin.controller.auth.dto.AuthResponse;

public interface UserService {
    AuthResponse.UserInfo uploadAvatar(String username, MultipartFile file);
    AuthResponse.UserInfo updateProfile(String username, String fullName, String phone, String address);
}
