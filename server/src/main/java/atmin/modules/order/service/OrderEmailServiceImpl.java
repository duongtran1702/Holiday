package atmin.modules.order.service;

import atmin.modules.order.entity.Order;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEmailServiceImpl implements IOrderEmailService {
    
    private final JavaMailSender mailSender;
    private final UserInternalApi userInternalApi;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.from-name:Holiday Fashion}")
    private String fromName;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    private boolean isDefaultConfig() {
        return mailPassword == null || mailPassword.isEmpty() || mailPassword.equals("your_app_password");
    }

    @Override
    @Async
    public void sendOrderConfirmationEmail(Order order, String paymentUrl) {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đơn hàng {} của {}", order.getOrderCode(), toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng #" + order.getOrderCode() + " - Holiday Fashion");

            String itemsHtmlStr = buildOrderItemsHtml(order);

            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            String orderDateStr = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy").format(now);
            String expectedDeliverStr = getExpectedDeliveryDateString(now);

            double shippingFee = 0; // For now, shipping is free to match DB total
            double finalTotal = order.getTotalAmount() + shippingFee;

            String customerName = user.getFullName() != null ? user.getFullName() : "Quý khách";
            String customerPhone = order.getPhoneNumber() != null ? order.getPhoneNumber() : user.getPhoneNumber();
            String customerAddress = order.getShippingAddress() != null ? order.getShippingAddress() : user.getAddress();

            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; color: #333;'>"
                    + "<div style='background-color: #1a1a2e; color: #fff; text-align: center; padding: 20px;'>"
                    + "<h2 style='margin: 0;'>" + (fromName != null ? fromName : "Tên shop") + "</h2>"
                    + "</div>"
                    + "<div style='padding: 20px;'>"
                    + "<div style='background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;'>"
                    + "<h3 style='margin: 0 0 5px 0; color: #1565c0;'>📦 Đơn hàng đã được xác nhận</h3>"
                    + "<p style='margin: 0; color: #1976d2; font-size: 14px;'>Thanh toán khi nhận hàng (COD)</p>"
                    + "</div>"
                    
                    + "<p style='margin-top: 0;'>Chào <b>" + customerName + "</b>,</p>"
                    + "<p style='margin-bottom: 20px;'>Cảm ơn bạn đã đặt hàng! Đơn hàng đã được xác nhận.</p>"

                    + "<table style='width: 100%; margin-bottom: 20px; font-size: 14px;'>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Mã đơn hàng</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>#" + order.getOrderCode() + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Ngày đặt</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>" + orderDateStr + "</td>"
                    + "</tr>"
                    + "</table>"

                    + "<div style='border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 15px 0; margin-bottom: 20px;'>"
                    + "<table style='width: 100%; font-size: 14px; margin-bottom: 10px;'>"
                    + itemsHtmlStr
                    + "</table>"
                    + "<table style='width: 100%; font-size: 14px; color: #666;'>"
                    + "<tr>"
                    + "<td style='padding: 5px 0;'>Tạm tính</td>"
                    + "<td style='padding: 5px 0; text-align: right;'>" + String.format("%,.0f", order.getTotalAmount()) + "đ</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0;'>Phí vận chuyển</td>"
                    + "<td style='padding: 5px 0; text-align: right;'>" + String.format("%,.0f", shippingFee) + "đ</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"

                    + "<table style='width: 100%; margin-bottom: 20px; font-size: 16px;'>"
                    + "<tr>"
                    + "<td style='font-weight: bold;'>Tổng thanh toán khi nhận</td>"
                    + "<td style='text-align: right; font-weight: bold; color: #1565c0;'>" + String.format("%,.0f", finalTotal) + "đ</td>"
                    + "</tr>"
                    + "</table>"

                    + "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;'>"
                    + "<p style='margin: 0 0 5px 0; font-weight: bold;'>📍 Giao đến</p>"
                    + "<p style='margin: 0 0 3px 0; color: #555;'>" + customerName + " - " + customerPhone + "</p>"
                    + "<p style='margin: 0 0 3px 0; color: #555;'>" + customerAddress + "</p>"
                    + "<p style='margin: 0; color: #555;'>Dự kiến giao: " + expectedDeliverStr + "</p>"
                    + "</div>"

                    + "<div style='background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 14px; color: #856404;'>"
                    + "<p style='margin: 0;'>⚠️ Vui lòng chuẩn bị đúng <b>" + String.format("%,.0f", finalTotal) + "đ</b> khi nhận hàng. Bạn được kiểm tra hàng trước khi thanh toán.</p>"
                    + "</div>"

                    + "<div style='text-align: center; margin-bottom: 10px;'>"
                    + "<a href='http://localhost:5173/b2c/orders' style='display: inline-block; padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px; text-decoration: none; color: #333; font-weight: bold; font-size: 14px; width: 45%; box-sizing: border-box; text-align: center;'>Xem chi tiết</a>"
                    + "<span style='display: inline-block; width: 2%;'></span>"
                    + "<a href='http://localhost:5173/b2c/orders' style='display: inline-block; padding: 10px 20px; border: 1px solid #ccc; border-radius: 4px; text-decoration: none; color: #333; font-weight: bold; font-size: 14px; width: 45%; box-sizing: border-box; text-align: center;'>Huỷ đơn hàng</a>"
                    + "</div>"

                    + "</div>"
                    + "<div style='background-color: #f5f5f5; text-align: center; padding: 15px; font-size: 12px; color: #888;'>"
                    + "Cần hỗ trợ? Liên hệ hotline/zalo · Email tự động, vui lòng không trả lời"
                    + "</div>"
                    + "</div>";

            helper.setText(content, true);

            mailSender.send(message);
            log.info("COD Order confirmation email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send COD order confirmation email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPaymentSuccessEmail(Order order, String invoiceNumber, LocalDateTime issuedDate, Double totalAmount, String transactionReference) {
        UserDto user = userInternalApi.getUserById(order.getUserId());
        String toEmail = user.getEmail();
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Hóa đơn {} của {}", invoiceNumber, toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🧾 Biên lai thanh toán thành công #" + invoiceNumber);

            double shippingFee = 0; // assuming free shipping
            
            String expectedDeliverStr = getExpectedDeliveryDateString(java.time.LocalDateTime.now());
            
            String customerName = user.getFullName() != null ? user.getFullName() : "Quý khách";
            String customerPhone = order.getPhoneNumber() != null ? order.getPhoneNumber() : user.getPhoneNumber();
            String customerAddress = order.getShippingAddress() != null ? order.getShippingAddress() : user.getAddress();

            String itemsHtmlStr = buildOrderItemsHtml(order);

            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; color: #333;'>"
                    + "<div style='background-color: #1a1a2e; color: #fff; text-align: center; padding: 20px;'>"
                    + "<h2 style='margin: 0;'>" + (fromName != null ? fromName : "Tên shop") + "</h2>"
                    + "</div>"
                    + "<div style='padding: 20px;'>"
                    + "<div style='background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;'>"
                    + "<h3 style='margin: 0 0 5px 0; color: #2e7d32;'>✅ Thanh toán thành công</h3>"
                    + "<p style='margin: 0; color: #388e3c; font-size: 14px;'>Đơn hàng đang được chuẩn bị giao</p>"
                    + "</div>"
                    
                    + "<p style='margin-top: 0;'>Chào <b>" + customerName + "</b>,</p>"
                    + "<p style='margin-bottom: 20px;'>Cảm ơn bạn đã mua hàng. Đây là biên lai thanh toán của bạn.</p>"

                    + "<table style='width: 100%; margin-bottom: 20px; font-size: 14px;'>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Mã đơn hàng</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>#" + order.getOrderCode() + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Mã giao dịch (Ref)</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>" + transactionReference + "</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Phương thức</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>Chuyển khoản qua PayOS</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0; color: #666;'>Thời gian thanh toán</td>"
                    + "<td style='padding: 5px 0; text-align: right; font-weight: bold;'>" + java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy").format(issuedDate) + "</td>"
                    + "</tr>"
                    + "</table>"

                    + "<div style='border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 15px 0; margin-bottom: 20px;'>"
                    + "<table style='width: 100%; font-size: 14px; margin-bottom: 10px;'>"
                    + itemsHtmlStr
                    + "</table>"
                    + "<table style='width: 100%; font-size: 14px; color: #666;'>"
                    + "<tr>"
                    + "<td style='padding: 5px 0;'>Tạm tính</td>"
                    + "<td style='padding: 5px 0; text-align: right;'>" + String.format("%,.0f", order.getTotalAmount()) + "đ</td>"
                    + "</tr>"
                    + "<tr>"
                    + "<td style='padding: 5px 0;'>Phí vận chuyển</td>"
                    + "<td style='padding: 5px 0; text-align: right;'>" + String.format("%,.0f", shippingFee) + "đ</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>"

                    + "<table style='width: 100%; margin-bottom: 20px; font-size: 16px;'>"
                    + "<tr>"
                    + "<td style='font-weight: bold;'>Tổng đã thanh toán</td>"
                    + "<td style='text-align: right; font-weight: bold; color: #2e7d32;'>" + String.format("%,.0f", totalAmount) + "đ</td>"
                    + "</tr>"
                    + "</table>"

                    + "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;'>"
                    + "<p style='margin: 0 0 5px 0; font-weight: bold;'>📍 Giao đến</p>"
                    + "<p style='margin: 0 0 3px 0; color: #555;'>" + customerName + " - " + customerPhone + "</p>"
                    + "<p style='margin: 0 0 3px 0; color: #555;'>" + customerAddress + "</p>"
                    + "<p style='margin: 0; color: #555;'>Dự kiến giao: " + expectedDeliverStr + "</p>"
                    + "</div>"

                    + "<div style='text-align: center; margin-bottom: 10px;'>"
                    + "<a href='http://localhost:5173/b2c/orders' style='display: block; padding: 12px 20px; border: 1px solid #ccc; border-radius: 4px; text-decoration: none; color: #333; font-weight: bold; font-size: 14px; width: 100%; box-sizing: border-box; text-align: center;'>Xem chi tiết đơn hàng</a>"
                    + "</div>"

                    + "</div>"
                    + "<div style='background-color: #f5f5f5; text-align: center; padding: 15px; font-size: 12px; color: #888;'>"
                    + "Cần hỗ trợ? Liên hệ hotline/zalo · Email tự động, vui lòng không trả lời"
                    + "</div>"
                    + "</div>";

            helper.setText(content, true);

            mailSender.send(message);
            log.info("Payment success receipt email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send payment receipt email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildOrderItemsHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        for (atmin.modules.order.entity.OrderItem item : order.getOrderItems()) {
            String variant = "";
            if (item.getSelectedColor() != null || item.getSelectedSize() != null) {
                variant = " (" + (item.getSelectedColor() != null ? item.getSelectedColor() : "") + 
                        (item.getSelectedColor() != null && item.getSelectedSize() != null ? " - " : "") + 
                        (item.getSelectedSize() != null ? item.getSelectedSize() : "") + ")";
            }

            double itemTotal = item.getPrice() * item.getQuantity();

            itemsHtml.append("<tr>")
                     .append("<td style='padding: 5px 0;'>").append(item.getProductName() != null ? item.getProductName() : "Sản phẩm").append(variant).append(" x").append(item.getQuantity()).append("</td>")
                     .append("<td style='padding: 5px 0; text-align: right;'>").append(String.format("%,.0f", itemTotal)).append("đ</td>")
                     .append("</tr>");
        }
        return itemsHtml.toString();
    }

    private String getExpectedDeliveryDateString(java.time.LocalDateTime now) {
        java.time.LocalDateTime deliverStart = now.plusDays(2);
        java.time.LocalDateTime deliverEnd = now.plusDays(4);
        return deliverStart.getDayOfMonth() + "-" + deliverEnd.getDayOfMonth() + "/" + deliverEnd.getMonthValue() + "/" + deliverEnd.getYear();
    }
}