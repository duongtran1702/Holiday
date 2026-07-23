package atmin.modules.user.api;

public interface UserInternalApi {
    UserDto getUserByEmail(String email);
    UserDto getUserById(String id);
    void updateUserContactInfo(String email, String phoneNumber, String address);
    void updateUserPresence(String userId, boolean isOnline, java.time.LocalDateTime lastSeenAt);
}
