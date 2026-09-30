package atmin.promotion.client;

import atmin.modules.user.api.UserDto;
import atmin.modules.user.api.UserInternalApi;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "identity-service", path = "/api/v1/internal/users")
public interface UserClient extends UserInternalApi {

    @Override
    @GetMapping("/{id}")
    UserDto getUserById(@PathVariable("id") String id);

    @Override
    @GetMapping("/email/{email}")
    UserDto getUserByEmail(@PathVariable("email") String email);

    @Override
    @PostMapping("/batch")
    List<UserDto> getUsersByIds(@RequestBody List<String> ids);

    @Override
    @GetMapping({"", "/all"})
    List<UserDto> getAllUsers();

    @Override
    @PostMapping("/contact")
    default void updateUserContactInfo(@RequestParam("email") String email,
                                        @RequestParam("phoneNumber") String phoneNumber,
                                        @RequestParam("address") String address) {}

    @Override
    @PostMapping("/presence")
    default void updateUserPresence(@RequestParam("userId") String userId,
                                     @RequestParam("isOnline") boolean isOnline,
                                     @RequestParam("lastSeenAt") LocalDateTime lastSeenAt) {}
}
