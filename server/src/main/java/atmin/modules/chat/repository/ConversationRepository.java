package atmin.modules.chat.repository;

import atmin.modules.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    Optional<Conversation> findByCustomerIdAndStatus(String customerId, String status);
    List<Conversation> findByCustomerId(String customerId);
}
