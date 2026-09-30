package atmin.modules.auth.service;

import atmin.common.exception.ResourceNotFoundException;
import atmin.common.exception.UnauthorizedException;
import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.auth.dto.Verify2FARequest;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthServiceImpl implements ITwoFactorAuthService {

    private static final Duration OTP_TTL = Duration.ofMinutes(3);
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StringRedisTemplate stringRedisTemplate;
    private final IAuthEmailService emailService;
    private final UserRepository userRepository;
    private final ITokenManagementService tokenManagementService;

    @Override
    public AuthResponse send2FACode(User user) {
        String key = "OTP:" + user.getEmail();
        Long expireTime = stringRedisTemplate.getExpire(key, TimeUnit.SECONDS);
        
        if (expireTime != null && expireTime > 120) {
            throw new IllegalArgumentException("Vui lòng đợi 60 giây trước khi yêu cầu gửi lại mã OTP mới.");
        }

        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        stringRedisTemplate.opsForValue().set(key, otpCode, OTP_TTL);
        try {
            emailService.send2FAEmail(user.getEmail(), otpCode);
        } catch (RuntimeException exception) {
            stringRedisTemplate.delete(key);
            throw exception;
        }

        String roleName = AuthResponse.UserInfo.resolvePrimaryRole(user);

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
        String attemptsKey = "OTP_ATTEMPTS:" + request.getEmail();
        String savedOtp = stringRedisTemplate.opsForValue().get(key);

        if (savedOtp == null || !savedOtp.equals(request.getOtpCode())) {
            Long attemptCount = stringRedisTemplate.opsForValue().increment(attemptsKey);
            if (attemptCount != null && attemptCount == 1) {
                stringRedisTemplate.expire(attemptsKey, OTP_TTL);
            }
            if (attemptCount != null && attemptCount >= MAX_VERIFY_ATTEMPTS) {
                stringRedisTemplate.delete(key);
                stringRedisTemplate.delete(attemptsKey);
                throw new UnauthorizedException("Bạn đã nhập sai OTP quá số lần cho phép. Vui lòng yêu cầu mã mới");
            }
            throw new UnauthorizedException("Mã OTP không chính xác hoặc đã hết hạn");
        }

        stringRedisTemplate.delete(key);
        stringRedisTemplate.delete(attemptsKey);

        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        return tokenManagementService.buildAuthResponse(user, false);
    }
}
