package atmin.modules.user.service;

import atmin.common.exception.DuplicateResourceException;
import atmin.modules.user.dto.CreateStaffRequest;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.entity.Permission;
import atmin.modules.user.dto.StaffResponseDTO;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import atmin.modules.auth.service.IAuthEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final IAuthEmailService emailService;

    @Override
    @Transactional
    public void createStaff(CreateStaffRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu tạo tài khoản không được để trống");
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại: " + request.getEmail());
        }
        String phone = request.getPhoneNumber();
        if (phone != null && phone.isBlank()) {
            phone = null;
        }

        if (phone != null && userRepository.existsByPhoneNumberAndDeletedAtIsNull(phone)) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + phone);
        }

        Role staffRole = roleRepository.findByNameAndDeletedAtIsNull("STAFF")
                .orElseGet(() -> roleRepository.save(Role.builder().name("STAFF").build()));

        // Sinh ngẫu nhiên mật khẩu 8 ký tự
        String rawPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        User staffUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName())
                .phoneNumber(phone)
                .status("active")
                .isEnabled(true)
                .roles(Set.of(staffRole))
                .build();

        userRepository.save(staffUser);
        
        // Gửi email chứa mật khẩu
        emailService.sendNewStaffEmail(staffUser.getEmail(), staffUser.getFullName(), rawPassword);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffResponseDTO> getAllStaffs() {
        return userRepository.findByRoles_NameAndDeletedAtIsNull("STAFF").stream()
                .map(user -> {
                    List<String> perms = user.getRoles().stream()
                            .flatMap(role -> role.getPermissions().stream())
                            .map(Permission::getName)
                            .distinct()
                            .collect(Collectors.toList());

                    return StaffResponseDTO.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .status(user.getIsEnabled() ? "active" : "inactive")
                            .permissions(perms)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
