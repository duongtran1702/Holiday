package atmin.modules.auth.service;

public interface IAuthEmailService {
    void sendResetPasswordEmail(String toEmail, String resetToken);
    void send2FAEmail(String toEmail, String otpCode);
    void sendNewStaffEmail(String toEmail, String fullName, String rawPassword);
}