package atmin.modules.auth.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthEmailServiceImpl implements IAuthEmailService {
    
    private final JavaMailSender mailSender;

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
    public void sendResetPasswordEmail(String toEmail, String token) {
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đang chạy trong môi trường Dev.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("👗 Đặt lại mật khẩu tài khoản mua sắm của bạn");

            String content = "<h3>Xin chào,</h3>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản mua sắm tại shop của chúng tôi bằng email này.</p>"
                    + "<p>Vui lòng sử dụng mã bảo mật (Reset Token) dưới đây để thực hiện thay đổi mật khẩu của bạn:</p>"
                    + "<p style='font-size: 18px; font-weight: bold; color: #1e88e5; background-color: #f5f5f5; padding: 10px; display: inline-block; border-radius: 4px;'>" + token + "</p>"
                    + "<p>Mã bảo mật này sẽ <b>hết hạn trong 10 phút</b>.</p>"
                    + "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để đảm bảo an toàn.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Holiday Fashion</p>";

            helper.setText(content, true);

            mailSender.send(message);
            log.info("Reset password email successfully sent to {}", toEmail);

        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("Lỗi xác thực Email Server khi gửi link Reset Password: {}", e.getMessage());
            throw new IllegalArgumentException("Cấu hình Email Server bị sai (Sai mật khẩu hoặc App Password). Vui lòng liên hệ Admin cấu hình lại application.properties.");
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage());
            throw new IllegalArgumentException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
        }
    }

    @Override
    public void send2FAEmail(String toEmail, String otpCode) {
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đang chạy trong môi trường Dev. Vui lòng xem OTP ở trên.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🔒 Mã xác thực đăng nhập (OTP)");

            String content = "<h3>Xin chào,</h3>"
                    + "<p>Hệ thống vừa nhận được yêu cầu đăng nhập vào tài khoản quản trị của bạn.</p>"
                    + "<p>Vui lòng sử dụng mã bảo mật (OTP) dưới đây để hoàn tất bước đăng nhập:</p>"
                    + "<p style='font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #1e88e5; background-color: #f5f5f5; padding: 10px 20px; display: inline-block; border-radius: 4px;'>" + otpCode + "</p>"
                    + "<p>Mã OTP này sẽ <b>hết hạn trong 3 phút</b>.</p>"
                    + "<p>Nếu bạn không thực hiện yêu cầu đăng nhập này, vui lòng báo cáo lại hoặc đổi mật khẩu ngay lập tức để đảm bảo an toàn.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Holiday Fashion</p>";

            helper.setText(content, true);

            mailSender.send(message);
            log.info("2FA OTP email successfully sent to {}", toEmail);

        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("Lỗi xác thực Email Server khi gửi mã OTP 2FA: {}", e.getMessage());
            throw new IllegalArgumentException("Cấu hình Email Server bị sai (Sai mật khẩu ứng dụng). Vui lòng cấu hình lại MAIL_PASSWORD để có thể gửi mã OTP.");
        } catch (Exception e) {
            log.error("Failed to send 2FA OTP email to {}: {}", toEmail, e.getMessage());
            throw new IllegalArgumentException("Máy chủ không thể gửi email OTP lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ Admin.");
        }
    }

    @Override
    @Async
    public void sendNewStaffEmail(String toEmail, String fullName, String rawPassword) {
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Mật khẩu cho {} là: {}", toEmail, rawPassword);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Chào mừng bạn gia nhập đội ngũ Holiday Fashion!");

            String content = "<h3>Xin chào " + (fullName != null ? fullName : "") + ",</h3>"
                    + "<p>Tài khoản nhân viên của bạn trên hệ thống quản trị <b>Holiday Fashion</b> đã được khởi tạo thành công.</p>"
                    + "<p>Dưới đây là thông tin đăng nhập tạm thời của bạn:</p>"
                    + "<ul>"
                    + "<li><b>Email đăng nhập:</b> " + toEmail + "</li>"
                    + "<li><b>Mật khẩu tạm thời:</b> <span style='font-size: 16px; font-weight: bold; color: #d32f2f;'>" + rawPassword + "</span></li>"
                    + "</ul>"
                    + "<p><i>Lưu ý: Để đảm bảo an toàn, vui lòng đăng nhập và <b>đổi mật khẩu ngay lập tức</b> trong lần đăng nhập đầu tiên.</i></p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Holiday Fashion</p>";

            helper.setText(content, true);

            mailSender.send(message);
            log.info("New staff email successfully sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send new staff email to {}: {}", toEmail, e.getMessage());
        }
    }
}