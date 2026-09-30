package atmin.modules.chat.service;

import atmin.chat.redis.RedisChatPublisher;
import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.chat.dto.ConversationDTO;
import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.dto.MessageRequest;
import atmin.modules.chat.entity.ChatMessage;
import atmin.modules.chat.entity.Conversation;
import atmin.modules.chat.repository.ChatMessageRepository;
import atmin.modules.chat.repository.ConversationRepository;
import atmin.modules.user.api.UserInternalApi;
import atmin.modules.user.api.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserInternalApi userInternalApi;
    private final RedisChatPublisher redisChatPublisher;

    @Override
    @Transactional
    public ConversationDTO startOrGetConversation(String customerId) {
        Conversation conversation = conversationRepository.findByCustomerIdAndStatus(customerId, "OPEN")
                .orElseGet(() -> {
                    UserDto customer;
                    try {
                        customer = userInternalApi.getUserById(customerId);
                    } catch (Exception e) {
                        throw new ResourceNotFoundException("Customer not found");
                    }
                    Conversation newConv = Conversation.builder()
                            .customerId(customer.getId())
                            .type("DIRECT")
                            .name("Chat với " + customer.getFullName())
                            .avatarUrl(customer.getAvatarUrl())
                            .status("OPEN")
                            .build();
                    return conversationRepository.save(newConv);
                });
        ConversationDTO dto = mapToConversationDTO(conversation, customerId);
        redisChatPublisher.publish("/topic/admin/conversations", "update");
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDTO> getMyConversations(String customerId) {
        return conversationRepository.findByCustomerId(customerId).stream()
                .map(conv -> mapToConversationDTO(conv, customerId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDTO> getAllConversations(String adminId) {
        return conversationRepository.findAll().stream()
                .map(conv -> mapToConversationDTO(conv, adminId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getMessages(String conversationId, String cursor, int limit, String requesterId, boolean supportAccess) {
        validateConversationAccess(conversationId, requesterId, supportAccess);
        if (cursor != null && !cursor.trim().isEmpty()) {
            ChatMessage cursorMsg = chatMessageRepository.findById(cursor).orElse(null);
            if (cursorMsg != null) {
                return chatMessageRepository.findByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc(
                        conversationId, cursorMsg.getCreatedAt(), PageRequest.of(0, limit))
                        .stream()
                        .map(this::mapToMessageDTO)
                        .collect(Collectors.toList());
            }
        }
        return chatMessageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, PageRequest.of(0, limit))
                .stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(String conversationId, String userId, boolean supportAccess) {
        validateConversationAccess(conversationId, userId, supportAccess);
        chatMessageRepository.markAsReadForUser(conversationId, userId);
        redisChatPublisher.publish("/topic/admin/conversations", "update");
        redisChatPublisher.publish("/topic/conversation/" + conversationId + "/read", Map.of("readerId", userId));
    }

    @Override
    @Transactional
    public MessageDTO processMessage(MessageRequest request, String senderId, boolean supportAccess) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!supportAccess && !conversation.getCustomerId().equals(senderId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
        
        UserDto sender;
        if ("bot".equals(senderId)) {
            try {
                sender = userInternalApi.getUserById("bot");
            } catch (Exception e) {
                // If bot does not exist, we just mock it for chat or it should be created by user service
                throw new ResourceNotFoundException("Bot not found, please create bot user first");
            }
        } else {
            try {
                sender = userInternalApi.getUserById(senderId);
            } catch (Exception e) {
                throw new ResourceNotFoundException("Sender not found");
            }
        }

        ChatMessage replyTo = null;
        if (request.getReplyToId() != null) {
            replyTo = chatMessageRepository.findById(request.getReplyToId()).orElse(null);
        }

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderId(sender.getId())
                .content(request.getContent())
                .contentType(request.getContentType() != null ? request.getContentType() : "TEXT")
                .mediaUrl(request.getMediaUrl())
                .replyToId(replyTo != null ? replyTo.getId() : null)
                .status("SENT")
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        MessageDTO messageDTO = mapToMessageDTO(savedMessage);
        
        redisChatPublisher.publish("/topic/conversation/" + conversation.getId(), messageDTO);
        redisChatPublisher.publish("/topic/admin/conversations", "update");
        
        return messageDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public void validateConversationAccess(String conversationId, String requesterId, boolean supportAccess) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!supportAccess && !conversation.getCustomerId().equals(requesterId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này");
        }
    }

    private ConversationDTO mapToConversationDTO(Conversation conversation, String readerId) {
        int unreadCount = chatMessageRepository.countUnreadMessagesForUser(conversation.getId(), readerId);
        ChatMessage lastMsg = chatMessageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
        
        MessageDTO lastMessageDTO = lastMsg != null ? mapToMessageDTO(lastMsg) : null;
        
        String name = conversation.getName();
        String avatarUrl = conversation.getAvatarUrl();

        UserDto customer = null;
        if (conversation.getCustomerId() != null) {
            try {
                customer = userInternalApi.getUserById(conversation.getCustomerId());
            } catch(Exception e) {}
        }

        if ("DIRECT".equals(conversation.getType()) && customer != null) {
            name = customer.getFullName();
            avatarUrl = customer.getAvatarUrl();
        }
        
        return ConversationDTO.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .name(name != null ? name : (customer != null ? customer.getFullName() : ""))
                .avatarUrl(avatarUrl != null ? avatarUrl : (customer != null ? customer.getAvatarUrl() : ""))
                .participantId(customer != null ? customer.getId() : null)
                .unreadCount(unreadCount)
                .lastMessage(lastMessageDTO)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    private MessageDTO mapToMessageDTO(ChatMessage message) {
        UserDto sender = null;
        try {
            sender = userInternalApi.getUserById(message.getSenderId());
        } catch(Exception e) {}

        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .senderName(sender != null ? sender.getFullName() : "Unknown")
                .senderAvatar(sender != null ? sender.getAvatarUrl() : null)
                .content(message.getContent())
                .contentType(message.getContentType())
                .mediaUrl(message.getMediaUrl())
                .replyToId(message.getReplyToId())
                .status(message.getStatus())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
