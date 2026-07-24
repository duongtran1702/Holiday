package atmin.modules.auth.service;
import atmin.modules.user.dto.ChangePasswordRequest;

import atmin.common.exception.DuplicateResourceException;
import atmin.common.exception.ResourceNotFoundException;
import atmin.common.exception.UnauthorizedException;
import atmin.modules.auth.dto.*;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import atmin.modules.user.entity.AgentProfile;
import atmin.modules.user.entity.AgentStatus;
import atmin.modules.user.repository.AgentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements IAuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final ITokenManagementService tokenManagementService;
    private final ITwoFactorAuthService twoFactorAuthService;
    private final IAuthEmailService emailService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu đăng ký không được để trống");
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại trong hệ thống: " + request.getEmail());
        }
        if (request.getPhone() != null && userRepository.existsByPhoneNumberAndDeletedAtIsNull(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + request.getPhone());
        }

        Role customerRole = roleRepository.findByNameAndDeletedAtIsNull("CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));

        User newUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhone())
                .status("active")
                .isEnabled(true)
                .roles(Set.of(customerRole))
                .build();

        userRepository.save(newUser);

        return tokenManagementService.buildAuthResponse(newUser, true);
    }

    @Override
    @Transactional
    public AuthResponse registerAgent(AgentRegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu đăng ký không được để trống");
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại trong hệ thống: " + request.getEmail());
        }
        if (request.getPhone() != null && userRepository.existsByPhoneNumberAndDeletedAtIsNull(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + request.getPhone());
        }

        Role agentRole = roleRepository.findByNameAndDeletedAtIsNull("AGENT")
                .orElseGet(() -> roleRepository.save(Role.builder().name("AGENT").build()));

        User newUser = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getName())
                .phoneNumber(request.getPhone())
                .status("pending") // Chờ duyệt
                .isEnabled(false) // Bị khóa cho đến khi duyệt
                .roles(Set.of(agentRole))
                .build();

        userRepository.save(newUser);

        AgentProfile agentProfile = AgentProfile.builder()
                .userId(newUser.getId())
                .businessName(request.getBusiness())
                .taxCode(request.getTax())
                .businessAddress(request.getAddress())
                .status(AgentStatus.PENDING)
                .build();
        
        agentProfileRepository.save(agentProfile);

        // Sinh response nhưng không kèm token để đảm bảo bảo mật vì isEnabled=false
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .user(AuthResponse.UserInfo.fromUser(newUser))
                .require2fa(false)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User existingUser = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).orElse(null);
        if (existingUser != null && "GOOGLE".equals(existingUser.getAuthProvider())) {
            throw new UnauthorizedException("Vui lòng đăng nhập bằng Google.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            log.error("Login failed for user {}: {}", request.getEmail(), e.getMessage());
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }
        User user = (User) authentication.getPrincipal();
        if (user == null) {
            throw new UnauthorizedException("Phiên đăng nhập không hợp lệ.");
        }
        log.info("Người dùng {} ({}) đăng nhập thành công", user.getFullName(), request.getEmail());
        
        boolean require2fa = user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ADMIN") || r.getName().equalsIgnoreCase("STAFF"));
                
        if ("customer".equalsIgnoreCase(request.getPortal()) && require2fa) {
            throw new UnauthorizedException("Tài khoản quản trị không được đăng nhập tại đây.");
        }
        if ("admin".equalsIgnoreCase(request.getPortal()) && !require2fa) {
            throw new UnauthorizedException("Bạn không có quyền truy cập trang quản trị.");
        }

        if (require2fa) {
            return twoFactorAuthService.send2FACode(user);
        }

        return tokenManagementService.buildAuthResponse(user, false);
    }

    @Override
    @Transactional
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new JwtException("Chưa xác thực quyền truy cập");
        }
        String token = authHeader.substring(7);
        tokenManagementService.blacklistToken(token);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new IllegalArgumentException("Tài khoản Google không thể đổi mật khẩu.");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác!");
        }

        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không khớp!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenManagementService.revokeAllUserTokens(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new IllegalArgumentException("Tài khoản Google không thể đổi mật khẩu.");
        }

        // Generate a 6-digit numeric OTP for reset password
        String token = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendResetPasswordEmail(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Mã xác nhận không hợp lệ hoặc đã hết hạn!"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã xác nhận không hợp lệ hoặc đã hết hạn!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không khớp!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenManagementService.revokeAllUserTokens(user);
    }
}