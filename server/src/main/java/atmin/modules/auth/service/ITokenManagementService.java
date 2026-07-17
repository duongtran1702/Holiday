package atmin.modules.auth.service;

import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.user.entity.User;

public interface ITokenManagementService {
    AuthResponse buildAuthResponse(User user, boolean skipRevokeAll);
    AuthResponse refresh(String refreshToken);
    void revokeAllUserTokens(User user);
    void blacklistToken(String token);
}