package atmin.modules.user.service;

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
public class AgentEmailServiceImpl implements IAgentEmailService {

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
    @Async
    public void sendAgentApprovalEmail(String toEmail, String businessName) {
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đã duyệt đại lý {}", businessName);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Chúc mừng! Tài khoản Đại Lý của bạn đã được phê duyệt");

            String content = "<h3>Xin chào " + (businessName != null ? businessName : "Đại Lý") + ",</h3>"
                    + "<p>Chúng tôi rất vui mừng thông báo rằng yêu cầu đăng ký Đại Lý của bạn tại <b>Holiday Fashion</b> đã được phê duyệt thành công.</p>"
                    + "<p>Bây giờ bạn đã có thể đăng nhập vào hệ thống và bắt đầu đặt hàng với tư cách Đại Lý để hưởng các chính sách ưu đãi cũng như hạn mức công nợ được cấp.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Holiday Fashion</p>";

            helper.setText(content, true);
            mailSender.send(message);
            log.info("Agent approval email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send agent approval email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendAgentRejectionEmail(String toEmail, String businessName) {
        if (isDefaultConfig()) {
            log.warn("BỎ QUA GỬI EMAIL: Chưa cấu hình MAIL_PASSWORD. Đã từ chối đại lý {}", businessName);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đăng ký Đại Lý chưa được phê duyệt");

            String content = "<h3>Xin chào " + (businessName != null ? businessName : "Đại Lý") + ",</h3>"
                    + "<p>Cảm ơn bạn đã quan tâm và đăng ký trở thành Đại Lý của <b>Holiday Fashion</b>.</p>"
                    + "<p>Tuy nhiên, sau quá trình xem xét, chúng tôi rất tiếc phải thông báo rằng yêu cầu đăng ký của bạn hiện tại chưa phù hợp với các tiêu chí của chúng tôi và không được phê duyệt.</p>"
                    + "<p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>"
                    + "<br/>"
                    + "<p>Trân trọng,<br/>Đội ngũ Holiday Fashion</p>";

            helper.setText(content, true);
            mailSender.send(message);
            log.info("Agent rejection email sent to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send agent rejection email to {}: {}", toEmail, e.getMessage());
        }
    }
}
