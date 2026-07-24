package atmin.modules.user.api;

import java.util.List;
import java.time.LocalDateTime;

public interface UserInternalApi {
    UserDto getUserByEmail(String email);
    UserDto getUserById(String id);
    List<UserDto> getUsersByIds(List<String> ids);
    void updateUserContactInfo(String email, String phoneNumber, String address);
    void updateUserPresence(String userId, boolean isOnline, LocalDateTime lastSeenAt);
}
