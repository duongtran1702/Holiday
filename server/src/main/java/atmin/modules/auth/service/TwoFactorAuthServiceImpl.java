package atmin.modules.auth.service;

import atmin.common.exception.ResourceNotFoundException;
import atmin.common.exception.UnauthorizedException;
import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.auth.dto.Verify2FARequest;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorAuthServiceImpl implements ITwoFactorAuthService {

    private final StringRedisTemplate stringRedisTemplate;
    private final IAuthEmailService emailService;
    private final UserRepository userRepository;
    private final ITokenManagementService tokenManagementService;

    @Override
    public AuthResponse send2FACode(User user) {
        String key = "OTP:" + user.getEmail();
        Long expireTime = stringRedisTemplate.getExpire(key, java.util.concurrent.TimeUnit.SECONDS);
        
        if (expireTime != null && expireTime > 120) {
            throw new IllegalArgumentException("Vui lòng đợi 60 giây trước khi yêu cầu gửi lại mã OTP mới.");
        }

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        stringRedisTemplate.opsForValue().set(key, otpCode, Duration.ofMinutes(3));
        
        log.info("========== DEV MODE ==========");
        log.info("Mã OTP của {} là: {}", user.getEmail(), otpCode);
        log.info("==============================");
        
        emailService.send2FAEmail(user.getEmail(), otpCode);

        String roleName = user.getRoles() != null && !user.getRoles().isEmpty() 
            ? user.getRoles().iterator().next().getName() 
            : "STAFF";

        return AuthResponse.builder()
                .require2fa(true)
                .user(AuthResponse.UserInfo.builder()
                        .email(user.getEmail())
                        .role(roleName)
                        .build())
                .build();
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

        return tokenManagementService.buildAuthResponse(user, false);
    }
}