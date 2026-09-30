package atmin.modules.product.saga;

import atmin.common.event.SagaCommands.*;
import atmin.modules.product.api.ProductInternalApi;
import atmin.modules.product.api.StockUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductSagaConsumer {

    private final ProductInternalApi productInternalApi;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "stock-reserve-topic", groupId = "product-service-group")
    public void handleStockReserveCommand(StockReserveCommand command) {
        log.info("[Saga {}] Received StockReserveCommand for order {}", command.sagaId(), command.orderId());
        try {
            List<StockUpdateDto> stockUpdates = command.items().stream()
                    .map(item -> new StockUpdateDto(item.productId(), item.variant(), item.quantity()))
                    .collect(Collectors.toList());

            productInternalApi.reduceStockBatch(stockUpdates);

            log.info("[Saga {}] Stock reserved successfully for order {}", command.sagaId(), command.orderId());
            kafkaTemplate.send("stock-reserved-topic", command.sagaId(), new StockReservedEvent(command.sagaId(), command.orderId()));
        } catch (Exception e) {
            log.error("[Saga {}] Stock reservation failed for order {}: {}", command.sagaId(), command.orderId(), e.getMessage());
            kafkaTemplate.send("stock-reservation-failed-topic", command.sagaId(),
                    new StockReservationFailedEvent(command.sagaId(), command.orderId(), e.getMessage()));
        }
    }

    @KafkaListener(topics = "stock-rollback-topic", groupId = "product-service-group")
    public void handleStockRollbackCommand(StockRollbackCommand command) {
        log.info("[Saga {}] Received StockRollbackCommand (Compensating Transaction) for order {}", command.sagaId(), command.orderId());
        try {
            if (command.items() != null) {
                for (StockItemDto item : command.items()) {
                    productInternalApi.increaseStock(item.productId(), item.variant(), item.quantity());
                }
            }
            log.info("[Saga {}] Stock rollback completed successfully for order {}", command.sagaId(), command.orderId());
        } catch (Exception e) {
            log.error("[Saga {}] Error executing stock rollback for order {}: {}", command.sagaId(), command.orderId(), e.getMessage());
        }
    }
}
