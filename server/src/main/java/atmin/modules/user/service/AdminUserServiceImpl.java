package atmin.modules.user.service;

import atmin.common.exception.DuplicateResourceException;
import atmin.modules.user.dto.CreateStaffRequest;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.entity.Permission;
import atmin.modules.user.dto.CustomerResponseDTO;
import atmin.modules.user.dto.StaffResponseDTO;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import atmin.modules.user.repository.PermissionRepository;
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
    private final PermissionRepository permissionRepository;
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

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getAllCustomers() {
        return userRepository.findByRoles_NameAndDeletedAtIsNull("CUSTOMER").stream()
                .map(user -> CustomerResponseDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .status(user.getIsEnabled() ? "active" : "inactive")
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleUserStatus(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        boolean current = user.getIsEnabled() != null ? user.getIsEnabled() : false;
        user.setIsEnabled(!current);
        user.setStatus(!current ? "active" : "inactive");
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateStaffPermissions(String id, List<String> permissions) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        
        String roleName = "ROLE_STAFF_" + id;
        Role customRole = roleRepository.findByNameAndDeletedAtIsNull(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        
        List<Permission> allPerms = permissionRepository.findAll();
        Set<Permission> assignedPerms = allPerms.stream()
                .filter(p -> permissions.contains(p.getName()))
                .collect(Collectors.toSet());
        
        customRole.setPermissions(assignedPerms);
        roleRepository.save(customRole);
        
        user.setRoles(Set.of(customRole));
        userRepository.save(user);
    }
}
