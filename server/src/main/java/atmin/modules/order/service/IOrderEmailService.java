package atmin.modules.order.service;

import atmin.modules.order.entity.Order;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public interface IOrderEmailService {
    void sendOrderConfirmationEmail(Order order, String paymentUrl);
    void sendOrderConfirmationEmailSync(Order order, String paymentUrl) throws Exception;
    void sendPaymentSuccessEmail(Order order, String invoiceNumber, LocalDateTime issuedDate, BigDecimal totalAmount, String transactionReference);
    void sendPaymentSuccessEmailSync(Order order, String invoiceNumber, LocalDateTime issuedDate, BigDecimal totalAmount, String transactionReference) throws Exception;
}