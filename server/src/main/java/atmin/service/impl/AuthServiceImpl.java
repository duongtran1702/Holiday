package atmin.service.impl;


import atmin.common.exception.DuplicateResourceException;
import atmin.common.exception.ResourceNotFoundException;
import atmin.common.exception.UnauthorizedException;
import atmin.controller.auth.dto.AuthResponse;
import atmin.controller.auth.dto.ChangePasswordRequest;
import atmin.controller.auth.dto.ForgotPasswordRequest;
import atmin.controller.auth.dto.LoginRequest;
import atmin.controller.auth.dto.RegisterRequest;
import atmin.controller.auth.dto.ResetPasswordRequest;
import atmin.entity.Role;
import atmin.entity.User;
import atmin.infrastructure.security.jwt.JwtProperties;
import atmin.infrastructure.security.jwt.JwtProvider;
import atmin.repository.RoleRepository;
import atmin.repository.UserRepository;
import atmin.repository.redis.RefreshTokenRepository;
import atmin.repository.redis.TokenBlacklistRepository;
import atmin.repository.redis.dto.RefreshTokenRedis;
import atmin.service.AuthService;
import atmin.service.IEmailService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import atmin.controller.auth.dto.Verify2FARequest;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;
import atmin.controller.auth.dto.GoogleLoginRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtProperties jwtProperties;
    private final IEmailService emailService;
    private final StringRedisTemplate stringRedisTemplate;

    @Value("${google.client.id}")
    private String googleClientId;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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

        return buildAuthResponse(newUser, true); // true = đăng nhập luôn, sinh token
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
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("Login failed for user {}: {}", request.getEmail(), e.getMessage());
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }
        log.info("Người dùng {} đăng nhập thành công", request.getEmail());

        User user = (User) authentication.getPrincipal();
        
        boolean isAdminOrStaff = user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ADMIN") || r.getName().equalsIgnoreCase("STAFF"));
                
        if ("customer".equalsIgnoreCase(request.getPortal()) && isAdminOrStaff) {
            throw new UnauthorizedException("Tài khoản quản trị không được đăng nhập tại đây.");
        }
        if ("admin".equalsIgnoreCase(request.getPortal()) && !isAdminOrStaff) {
            throw new UnauthorizedException("Bạn không có quyền truy cập trang quản trị.");
        }

        boolean require2fa = isAdminOrStaff;
                
        if (require2fa) {
            String key = "OTP:" + user.getEmail();
            Long expireTime = stringRedisTemplate.getExpire(key, java.util.concurrent.TimeUnit.SECONDS);
            // Tổng thời gian là 3 phút (180s). Nếu còn lớn hơn 120s tức là vừa tạo chưa được 60s.
            if (expireTime != null && expireTime > 120) {
                throw new IllegalArgumentException("Vui lòng đợi 60 giây trước khi yêu cầu gửi lại mã OTP mới.");
            }

            String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));
            stringRedisTemplate.opsForValue().set(key, otpCode, java.time.Duration.ofMinutes(3));
            log.info("========== DEV MODE ==========");
            log.info("Mã OTP của {} là: {}", user.getEmail(), otpCode);
            log.info("==============================");
            emailService.send2FAEmail(user.getEmail(), otpCode);
            
            return AuthResponse.builder()
                    .require2fa(true)
                    .user(AuthResponse.UserInfo.builder()
                            .email(user.getEmail())
                            .role(user.getRoles().iterator().next().getName())
                            .build())
                    .build();
        }

        return buildAuthResponse(user, false); // false = đăng nhập lại, ép thu hồi token cũ
    }
    
    @Override
    public AuthResponse verify2fa(Verify2FARequest request) {
        String key = "OTP:" + request.getEmail();
        String savedOtp = stringRedisTemplate.opsForValue().get(key);
        
        if (savedOtp == null || !savedOtp.equals(request.getOtpCode())) {
            throw new UnauthorizedException("Mã OTP không chính xác hoặc đã hết hạn");
        }
        
        stringRedisTemplate.delete(key);
        
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
                
        return buildAuthResponse(user, false);
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        RefreshTokenRedis tokenRedis = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh Token không hợp lệ hoặc không tồn tại"));

        // Phát hiện tấn công tái sử dụng (Reuse Attack)
        if (tokenRedis.isRevoked()) {
            List<RefreshTokenRedis> activeTokens = refreshTokenRepository.findAllActiveByUsername(tokenRedis.getUsername());
            if (activeTokens != null && !activeTokens.isEmpty()) {
                activeTokens.forEach(t -> t.setRevoked(true));
                refreshTokenRepository.saveAll(activeTokens);
            }
            throw new UnauthorizedException("Phát hiện truy cập bất thường (Reuse Attack). Toàn bộ phiên đăng nhập đã bị hủy.");
        }

        if (tokenRedis.getExpiredAt() < System.currentTimeMillis()) {
            throw new UnauthorizedException("Refresh Token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(tokenRedis.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại"));

        // Thu hồi token cũ (Refresh Token Rotation)
        tokenRedis.setRevoked(true);
        refreshTokenRepository.save(tokenRedis);

        return buildAuthResponse(user, true); // Đã thu hồi chính nó rồi, không cần thu hồi ALL
    }

    @Override
    @Transactional
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new JwtException("Chưa xác thực quyền truy cập");
        }

        String token = authHeader.substring(7);
        jwtProvider.validateAccessToken(token);

        String email = jwtProvider.getUsernameFromToken(token);

        // Thu hồi tất cả Refresh Token của user này
        List<RefreshTokenRedis> activeTokens = refreshTokenRepository.findAllActiveByUsername(email);
        if (activeTokens != null && !activeTokens.isEmpty()) {
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
        }

        // Đưa Access Token hiện tại vào Blacklist
        Date expirationDate = jwtProvider.getExpirationDateFromToken(token);
        long expiryDurationMs = expirationDate.getTime() - System.currentTimeMillis();
        tokenBlacklistRepository.blacklistToken(token, expiryDurationMs);
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

        // Thu hồi toàn bộ token trên Redis để bắt đăng nhập lại
        revokeAllUserTokens(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new IllegalArgumentException("Tài khoản Google không thể đổi mật khẩu.");
        }

        String token = UUID.randomUUID().toString();
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

        // Thu hồi toàn bộ token sau khi reset pass thành công
        revokeAllUserTokens(user);
    }

    /**
     * Tiện ích xây dựng Token & lưu Redis
     * @param skipRevokeAll Or Is Refreshing
     */
    private AuthResponse buildAuthResponse(User user, boolean skipRevokeAll) {
        String accessToken = jwtProvider.generateAccessToken(user);

        if (!skipRevokeAll) {
            revokeAllUserTokens(user);
        }

        String refreshTokenString = UUID.randomUUID().toString();
        long expiredAt = System.currentTimeMillis() + jwtProperties.getRefreshExpiration();

        RefreshTokenRedis refreshTokenRedis = RefreshTokenRedis.builder()
                .token(refreshTokenString)
                .username(user.getEmail())
                .expiredAt(expiredAt)
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshTokenRedis);

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

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
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

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .user(userInfo)
                .build();
    }

    private void revokeAllUserTokens(User user) {
        List<RefreshTokenRedis> activeTokens = refreshTokenRepository.findAllActiveByUsername(user.getEmail());
        if (activeTokens != null && !activeTokens.isEmpty()) {
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
        }
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(request.getAccessToken());
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>("parameters", headers);
            
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo", 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    java.util.Map.class);
            
            java.util.Map<String, Object> payload = response.getBody();
            if (payload == null || !payload.containsKey("email")) {
                throw new UnauthorizedException("Invalid Access Token");
            }
            
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");

            User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);

            if (user == null) {
                // Register new user
                Role customerRole = roleRepository.findByNameAndDeletedAtIsNull("CUSTOMER")
                        .orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));

                user = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                        .fullName(name)
                        .status("active")
                        .isEnabled(true)
                        .authProvider("GOOGLE")
                        .roles(Set.of(customerRole))
                        .build();

                user = userRepository.save(user);
            } else {
                if (!"GOOGLE".equals(user.getAuthProvider())) {
                    throw new UnauthorizedException("Vui lòng đăng nhập bằng mật khẩu.");
                }
            }

            return buildAuthResponse(user, true); // true = login immediately, issue token
        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new UnauthorizedException("Đăng nhập bằng Google thất bại: " + e.getMessage());
        }
    }
}
