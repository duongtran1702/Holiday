package atmin.chat.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisChatSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisSerializer<Object> redisSerializer;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            Object deserialized = redisSerializer.deserialize(message.getBody());
            if (deserialized instanceof RedisMessagePayload payload) {
                messagingTemplate.convertAndSend(payload.destination(), payload.payload());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý message từ Redis Pub/Sub: {}", e.getMessage());
        }
    }
}
