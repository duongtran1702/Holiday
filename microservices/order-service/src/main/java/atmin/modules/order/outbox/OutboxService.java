package atmin.modules.order.outbox;

import atmin.modules.order.entity.OutboxEvent;
import atmin.modules.order.entity.OutboxStatus;
import atmin.modules.order.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void recordEvent(String aggregateType, String aggregateId, String eventType, String topic, Object payload) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType(aggregateType)
                    .aggregateId(aggregateId)
                    .eventType(eventType)
                    .topic(topic)
                    .payload(jsonPayload)
                    .status(OutboxStatus.PENDING)
                    .build();
            outboxEventRepository.save(event);
            log.debug("[Transactional Outbox] Đã ghi nhận event {} cho aggregateId {}", eventType, aggregateId);
        } catch (JsonProcessingException e) {
            log.error("[Transactional Outbox] Lỗi serialize JSON payload cho aggregateId {}: {}", aggregateId, e.getMessage());
            throw new IllegalStateException("Lỗi ghi nhận Transactional Outbox Event", e);
        }
    }
}
