# Tài liệu Nghiệp vụ Chat Real-time (Chuẩn SOLID)

Tài liệu này mô tả kiến trúc và mã nguồn thực tế của tính năng Chat Real-time trong hệ thống, bao gồm cả phía Backend (Java Spring Boot) và Frontend (React). Kiến trúc đã được chuẩn hoá theo quy tắc SOLID, phân tách rõ ràng trách nhiệm giữa các class.

## 1. Sơ đồ Cấu trúc Cơ sở dữ liệu (Entities)

### `Conversation.java`

```java
package atmin.entity.chat;

import atmin.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@Getter @Setter
public class Conversation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ConversationType type = ConversationType.DIRECT;

    private String name;
    private String avatarUrl;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<ConversationMember> members = new ArrayList<>();
}
```

### `Message.java`

```java
package atmin.entity.chat;

import atmin.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_conv_id", columnList = "conversation_id, id")
})
@Getter @Setter
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private ContentType contentType = ContentType.TEXT;

    private String mediaUrl;

    @ManyToOne @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.SENT;

    private LocalDateTime deletedAt;
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

## 2. Kiến trúc Backend theo SOLID (Tầng Service)

Thay vì gộp việc truy vấn DB và mapping DTO vào chung 1 hàm, chúng ta đã bóc tách logic ánh xạ dữ liệu ra khỏi tầng Service, tuân thủ SRP (Single Responsibility Principle) và DIP (Dependency Inversion Principle).

### Interface `ChatService.java`

```java
package atmin.service.chat;

import atmin.controller.chat.dto.ConversationDTO;
import java.util.List;

public interface ChatService {
    ConversationDTO getOrCreateCustomerConversation(String customerId);
    List<ConversationDTO> getCustomerConversations(String customerId);
    List<ConversationDTO> getAllConversationsForAdmin(String adminId);
}
```

### Lớp Mapping Độc lập `ChatMapper.java`

```java
package atmin.service.chat.mapper;

import atmin.controller.chat.dto.ConversationDTO;
import atmin.controller.chat.dto.MessageDTO;
import atmin.entity.chat.Conversation;
import atmin.entity.chat.Message;
// ... imports
@Component
@RequiredArgsConstructor
public class ChatMapper {
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;

    public ConversationDTO mapConversationToDTO(Conversation conv, String requestUserId) {
        // Logic tính toán unread count và map sang DTO
    }

    public MessageDTO mapMessageToDTO(Message msg) {
        // Logic chuyển đổi Message sang MessageDTO
    }
}
```

---

## 3. Kiến trúc Frontend theo SOLID

Giao diện (View) không được phép chứa logic gọi API hoặc khởi tạo WebSocket. Thay vào đó, chúng được tách thành các Hook và Service.

### Tầng Gọi API (Network Layer) - `src/api/chat.api.ts`

```typescript
import { callApi } from '../util/callApi';
import { ConversationDTO, MessageDTO, ApiResponse } from '../types';

export const chatApi = {
    startConversation: () => callApi<ApiResponse<ConversationDTO>>('/chat/start', 'POST'),
    getAllConversations: () => callApi<ApiResponse<ConversationDTO[]>>('/chat/conversations', 'GET'),
    getMessages: (conversationId: string) => callApi<ApiResponse<MessageDTO[]>>(`/chat/${conversationId}/messages`, 'GET'),
    markAsRead: (conversationId: string) => callApi<ApiResponse<void>>(`/chat/${conversationId}/read`, 'POST')
};
```

### Tầng Quản lý State & WebSocket - `useChatWebSocket.ts`

Custom hook này sẽ ẩn đi sự phức tạp của STOMP, chỉ đưa ra ngoài các Data/Function cần thiết cho View.

```typescript
export function useChatWebSocket({ token, conversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // 1. Fetch tin nhắn khi đổi hội thoại
  // 2. Khởi tạo SockJS và STOMP client
  // 3. Subscribe vào topic: /topic/conversation/{conversationId}
  // 4. Lắng nghe tin nhắn mới và cập nhật state `messages`

  const sendMessage = useCallback((content: string) => {
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content, contentType: "TEXT" })
    });
  }, [conversationId]);

  return { messages, isConnected, sendMessage };
}
```

### Tầng Giao diện (Dumb Component) - `ChatWidget.tsx`

View giờ đây cực kì sạch sẽ, chỉ việc gọi Hook và render mảng `messages`.

```tsx
export function ChatWidget() {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Lấy dữ liệu và hàm gửi tin từ Hook
  const { messages, sendMessage, isConnected } = useChatWebSocket({ token, conversationId });

  // ... Render UI ...
}
```
