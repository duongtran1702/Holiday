package atmin.modules.user.controller;

import atmin.modules.user.api.UserDto;
import atmin.modules.user.api.UserInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserInternalApi userInternalApi;

    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable String id) {
        return userInternalApi.getUserById(id);
    }

    @GetMapping("/email/{email}")
    public UserDto getUserByEmail(@PathVariable String email) {
        return userInternalApi.getUserByEmail(email);
    }

    @GetMapping({"", "/all"})
    public List<UserDto> getAllUsers() {
        return userInternalApi.getAllUsers();
    }

    @PostMapping("/batch")
    public List<UserDto> getUsersByIds(@RequestBody List<String> ids) {
        return userInternalApi.getUsersByIds(ids);
    }
}
