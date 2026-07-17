package atmin.modules.auth.service;

import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.auth.dto.Verify2FARequest;
import atmin.modules.user.entity.User;

public interface ITwoFactorAuthService {
    AuthResponse send2FACode(User user);
    AuthResponse verify2fa(Verify2FARequest request);
}