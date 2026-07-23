package atmin.modules.user.api;

import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserInternalApiImpl implements UserInternalApi {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return mapToDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public void updateUserContactInfo(String email, String phoneNumber, String address) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        boolean updated = false;
        if (phoneNumber != null && !phoneNumber.equals(user.getPhoneNumber())) {
            user.setPhoneNumber(phoneNumber);
            updated = true;
        }
        if (address != null && !address.equals(user.getAddress())) {
            user.setAddress(address);
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void updateUserPresence(String userId, boolean isOnline, java.time.LocalDateTime lastSeenAt) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsOnline(isOnline);
            user.setLastSeenAt(lastSeenAt);
            userRepository.save(user);
        });
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .status(user.getStatus())
                .build();
    }
}
