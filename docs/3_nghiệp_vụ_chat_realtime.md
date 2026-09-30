# Nghiệp vụ Chat Realtime (STOMP WebSocket & Spring Boot)

Tài liệu này mô tả chi tiết toàn bộ kiến trúc, luồng xử lý và các đoạn code cốt lõi (Core logic) của tính năng Chat Real-time giữa Khách hàng (Customer) và Nhân viên/Hệ thống (Admin/Bot). Nó được thiết kế làm tài liệu tham khảo để có thể dễ dàng tái sử dụng trong các dự án sau này.

## 1. Kiến trúc Tổng Quan (Architecture)

Hệ thống sử dụng **Hybrid Approach** (Kết hợp giữa REST API và WebSocket) để tối ưu hiệu năng và độ tin cậy:
- **REST API**: Dùng cho việc tải dữ liệu ban đầu (lấy danh sách chat, tải lịch sử tin nhắn với cursor-based pagination) và các action tĩnh như đánh dấu đã đọc (`markAsRead`), gửi tin nhắn bot (`bot-reply`).
- **WebSocket (STOMP)**: Dùng để pub/sub (phát/nhận) các sự kiện realtime thời gian thực với độ trễ thấp như: tin nhắn mới (`chat.send`), trạng thái đang gõ (`chat.typing`), và trạng thái đã đọc (`/read`).

### Luồng Hoạt Động Cốt Lõi
1. **Kết nối**: Client gửi kèm JWT Token trong header. `WebSocketAuthInterceptor` ở Backend xác thực.
2. **Gửi tin**: Client gọi qua STOMP (hoặc REST API với Bot) `destination: /app/chat.send`.
3. **Xử lý Server**: Server nhận, lưu vào Database (Trạng thái mặc định: `SENT`), convert sang DTO và broadcast tin nhắn vừa tạo qua topic: `/topic/conversation/{conversationId}`.
4. **Optimistic Update**: Ngay khi khách hàng bấm gửi, UI sẽ render tạm tin nhắn (`optimistic message`) với id tạm (`temp-...`). Khi nhận lại tin nhắn từ server, nó sẽ tự replace id tạm bằng id thật từ DB.
5. **Read Receipt (Đã đọc)**: Khi đối phương mở cửa sổ chat, client tự động gọi REST API `/chat/{id}/read`. Backend update CSDL và broadcast event `{readerId: "..."}` qua STOMP. Client bắt event này và chuyển các tin nhắn tương ứng sang trạng thái `READ` (Hiển thị ✓✓).

---

## 2. Core Backend (Java / Spring Boot)

### 2.1 Entity & Repository
Tính năng dựa trên 2 entity chính là `Conversation` và `ChatMessage`.
**Lưu ý quan trọng**: Việc đếm số tin nhắn chưa đọc và đánh dấu đã đọc cực kỳ quan trọng và phải sử dụng query hiệu năng cao.

```java
// ChatMessageRepository.java
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    
    // Pagination (Cursor-based)
    Page<ChatMessage> findByConversationIdAndCreatedAtLessThanOrderByCreatedAtDesc(
            String conversationId, java.time.LocalDateTime createdAt, Pageable pageable);

    // Đánh dấu đã đọc bằng câu lệnh Bulk Update
    @Modifying
    @Query("UPDATE ChatMessage c SET c.status = 'READ' WHERE c.conversation.id = :conversationId AND c.status != 'READ' AND c.sender.id != :readerId")
    void markAsReadForUser(@Param("conversationId") String conversationId, @Param("readerId") String readerId);
    
    // Đếm số lượng tin nhắn chưa đọc đối với user hiện tại
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.conversation.id = :conversationId AND c.status != 'READ' AND c.sender.id != :readerId")
    int countUnreadMessagesForUser(@Param("conversationId") String conversationId, @Param("readerId") String readerId);
}
```

### 2.2 WebSocket Controller
Nơi tiếp nhận các bản tin STOMP từ Client đẩy lên.

```java
// ChatWebSocketController.java
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        String senderId = resolveSenderId(principal.getName());
        
        if (senderId != null) {
            chatService.processMessage(request, senderId);
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        String senderId = resolveSenderId(principal.getName());
                
        if (senderId != null) {
            // Broadcast tín hiệu gõ chữ đến topic
            messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId() + "/typing", senderId);
        }
    }
}
```

### 2.3 Xử lý Logic (ChatService)
Xử lý lưu tin nhắn và Pub/Sub qua `SimpMessagingTemplate`.

