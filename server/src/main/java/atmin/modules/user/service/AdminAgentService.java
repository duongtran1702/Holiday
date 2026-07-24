package atmin.modules.user.service;

import atmin.modules.user.dto.AgentResponseDTO;
import atmin.modules.user.dto.UpdateCreditLimitRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;

public interface AdminAgentService {
    Page<AgentResponseDTO> getAllAgents(Pageable pageable);
    void approveAgent(String id);
    void rejectAgent(String id);
    void updateCreditLimit(String id, UpdateCreditLimitRequestDTO request);
}
