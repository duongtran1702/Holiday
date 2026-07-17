package atmin.modules.auth.service;

import atmin.common.exception.UnauthorizedException;
import atmin.modules.auth.dto.AuthResponse;
import atmin.modules.auth.dto.GoogleLoginRequest;
import atmin.modules.user.entity.Role;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.RoleRepository;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2ServiceImpl implements IOAuth2Service {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ITokenManagementService tokenManagementService;
    private final RestTemplate restTemplate;

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(request.getAccessToken());
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    typeRef);

            Map<String, Object> payload = response.getBody();
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
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
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

            log.info("Người dùng {} ({}) đăng nhập Google thành công", user.getFullName(), user.getEmail());
            return tokenManagementService.buildAuthResponse(user, true);
        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new UnauthorizedException("Đăng nhập bằng Google thất bại: " + e.getMessage());
        }
    }
}