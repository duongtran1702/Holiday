package atmin.modules.user.service;

import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.order.service.OrderService;
import atmin.modules.user.dto.AgentResponseDTO;
import atmin.modules.user.dto.UpdateCreditLimitRequestDTO;
import atmin.modules.user.entity.AgentProfile;
import atmin.modules.user.entity.AgentStatus;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.AgentProfileRepository;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAgentServiceImpl implements AdminAgentService {

    private final AgentProfileRepository agentProfileRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final IAgentEmailService agentEmailService;

    @Override
    @Transactional(readOnly = true)
    public Page<AgentResponseDTO> getAllAgents(Pageable pageable) {
        Page<AgentProfile> profiles = agentProfileRepository.findAll(pageable);
        List<String> userIds = profiles.getContent().stream()
                .map(AgentProfile::getUserId)
                .collect(Collectors.toList());
        
        Map<String, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userRepository.findByIdInAndDeletedAtIsNull(userIds);
            for (User u : users) {
                userMap.put(u.getId(), u);
            }
        }
        
        Map<String, Long> orderCounts = orderService.getOrderCountsByUserIds(userIds);

        return profiles.map(p -> {
            User u = userMap.get(p.getUserId());
            String phone = u != null ? u.getPhoneNumber() : "";
            return AgentResponseDTO.builder()
                .id(p.getId())
                .name(p.getBusinessName())
                .contact(phone)
                .credit(p.getCreditLimit())
                .used(p.getUsedCredit())
                .orders(orderCounts.getOrDefault(p.getUserId(), 0L))
                .status(p.getStatus())
                .build();
        });
    }

    @Override
    @Transactional
    public void approveAgent(String id) {
        AgentProfile profile = agentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
                
        if (profile.getStatus() == AgentStatus.APPROVED) {
            return;
        }
        profile.setStatus(AgentStatus.APPROVED);
        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", profile.getUserId()));
        if ("suspended".equalsIgnoreCase(user.getStatus()) || "locked".equalsIgnoreCase(user.getStatus())) {
            // Keep the user banned/locked if admin already did that
        } else {
            user.setIsEnabled(true);
            user.setStatus("active");
            userRepository.save(user);
        }
        agentProfileRepository.save(profile);
        agentEmailService.sendAgentApprovalEmail(user.getEmail(), profile.getBusinessName());
    }

    @Override
    @Transactional
    public void rejectAgent(String id) {
        AgentProfile profile = agentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        profile.setStatus(AgentStatus.REJECTED);
        agentProfileRepository.save(profile);
        userRepository.findById(profile.getUserId()).ifPresent(user -> {
            agentEmailService.sendAgentRejectionEmail(user.getEmail(), profile.getBusinessName());
        });
    }

    @Override
    @Transactional
    public void updateCreditLimit(String id, UpdateCreditLimitRequestDTO request) {
        AgentProfile profile = agentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        profile.setCreditLimit(request.getCreditLimit());
        agentProfileRepository.save(profile);
    }
}
