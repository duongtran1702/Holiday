package atmin.modules.order.service;

import atmin.modules.notification.api.NotificationInternalApi;
import atmin.modules.order.entity.EmailStatus;
import atmin.modules.order.entity.Order;
import atmin.modules.order.repository.OrderRepository;
import atmin.modules.user.api.UserDto;
import atmin.modules.user.api.UserInternalApi;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import atmin.modules.order.entity.OrderItem;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEmailServiceImpl implements IOrderEmailService {

    private final JavaMailSender mailSender;
    private final UserInternalApi userInternalApi;
    private final OrderRepository orderRepository;
    private final NotificationInternalApi notificationInternalApi;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.from-name:Holiday Fashion}")
    private String fromName;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private boolean isDefaultConfig() {
        return mailPassword == null || mailPassword.isEmpty() || "your_app_password".equals(mailPassword);
    }

    @Override
    @Async
    public void sendOrderConfirmationEmail(Order order, String paymentUrl) {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đơn hàng {} của {}", order.getOrderCode(),
                    toEmail);
            return;
        }
        try {
            sendOrderConfirmationEmailSync(order, paymentUrl);

            Order dbOrder = orderRepository.findById(order.getId()).orElse(order);
            dbOrder.setEmailStatus(EmailStatus.SENT);
            orderRepository.save(dbOrder);
        } catch (Exception e) {
            log.error("Failed to send COD order confirmation email to {}: {}", toEmail, e.getMessage());
            Order dbOrder = orderRepository.findById(order.getId()).orElse(order);
            dbOrder.setEmailStatus(EmailStatus.FAILED);
            int newCount = dbOrder.getEmailRetryCount() + 1;
            dbOrder.setEmailRetryCount(newCount);
            orderRepository.save(dbOrder);

            if (newCount >= 5) {
                notificationInternalApi.createNotification(
                        "ORDER_EMAIL_FAILED", "ORDER", dbOrder.getId(),
                        "Lỗi gửi email đơn hàng",
                        "Gửi email đơn hàng #" + dbOrder.getOrderCode() + " thất bại sau 5 lần thử",
                        "WARNING", "ADMIN", null, "/admin/orders?id=" + dbOrder.getId().toString(), null);
            }
        }
    }

    @Override
    public void sendOrderConfirmationEmailSync(Order order, String paymentUrl) throws Exception {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            throw new Exception("Chưa cấu hình MAIL_PASSWORD");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(toEmail);
        helper.setSubject("Đặt hàng thành công #" + order.getOrderCode());

        double shippingFee = 0;

        String expectedDeliverStr = order.getEstimatedDeliveryDate() != null 
                ? DateTimeFormatter.ofPattern("dd/MM/yyyy").format(order.getEstimatedDeliveryDate())
                : getExpectedDeliveryDateString(LocalDateTime.now());

        String customerName = user.getFullName() != null ? user.getFullName() : "Quý khách";
        String customerPhone = order.getPhoneNumber() != null ? order.getPhoneNumber() : user.getPhoneNumber();
        String customerAddress = order.getShippingAddress() != null ? order.getShippingAddress() : user.getAddress();

        Context context = new Context();
        context.setVariable("shopName", fromName != null ? fromName : "Tên shop");
        context.setVariable("customerName", customerName);
        context.setVariable("orderCode", order.getOrderCode());
        context.setVariable("orderDate", DateTimeFormatter.ofPattern("dd/MM/yyyy").format(order.getCreatedAt()));
        context.setVariable("totalAmount", order.getTotalAmount());
        context.setVariable("customerPhone", customerPhone);
        context.setVariable("customerAddress", customerAddress);
        context.setVariable("expectedDelivery", expectedDeliverStr);
        context.setVariable("frontendUrl", frontendUrl);
        context.setVariable("shippingFee", shippingFee);
        context.setVariable("finalAmount", order.getTotalAmount().add(BigDecimal.valueOf(shippingFee)));

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            Map<String, Object> map = new HashMap<>();
            map.put("productName", item.getProductName() != null ? item.getProductName() : "Sản phẩm");
            String variant = "";
            if (item.getSelectedColor() != null || item.getSelectedSize() != null) {
                variant = (item.getSelectedColor() != null ? item.getSelectedColor() : "") +
                        (item.getSelectedColor() != null && item.getSelectedSize() != null ? " - " : "") +
                        (item.getSelectedSize() != null ? item.getSelectedSize() : "");
            }
            map.put("variant", variant);
            map.put("quantity", item.getQuantity());
            map.put("total", item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            items.add(map);
        }
        context.setVariable("items", items);

        String content = templateEngine.process("email/order-confirmation", context);

        helper.setText(content, true);
        mailSender.send(message);
        log.info("COD Order confirmation email successfully sent to {}", toEmail);
    }

    @Override
    @Async
    public void sendPaymentSuccessEmail(Order order, String invoiceNumber, LocalDateTime issuedDate,
            BigDecimal totalAmount, String transactionReference) {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Hóa đơn {} của {}", invoiceNumber, toEmail);
            return;
        }
        try {
            sendPaymentSuccessEmailSync(order, invoiceNumber, issuedDate, totalAmount, transactionReference);

            Order dbOrder = orderRepository.findById(order.getId()).orElse(order);
            dbOrder.setEmailStatus(EmailStatus.SENT);
            orderRepository.save(dbOrder);
        } catch (Exception e) {
            log.error("Failed to send payment receipt email to {}: {}", toEmail, e.getMessage());
            Order dbOrder = orderRepository.findById(order.getId()).orElse(order);
            dbOrder.setEmailStatus(EmailStatus.FAILED);
            int newCount = dbOrder.getEmailRetryCount() + 1;
            dbOrder.setEmailRetryCount(newCount);
            orderRepository.save(dbOrder);

            if (newCount >= 5) {
                notificationInternalApi.createNotification(
                        "ORDER_EMAIL_FAILED", "ORDER", dbOrder.getId().toString(),
                        "Lỗi gửi email hóa đơn",
                        "Gửi email thanh toán đơn hàng #" + dbOrder.getOrderCode() + " thất bại sau 5 lần thử",
                        "WARNING", "ADMIN", null, "/admin/orders?id=" + dbOrder.getId().toString(), null);
            }
        }
    }

    @Override
    public void sendPaymentSuccessEmailSync(Order order, String invoiceNumber, LocalDateTime issuedDate,
            BigDecimal totalAmount, String transactionReference) throws Exception {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            throw new Exception("Chưa cấu hình MAIL_PASSWORD");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(toEmail);
        helper.setSubject("🧾 Biên lai thanh toán thành công #" + invoiceNumber);

        double shippingFee = 30000;

        String expectedDeliverStr = order.getEstimatedDeliveryDate() != null 
                ? DateTimeFormatter.ofPattern("dd/MM/yyyy").format(order.getEstimatedDeliveryDate())
                : getExpectedDeliveryDateString(LocalDateTime.now());

        String customerName = user.getFullName() != null ? user.getFullName() : "Quý khách";
        String customerPhone = order.getPhoneNumber() != null ? order.getPhoneNumber() : user.getPhoneNumber();
        String customerAddress = order.getShippingAddress() != null ? order.getShippingAddress() : user.getAddress();

        Context context = new Context();
        context.setVariable("shopName", fromName != null ? fromName : "Tên shop");
        context.setVariable("customerName", customerName);
        context.setVariable("orderCode", order.getOrderCode());
        context.setVariable("transactionReference", transactionReference);
        context.setVariable("issuedDate", DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy").format(issuedDate));
        context.setVariable("totalAmount", totalAmount);
        context.setVariable("customerPhone", customerPhone);
        context.setVariable("customerAddress", customerAddress);
        context.setVariable("expectedDelivery", expectedDeliverStr);
        context.setVariable("frontendUrl", frontendUrl);
        context.setVariable("shippingFee", shippingFee);
        context.setVariable("finalAmount", totalAmount.add(BigDecimal.valueOf(shippingFee)));

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            Map<String, Object> map = new HashMap<>();
            map.put("productName", item.getProductName() != null ? item.getProductName() : "Sản phẩm");
            String variant = "";
            if (item.getSelectedColor() != null || item.getSelectedSize() != null) {
                variant = (item.getSelectedColor() != null ? item.getSelectedColor() : "") +
                        (item.getSelectedColor() != null && item.getSelectedSize() != null ? " - " : "") +
                        (item.getSelectedSize() != null ? item.getSelectedSize() : "");
            }
            map.put("variant", variant);
            map.put("quantity", item.getQuantity());
            map.put("total", item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            items.add(map);
        }
        context.setVariable("items", items);

        String content = templateEngine.process("email/payment-success", context);

        helper.setText(content, true);

        mailSender.send(message);
        log.info("Payment success receipt email successfully sent to {}", toEmail);
    }

    private String getExpectedDeliveryDateString(LocalDateTime now) {
        LocalDateTime deliverStart = now.plusDays(2);
        LocalDateTime deliverEnd = now.plusDays(4);
        return deliverStart.getDayOfMonth() + "-" + deliverEnd.getDayOfMonth() + "/" + deliverEnd.getMonthValue() + "/"
                + deliverEnd.getYear();
    }
}
