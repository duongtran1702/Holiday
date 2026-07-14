package atmin.repository.redis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRedis {
    private String token;
    private String username;
    private long expiredAt;
    private boolean revoked;
}
