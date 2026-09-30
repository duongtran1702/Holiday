package atmin.modules.auth.service;

import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.user.dto.ChangePasswordRequest;
import atmin.modules.auth.dto.ForgotPasswordRequest;
import atmin.modules.auth.dto.LoginRequest;
import atmin.modules.auth.dto.RegisterRequest;
import atmin.modules.auth.dto.ResetPasswordRequest;
import atmin.modules.auth.dto.AgentRegisterRequest;

public interface IAuthenticationService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String authHeader);
    void changePassword(String email, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    AuthResponse registerAgent(AgentRegisterRequest request);
}