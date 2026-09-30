package atmin.modules.user.service;

public interface IAgentEmailService {
    void sendAgentApprovalEmail(String toEmail, String businessName);
    void sendAgentRejectionEmail(String toEmail, String businessName);
}
