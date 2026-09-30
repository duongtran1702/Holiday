package atmin.chat.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisChatPublisher {

    public static final String CHAT_CHANNEL = "holiday:chat:messages";

    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(String destination, Object payload) {
        try {
            RedisMessagePayload message = new RedisMessagePayload(destination, payload);
            redisTemplate.convertAndSend(CHAT_CHANNEL, message);
        } catch (Exception e) {
            log.error("Lỗi khi publish message lên Redis channel {}: {}", CHAT_CHANNEL, e.getMessage());
        }
    }
}
