package atmin.service;

import atmin.controller.auth.dto.AuthResponse;
import atmin.controller.auth.dto.LoginRequest;
import atmin.controller.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
    AuthResponse verify2fa(atmin.controller.auth.dto.Verify2FARequest request);
    
    void logout(String authHeader);
    void changePassword(String email, atmin.controller.auth.dto.ChangePasswordRequest request);
    void forgotPassword(atmin.controller.auth.dto.ForgotPasswordRequest request);
    void resetPassword(atmin.controller.auth.dto.ResetPasswordRequest request);
}
