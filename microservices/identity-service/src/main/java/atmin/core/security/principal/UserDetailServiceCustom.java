package atmin.core.security.principal;

import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailServiceCustom implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Chúng ta thiết kế dùng email làm username để đăng nhập
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại: " + email));

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> {
                String roleName = role.getName();

                if (!roleName.startsWith("ROLE_")) {
                    roleName = "ROLE_" + roleName;
                }

                authorities.add(new SimpleGrantedAuthority(roleName));
                
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission.getName())));
                }
            });
        }
        
        // Gán authority vào user để Spring Security nhận diện role
        user.setAuthorities(authorities);
        return user;
    }
}