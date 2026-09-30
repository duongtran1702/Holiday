package atmin.modules.auth.service;

import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.auth.dto.GoogleLoginRequest;

public interface IOAuth2Service {
    AuthResponse loginWithGoogle(GoogleLoginRequest request);
}