```java
// ChatServiceImpl.java
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageDTO processMessage(MessageRequest request, String senderId) {
        // 1. Tạo và lưu message vào database (Trạng thái SENT)
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender) // User thực tế
                .content(request.getContent())
                .status("SENT")
                .build();
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        // 2. Chuyển sang DTO
        MessageDTO messageDTO = mapToMessageDTO(savedMessage);
        
        // 3. Broadcast sự kiện tin nhắn mới (Topic riêng cho từng cuộc hội thoại)
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), messageDTO);
        
        // Broadcast để Admin Inbox tự động cập nhật danh sách hội thoại ở Sidebar
        messagingTemplate.convertAndSend("/topic/admin/conversations", "update");
        
        return messageDTO;
    }

    @Override
    @Transactional
    public void markAsRead(String conversationId, String userId) {
        // Bulk update DB
        chatMessageRepository.markAsReadForUser(conversationId, userId);
        
        // Phát sự kiện /read để các client đang mở cửa sổ chat cập nhật UI ngay lập tức
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", java.util.Map.of("readerId", userId));
    }
}
```

---

## 3. Core Frontend (React / TypeScript)

### 3.1 Mạng & State Management (`useChatWebSocket.ts`)
Đây là **Trái tim (Core Hook)** của tính năng Chat. Nó bóc tách hoàn toàn logic mạng, giao thức STOMP, quản lý state và phân trang. Code này hoàn toàn có thể copy sang dự án khác sử dụng React.

```typescript
// useChatWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi } from '../api/chat.api';

export function useChatWebSocket({ token, conversationId, onAdminUpdate, onNewMessage, isViewing = true, userId }: UseChatOptions) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);

  // References cho việc unsubscribe
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const typingSubRef = useRef<StompSubscription | null>(null);
  const readSubRef = useRef<StompSubscription | null>(null);

  const markAsReadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Mark as Read
  const triggerMarkAsRead = useCallback((convId: string) => {
    if (markAsReadTimeout.current) clearTimeout(markAsReadTimeout.current);
    markAsReadTimeout.current = setTimeout(() => {
      chatApi.markAsRead(convId).catch(err => console.error("Read err:", err));
    }, 1000);
  }, []);

  // 1. Connection Lifecycle
  useEffect(() => {
    if (!token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      if (conversationId) subscribeToConversation(client, conversationId);
    };
    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [token]);

  // 2. Subscription Management
  const subscribeToConversation = (client: Client, convId: string) => {
    // Unsubscribe cũ
    subscriptionRef.current?.unsubscribe();
    typingSubRef.current?.unsubscribe();
    readSubRef.current?.unsubscribe();
    
    // Đăng ký tin nhắn mới
    subscriptionRef.current = client.subscribe(`/topic/conversation/${convId}`, (msg: IMessage) => {
      const newMsg: MessageDTO = JSON.parse(msg.body);
      
      setMessages(prev => {
        // Ngăn trùng lặp
        if (prev.some(m => m.id === newMsg.id)) return prev;

        // Xử lý Optimistic Update (Thay id tạm bằng id thật)
        const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === newMsg.content);
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = newMsg;
          return updated;
        }
        return [...prev, newMsg];
      });

      // Nếu người dùng đang mở cửa sổ, gửi tín hiệu Đã đọc
      if (isViewingRef.current) triggerMarkAsRead(convId);
    });

    // Đăng ký nhận sự kiện Typing (có Debounce tự động xoá sau 3 giây)
    typingSubRef.current = client.subscribe(`/topic/conversation/${convId}/typing`, (msg: IMessage) => {
      const typingUserId = msg.body;
      if (typingUserId !== userId) {
        setTypingUsers(prev => prev.includes(typingUserId) ? prev : [...prev, typingUserId]);
        // Tự động xoá indicator sau 3 giây nếu không gõ tiếp
        setTimeout(() => setTypingUsers(prev => prev.filter(id => id !== typingUserId)), 3000);
      }
    });

    // Đăng ký nhận sự kiện Read Receipt (QUAN TRỌNG)
    readSubRef.current = client.subscribe(`/topic/conversation/${convId}/read`, (msg: IMessage) => {
      const payload = JSON.parse(msg.body);
      const readerId = payload.readerId;
      
      setMessages(prev => prev.map(m => {
        // Logic bất khả chiến bại: Bất kỳ tin nhắn nào KHÔNG DO NGƯỜI ĐỌC GỬI, 
        // thì có nghĩa là nó đã được người đó đọc -> chuyển thành READ.
        // Xử lý hoàn hảo cho cả Admin, Customer, Bot và Staff.
        if (m.senderId !== readerId && m.status !== "READ") {
          return { ...m, status: "READ" };
        }
        return m;
      }));
    });
  };

  // 3. Gửi tin nhắn (Với Optimistic UI)
  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content })
    });

    // Hiện tin nhắn ngay lập tức trước khi server phản hồi
    const optimisticMsg: MessageDTO = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: userId || "user",
      content,
      status: "SENT",
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
  }, [conversationId, userId]);

  return { messages, isConnected, sendMessage, setMessages /*...*/ };
}
```

