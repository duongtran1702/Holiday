package atmin.modules.order.service;

import atmin.modules.order.entity.Order;

import java.time.LocalDateTime;

public interface IOrderEmailService {
    void sendOrderConfirmationEmail(Order order, String paymentUrl);
    void sendPaymentSuccessEmail(Order order, String invoiceNumber, LocalDateTime issuedDate, Double totalAmount, String transactionReference);
}