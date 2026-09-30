package atmin.modules.auth.service;

import atmin.common.exception.UnauthorizedException;
import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.user.entity.User;
import atmin.core.security.jwt.JwtProperties;
import atmin.core.security.jwt.JwtProvider;
import atmin.modules.user.repository.UserRepository;
import atmin.modules.auth.repository.RefreshTokenRepository;
import atmin.modules.auth.repository.TokenBlacklistRepository;
import atmin.modules.auth.redis.RefreshTokenRedis;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenManagementServiceImpl implements ITokenManagementService {

    private final JwtProvider jwtProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;

    @Override
    public AuthResponse buildAuthResponse(User user, boolean skipRevokeAll) {
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

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.fromUser(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .user(userInfo)
                .build();
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        RefreshTokenRedis tokenRedis = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh Token không hợp lệ hoặc không tồn tại"));

        // Detect Reuse Attack
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

        // Revoke old token
        tokenRedis.setRevoked(true);
        refreshTokenRepository.save(tokenRedis);

        return buildAuthResponse(user, true);
    }

    @Override
    public void revokeAllUserTokens(User user) {
        List<RefreshTokenRedis> activeTokens = refreshTokenRepository.findAllActiveByUsername(user.getEmail());
        if (activeTokens != null && !activeTokens.isEmpty()) {
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
        }
    }

    @Override
    public void blacklistToken(String token) {
        Date expirationDate = jwtProvider.getExpirationDateFromToken(token);
        long expiryDurationMs = expirationDate.getTime() - System.currentTimeMillis();
        tokenBlacklistRepository.blacklistToken(token, expiryDurationMs);
    }
}