package atmin.chat.redis;

import java.io.Serializable;

public record RedisMessagePayload(
        String destination,
        Object payload
) implements Serializable {}
