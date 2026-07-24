package atmin.modules.user.dto;

import atmin.modules.user.entity.AgentStatus;
import java.math.BigDecimal;

public interface AgentSummaryProjection {
    String getId();
    String getBusinessName();
    String getUserId();
    String getPhoneNumber();
    BigDecimal getCreditLimit();
    BigDecimal getUsedCredit();
    AgentStatus getStatus();
}
