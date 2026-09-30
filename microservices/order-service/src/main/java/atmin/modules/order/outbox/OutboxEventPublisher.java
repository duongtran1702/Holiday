package atmin.modules.order.outbox;

import atmin.modules.order.entity.OutboxEvent;
import atmin.modules.order.entity.OutboxStatus;
import atmin.modules.order.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final int BATCH_SIZE = 50;
    private static final int MAX_RETRIES = 5;

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatusOrderByCreatedAtAsc(
                OutboxStatus.PENDING, PageRequest.of(0, BATCH_SIZE)
        );

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("[Transactional Outbox] Đang xử lý {} sự kiện tồn đọng...", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send(event.getTopic(), event.getAggregateId(), event.getPayload());
                event.setStatus(OutboxStatus.PUBLISHED);
                event.setProcessedAt(LocalDateTime.now());
                log.info("[Transactional Outbox] Đã phát hành event {} cho aggregate {} lên topic {}",
                        event.getEventType(), event.getAggregateId(), event.getTopic());
            } catch (Exception ex) {
                event.setRetryCount(event.getRetryCount() + 1);
                String msg = ex.getMessage();
                event.setErrorMessage(msg != null && msg.length() > 500 ? msg.substring(0, 500) : msg);
                if (event.getRetryCount() >= MAX_RETRIES) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.error("[Transactional Outbox] Event {} vượt quá số lần thử lại tối đa ({}). Đánh dấu FAILED!",
                            event.getId(), MAX_RETRIES, ex);
                } else {
                    log.warn("[Transactional Outbox] Lỗi khi phát hành event {} (lần thử {}): {}",
                            event.getId(), event.getRetryCount(), ex.getMessage());
                }
            }
        }
        outboxEventRepository.saveAll(pendingEvents);
    }
}