### 3.2 UI Logic (Tích hợp Bot, Admin và Customer)
Khi hiển thị UI, cần phân biệt rõ **Tin của ai** để xếp trái/phải.

**Tại Admin Inbox:**
Admin cần nhìn thấy Bot ở **cùng bên** với mình (cùng đại diện cho cửa hàng).
```tsx
// AdminInbox.tsx
{messages.map(msg => {
  // Bao gồm ID của tôi, staff, hoặc bot
  const isMyMsg = msg.senderId === user?.id || msg.senderId === "staff" || msg.senderId === "bot";
  const bubbleRight = isMyMsg; // Hiển thị bên phải

  // Hiển thị Avatar cho bot
  const renderAvatar = () => {
    if (msg.senderId === "bot") return <div className="bg-muted">🤖</div>;
    return <img src={msg.senderAvatar} />;
  };

  return (
    <div className={`flex ${bubbleRight ? "flex-row-reverse" : ""}`}>
      {renderAvatar()}
      <div className={bubbleRight ? "bg-accent" : "bg-muted"}>
         {msg.content}
         {/* Read Receipt */}
         {isMyMsg && msg.status === "READ" && <span>✓✓</span>}
         {isMyMsg && msg.status === "SENT" && <span>✓</span>}
      </div>
    </div>
  )
})}
```

**Tại Customer Widget:**
Khách hàng cần nhìn thấy Bot, Admin, Staff ở phía đối diện.
```tsx
// ChatWidget.tsx
const isUser = msg.senderId === user?.id || msg.senderId === "user";
const bubbleRight = isUser; // Hiển thị bên phải
// Nếu không phải isUser, hiển thị phía bên trái, bao gồm cả Bot và Admin.
```

---

## 4. Những Điểm Khó Đã Giải Quyết (Lessons Learned)

1. **Lỗi Trạng Thái "Đã đọc" (Read Receipts) chéo ID**:
   - Nếu Client dựa vào ID của mình (`m.senderId === myId`) để set trạng thái tin nhắn thành "Đã đọc", hệ thống sẽ bị lỗi khi Bot hoặc Staff nhắn thay cho tài khoản Admin, dẫn đến mismatch ID.
   - **Giải pháp dứt điểm**: Khi Websocket trả về ID người vừa đọc (`readerId`), chỉ cần loop qua toàn bộ tin nhắn: `if (m.senderId !== readerId) -> status = READ`. Điều này đảm bảo cứ đối phương đọc, toàn bộ tin của mình và phía mình đều thành đã đọc.

2. **Lỗi Spam API `/read` khi cuộn**:
   - Khách hàng hoặc Admin mở hộp thoại, các tin nhắn liên tục đổ về sẽ kích hoạt hàm `triggerMarkAsRead` hàng chục lần.
   - **Giải pháp**: Xài `Debounce` bằng `setTimeout(..., 1000)`. Dù có 100 tin nhắn đổ về 1 lúc, API `/read` cũng chỉ được gửi đi 1 lần sau 1 giây kể từ khi tin nhắn cuối cùng xuất hiện.

3. **Lỗi "Tự kỷ" (Tự đọc tin nhắn của chính mình)**:
   - Trong `countUnreadMessagesForUser`, nếu chỉ tính `status != READ`, ngưởi gửi sẽ thấy chính tin nhắn của mình nằm trong mục "Chưa đọc".
   - **Giải pháp**: Query phải loại trừ tin nhắn do chính mình gửi: `c.sender.id != :readerId`.

4. **Optimistic Update và WebSocket Race Condition**:
   - Nếu sử dụng mảng index để xóa thay vì ID, tin nhắn có thể bị trùng lặp khi server phản hồi lâu.
   - **Giải pháp**: Tạo ID tạm thời (`temp-12345`). Khi Server trả tin nhắn mới về, tìm đúng tin có id `temp-` và có `content` trùng khớp để `replace`.

Tài liệu này đóng gói toàn bộ quy trình từ Client đến Database của một hệ thống Realtime Chat mang đẳng cấp Production.
