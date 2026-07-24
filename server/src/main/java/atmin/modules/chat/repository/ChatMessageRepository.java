package atmin.modules.chat.repository;

import atmin.modules.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId);

    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    Page<ChatMessage> findByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc(String conversationId, java.time.LocalDateTime createdAt, Pageable pageable);

    @Modifying
    @Query("UPDATE ChatMessage c SET c.status = 'READ' WHERE c.conversationId = :conversationId AND c.status != 'READ' AND c.senderId != :readerId")
    void markAsReadForUser(@Param("conversationId") String conversationId, @Param("readerId") String readerId);
    
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.conversationId = :conversationId AND c.status != 'READ' AND c.senderId != :readerId")
    int countUnreadMessagesForUser(@Param("conversationId") String conversationId, @Param("readerId") String readerId);
    
    ChatMessage findFirstByConversationIdOrderByCreatedAtDesc(String conversationId);
    
    @Modifying
    void deleteByConversationId(String conversationId);
}
