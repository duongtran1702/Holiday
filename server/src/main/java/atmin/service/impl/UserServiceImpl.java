package atmin.service.impl;

import atmin.controller.auth.dto.AuthResponse;
import atmin.entity.User;
import atmin.infrastructure.upload.UploadService;
import atmin.repository.UserRepository;
import atmin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import atmin.common.exception.ResourceNotFoundException;
import atmin.common.exception.BadRequestException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UploadService uploadService;

    @Override
    @Transactional
    public AuthResponse.UserInfo uploadAvatar(String username, MultipartFile file) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String avatarUrl = uploadService.uploadFile(file);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return mapToUserInfo(user);
    }

    @Override
    @Transactional
    public AuthResponse.UserInfo updateProfile(String username, String fullName, String phone, String address) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName);
        }
        if (phone != null && !phone.isBlank()) {
            if (!phone.matches("^(0|\\+84)[0-9]{9}$")) {
                throw new BadRequestException("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số)");
            }
            if (!phone.equals(user.getPhoneNumber()) && userRepository.existsByPhoneNumberAndDeletedAtIsNull(phone)) {
                throw new atmin.common.exception.DuplicateResourceException("Số điện thoại " + phone + " đã được sử dụng bởi tài khoản khác!");
            }
            user.setPhoneNumber(phone);
        }
        if (address != null && !address.isBlank()) {
            user.setAddress(address);
        }

        userRepository.save(user);
        return mapToUserInfo(user);
    }

    private AuthResponse.UserInfo mapToUserInfo(User user) {
        String primaryRole = user.getRoles() != null && !user.getRoles().isEmpty()
                ? user.getRoles().iterator().next().getName()
                : "CUSTOMER";

        java.util.List<String> permissions = new java.util.ArrayList<>();
        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> {
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(p -> permissions.add(p.getName()));
                }
            });
        }

        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhoneNumber())
                .address(user.getAddress())
                .role(primaryRole)
                .status(user.getStatus())
                .authProvider(user.getAuthProvider())
                .permissions(permissions)
                .build();
    }
}
