package atmin.modules.chat.service;

import atmin.modules.chat.dto.ConversationDTO;
import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.dto.MessageRequest;

import java.util.List;

public interface ChatService {
    ConversationDTO startOrGetConversation(String customerId);
    List<ConversationDTO> getMyConversations(String customerId);
    List<ConversationDTO> getAllConversations(String adminId);
    List<MessageDTO> getMessages(String conversationId, String cursor, int limit);
    void markAsRead(String conversationId, String userId);
    MessageDTO processMessage(MessageRequest request, String senderId);
}
