package atmin.modules.chat.service;

import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.chat.dto.ConversationDTO;
import atmin.modules.chat.dto.MessageDTO;
import atmin.modules.chat.dto.MessageRequest;
import atmin.modules.chat.entity.ChatMessage;
import atmin.modules.chat.entity.Conversation;
import atmin.modules.chat.repository.ChatMessageRepository;
import atmin.modules.chat.repository.ConversationRepository;
import atmin.modules.user.entity.User;
import atmin.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ConversationDTO startOrGetConversation(String customerId) {
        Conversation conversation = conversationRepository.findByCustomerIdAndStatus(customerId, "OPEN")
                .orElseGet(() -> {
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                    Conversation newConv = Conversation.builder()
                            .customer(customer)
                            .type("DIRECT")
                            .name("Chat với " + customer.getFullName())
                            .avatarUrl(customer.getAvatarUrl())
                            .status("OPEN")
                            .build();
                    return conversationRepository.save(newConv);
                });
        ConversationDTO dto = mapToConversationDTO(conversation, customerId);
        messagingTemplate.convertAndSend("/topic/admin/conversations", "update");
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
    public List<MessageDTO> getMessages(String conversationId, String cursor, int limit) {
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
    public void markAsRead(String conversationId, String userId) {
        chatMessageRepository.markAsReadForUser(conversationId, userId);
        messagingTemplate.convertAndSend("/topic/admin/conversations", "update");
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", java.util.Map.of("readerId", userId));
    }

    @Override
    @Transactional
    public MessageDTO processMessage(MessageRequest request, String senderId) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        User sender;
        if ("bot".equals(senderId)) {
            sender = userRepository.findById("bot").orElseGet(() -> {
                User bot = User.builder()
                        .id("bot")
                        .email("bot@atmin.vn")
                        .fullName("Holiday Bot")
                        .password("")
                        .status("active")
                        .isEnabled(true)
                        .build();
                return userRepository.save(bot);
            });
        } else {
            sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        }

        ChatMessage replyTo = null;
        if (request.getReplyToId() != null) {
            replyTo = chatMessageRepository.findById(request.getReplyToId()).orElse(null);
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .contentType(request.getContentType() != null ? request.getContentType() : "TEXT")
                .mediaUrl(request.getMediaUrl())
                .replyTo(replyTo)
                .status("SENT")
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        MessageDTO messageDTO = mapToMessageDTO(savedMessage);
        
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), messageDTO);
        messagingTemplate.convertAndSend("/topic/admin/conversations", "update");
        
        return messageDTO;
    }

    private ConversationDTO mapToConversationDTO(Conversation conversation, String readerId) {
        int unreadCount = chatMessageRepository.countUnreadMessagesForUser(conversation.getId(), readerId);
        ChatMessage lastMsg = chatMessageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
        
        MessageDTO lastMessageDTO = lastMsg != null ? mapToMessageDTO(lastMsg) : null;
        
        String name = conversation.getName();
        String avatarUrl = conversation.getAvatarUrl();

        if ("DIRECT".equals(conversation.getType()) && conversation.getCustomer() != null) {
            name = "Chat với " + conversation.getCustomer().getFullName();
            avatarUrl = conversation.getCustomer().getAvatarUrl();
        }
        
        return ConversationDTO.builder()
                .id(conversation.getId())
                .type(conversation.getType())
                .name(name != null ? name : (conversation.getCustomer() != null ? conversation.getCustomer().getFullName() : ""))
                .avatarUrl(avatarUrl != null ? avatarUrl : (conversation.getCustomer() != null ? conversation.getCustomer().getAvatarUrl() : ""))
                .unreadCount(unreadCount)
                .lastMessage(lastMessageDTO)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    private MessageDTO mapToMessageDTO(ChatMessage message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderAvatar(message.getSender().getAvatarUrl())
                .content(message.getContent())
                .contentType(message.getContentType())
                .mediaUrl(message.getMediaUrl())
                .replyToId(message.getReplyTo() != null ? message.getReplyTo().getId() : null)
                .status(message.getStatus())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
