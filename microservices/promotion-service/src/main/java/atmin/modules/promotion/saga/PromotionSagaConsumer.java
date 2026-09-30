package atmin.modules.promotion.saga;

import atmin.common.event.SagaCommands.VoucherApplicationFailedEvent;
import atmin.common.event.SagaCommands.VoucherAppliedEvent;
import atmin.common.event.SagaCommands.VoucherApplyCommand;
import atmin.common.event.SagaCommands.VoucherRollbackCommand;
import atmin.modules.promotion.dto.PromotionDTO;
import atmin.modules.promotion.service.PromotionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionSagaConsumer {

    private final PromotionService promotionService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "voucher-apply-topic", groupId = "promotion-service-group")
    public void handleVoucherApplyCommand(VoucherApplyCommand command) {
        log.info("[Saga {}] Received VoucherApplyCommand for order {}, voucher {}", 
                command.sagaId(), command.orderId(), command.voucherCode());
        try {
            PromotionDTO promo = promotionService.validateVoucher(
                    command.voucherCode(), 
                    command.orderAmount(), 
                    command.userId()
            );

            promotionService.useVoucher(command.voucherCode(), command.userId());

            BigDecimal discount = BigDecimal.ZERO;
            if (promo.getDiscountAmount() != null && promo.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discount = promo.getDiscountAmount();
            } else if (promo.getDiscountPercentage() != null && promo.getDiscountPercentage() > 0) {
                discount = command.orderAmount().multiply(BigDecimal.valueOf(promo.getDiscountPercentage()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            log.info("[Saga {}] Voucher applied successfully. Discount={}", command.sagaId(), discount);
            kafkaTemplate.send("voucher-applied-topic", command.sagaId(),
                    new VoucherAppliedEvent(command.sagaId(), command.orderId(), command.voucherCode(), discount));
        } catch (Exception e) {
            log.error("[Saga {}] Voucher application failed: {}", command.sagaId(), e.getMessage());
            kafkaTemplate.send("voucher-failed-topic", command.sagaId(),
                    new VoucherApplicationFailedEvent(command.sagaId(), command.orderId(), command.voucherCode(), e.getMessage()));
        }
    }

    @KafkaListener(topics = "voucher-rollback-topic", groupId = "promotion-service-group")
    public void handleVoucherRollbackCommand(VoucherRollbackCommand command) {
        log.info("[Saga {}] Received VoucherRollbackCommand (Compensating Transaction) for order {}", 
                command.sagaId(), command.orderId());
        try {
            if (command.voucherCode() != null && !command.voucherCode().isBlank()) {
                promotionService.rollbackVoucher(command.voucherCode(), command.userId());
            }
            log.info("[Saga {}] Voucher rollback completed successfully", command.sagaId());
        } catch (Exception e) {
            log.error("[Saga {}] Error executing voucher rollback: {}", command.sagaId(), e.getMessage());
        }
    }
}
