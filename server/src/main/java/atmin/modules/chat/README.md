# Module Chat (Hệ thống Nhắn tin Realtime)

Module này chịu trách nhiệm cho toàn bộ tính năng nhắn tin giữa Người dùng (Customer/Agent/Guest) và Quản trị viên (Admin/Staff), sử dụng WebSocket (STOMP qua SockJS) để đảm bảo độ trễ thấp và giao tiếp hai chiều thời gian thực.

## 1. Tổng quan (Overview)

Module Chat không chỉ lưu trữ tin nhắn mà còn quản lý trạng thái trực tuyến (Presence), hiển thị trạng thái "đang gõ" (Typing indicator) và đánh dấu đã đọc (Read Receipt).
Ở phía Server, `ChatWebSocketController` lắng nghe các sự kiện qua WebSocket. Phía Client sử dụng hook `useChatWebSocket` để kết nối STOMP.

## 2. Sơ đồ luồng chi tiết & Tương tác BE - Client

Dưới đây là luồng gửi một tin nhắn realtime:

**Luồng gửi tin nhắn:**
```text
[Client: useChatWebSocket.ts] 
    1. STOMP Client kết nối `/ws` và subscribe vào `/topic/conversation/{id}`
    2. Gọi hàm `sendMessage(content)` → `client.publish({ destination: '/app/chat.send', body: ... })`
    ↓ 
[Server: ChatWebSocketController] → `sendMessage(@Payload MessageRequest)`
    3. `ChatService.processMessage()` lưu tin nhắn vào Database (MongoDB hoặc RDBMS).
    4. Trả về `MessageDTO`.
    5. Dùng `SimpMessagingTemplate` broadcast tin nhắn lên kênh `/topic/conversation/{id}`
    ↓
[Client: useChatWebSocket.ts]
    6. Nhận event từ `/topic/conversation/{id}`
    7. Update Redux/Local State, UI tự động cuộn xuống tin nhắn mới nhất.
```

### Core Code Snippet (Server)

*File: `server/.../chat/controller/ChatWebSocketController.java`*
```java
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        String senderId = ... // Lấy ID từ Principal
                
        if (senderId != null) {
            // Xử lý lưu tin nhắn và broadcast (ChatService gọi SimpMessagingTemplate bên trong)
            chatService.processMessage(request, senderId);
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload MessageRequest request, Principal principal) {
        String senderId = ... // Lấy ID
        messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId() + "/typing", senderId);
    }
}
```

### Core Code Snippet (Client)

*File: `client/src/core/store/useChatWebSocket.ts`*
```typescript
export function useChatWebSocket({ token, conversationId }) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token) return;
    
    // Khởi tạo Stomp Client
    const client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.REACT_APP_API_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        // Lắng nghe tin nhắn mới
        client.subscribe(`/topic/conversation/${conversationId}`, (message) => {
          const newMsg = JSON.parse(message.body);
          setMessages(prev => [...prev, newMsg]);
        });
      }
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [token, conversationId]);

  const sendMessage = (content: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ conversationId, content })
      });
    }
  };

  return { messages, sendMessage };
}
```

## 3. Các tính năng Realtime khác

- **Presence (Trạng thái Online/Offline)**: Client kết nối WS → `WebSocketEventListener` bắt sự kiện `SessionConnectedEvent` và lưu vào bộ nhớ tạm/Redis. Admin có thể thấy chấm xanh của user trên UI.
- **Typing Indicator**: Khi user gõ phím, STOMP gửi sự kiện `/app/chat.typing`. Phía client nhận event và hiển thị thông báo "đang gõ...".
- **Đánh dấu đã đọc**: Gọi REST API riêng lẻ (`POST /api/v1/chat/conversations/{id}/read`) để báo Server cập nhật `unreadCount = 0`.

## 4. API / Interface liên quan

**REST API (Sử dụng HTTP thông thường):**
- `GET /api/v1/chat/conversations` (Lấy danh sách hội thoại cho Hộp thư)
- `GET /api/v1/chat/conversations/{id}/messages` (Tải lịch sử tin nhắn khi vừa click vào 1 hội thoại)
- `POST /api/v1/chat/conversations/{id}/read` (Đánh dấu đã đọc)

**WebSocket Channels:**
- Gửi: `/app/chat.send`, `/app/chat.typing`
- Nhận: `/topic/conversation/{id}`, `/topic/admin` (Nhận thông báo chung cho Admin)

## 5. Rủi ro đã biết / Chưa xử lý (Known limitations)

- **CORS / Auth over WebSocket**: WebSocket gốc không hỗ trợ truyền Header Authorization tốt. Việc sử dụng Stomp `connectHeaders` đôi khi bị tường lửa chặn, nên dùng fallback SockJS là bắt buộc.
- Khi scale ngang (chạy nhiều instances của Backend), cần cấu hình Spring Session & Redis Pub/Sub cho WebSocket broker, nếu không User kết nối node 1 sẽ không chat được với Admin kết nối node 2. (Hiện tại đang dùng Simple Broker trên bộ nhớ).

## 6. Cách test thủ công (How to verify)

1. Mở Hộp thư ở màn hình Admin (Trình duyệt A).
2. Đóng vai khách hàng ở giao diện ngoài (Trình duyệt B ẩn danh).
3. Khách hàng gửi tin nhắn → Admin phải thấy tin nhắn nổi lên ngay lập tức mà không cần reload trang.
4. Kiểm tra chấm xanh (Online Presence) xuất hiện ở tên khách hàng khi tab được mở.
