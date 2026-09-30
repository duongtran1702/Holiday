import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, Paperclip, Headphones } from "lucide-react";
import { useSelector } from "react-redux";
import { chatApi, useChatWebSocket } from "../../../features/inbox";
import { MessageDTO } from "../../types";

const FAQ_BUTTONS = [
  { label: "Chính sách đổi trả", answer: "Atmin hỗ trợ đổi trả trong vòng 7 ngày với sản phẩm còn nguyên tem mác." },
  { label: "Phí vận chuyển", answer: "Miễn phí vận chuyển cho đơn hàng từ 500k. Đơn dưới 500k phí ship là 30k toàn quốc." },
  { label: "Cách chọn size", answer: "Bạn có thể tham khảo bảng size ở phần chi tiết sản phẩm hoặc cung cấp chiều cao cân nặng để shop tư vấn nhé!" }
];

export function ChatWidget({ loggedInAs }: Readonly<{ loggedInAs?: { name: string; role: "customer" | "agent" } }>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [guestForm] = useState({ name: "", phone: "" });
  const [unread, setUnread] = useState(0);
  const [faqSent, setFaqSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const isAfterHours = new Date().getHours() >= 22 || new Date().getHours() < 7;
  const conversationIdRef = useRef<string | null>(null);
  const [conversationId, setConversationIdState] = useState<string | null>(null);

  const setConversationId = (id: string | null) => {
    conversationIdRef.current = id;
    setConversationIdState(id);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
      scrollHeightRef.current = e.currentTarget.scrollHeight;
      loadMore();
    }
  };

  const token = useSelector((state: any) => state.auth.accessToken);
  const user = useSelector((state: any) => state.auth.user);
  
  const isReady = !!loggedInAs || !!user;
  
  const userName = loggedInAs?.name ?? guestForm.name ?? user?.fullName;

  const { messages, sendMessage, isConnected, hasMore, isLoadingMore, loadMore, typingUsers, sendTyping } = useChatWebSocket({ 
    token, 
    conversationId, 
    isViewing: open,
    userId: user?.id,
    userName: userName,
    userAvatar: user?.avatarUrl,
    onNewMessage: (msg: MessageDTO) => {
      if (!open && msg.senderId !== "user" && msg.senderId !== user?.id) {
        setUnread(prev => prev + 1);
      }
    }
  });

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoadingMore && scrollHeightRef.current > 0 && messagesContainerRef.current) {
       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - scrollHeightRef.current;
       scrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore]);

  const handleInput = (val: string) => {
    setInput(val);
    if (!typingTimeoutRef.current) {
      sendTyping();
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  // Initialize conversation when component mounts to get real unread count
  useEffect(() => {
    if (isReady && token && !conversationId) {
      chatApi.getMyConversations().then((res: any) => {
        if (res?.data && res.data.length > 0) {
          const conv = res.data[0];
          setConversationId(conv.id);
          if (!open) {
            setUnread(conv.unreadCount);
          }
        } else if (open) {
          // If no conversation exists, and user opens chat, start one
          chatApi.startConversation().then((startRes: any) => {
            if (startRes && startRes.data) {
              setConversationId(startRes.data.id);
            }
          }).catch((err: any) => console.error("Could not start chat:", err));
        }
      }).catch((err: any) => console.error("Could not fetch conversation:", err));
    }
  }, [open, isReady, token, conversationId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    if (scrollHeightRef.current === 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMsg = (text: string) => {
    if (!text.trim() || !isConnected) return;
    sendMessage(text);
    setInput("");
  };

  const sendFaq = (faq: typeof FAQ_BUTTONS[0]) => {
    // Send user message
    sendMessage(faq.label);
    setFaqSent(true);
    
    // Gửi yêu cầu lưu tin nhắn trả lời tự động của bot lên server
    if (conversationId) {
      setTimeout(() => {
        chatApi.sendBotReply(conversationId, faq.answer).catch((err: any) => console.error("Failed to send bot reply:", err));
      }, 500);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Chat window */}
      {open && (
        <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: "480px" }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold">A</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-primary ${isConnected ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Hỗ trợ Holiday Fashion</p>
              <p className="text-xs text-primary-foreground/50">{isAfterHours ? "Ngoài giờ làm việc" : (isConnected ? "Đang trực tuyến" : "Đang kết nối...")}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/50 hover:text-primary-foreground p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Guest form (if not logged in, though we need token so user should be logged in realistically) */}
          {!isReady ? (
            <div className="flex-1 flex flex-col justify-center px-5 py-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Headphones size={24} className="text-accent" />
                </div>
                <h3 className="font-semibold text-sm">Bắt đầu trò chuyện</h3>
                <p className="text-xs text-muted-foreground mt-1">Vui lòng đăng nhập để chat với nhân viên</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" ref={messagesContainerRef} onScroll={handleScroll}>
                {isLoadingMore && (
                  <div className="flex justify-center py-2">
                    <div className="animate-pulse flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                
                {messages.length === 0 && isConnected && (
                  <div className="flex gap-2">
                     <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto bg-muted text-muted-foreground">🤖</div>
                     <div className="max-w-[75%] items-start flex flex-col gap-0.5">
                       <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed bg-muted text-foreground rounded-tl-sm">
                         {isAfterHours 
                           ? "Hiện tại cửa hàng đã nghỉ. Vui lòng để lại lời nhắn, chúng tôi sẽ liên hệ lại vào sáng mai 🌙"
                           : `Chào ${userName || "bạn"}! Cửa hàng thời trang Atmin có thể giúp gì cho bạn? 😊`}
                       </div>
                     </div>
                  </div>
                )}

                {messages.map(msg => {
                  const isUser = msg.senderId === user?.id || msg.senderId === "user";
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                      {isUser ? (
                        user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-auto bg-primary/10" />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto bg-primary text-primary-foreground">
                            {userName?.[0] || "U"}
                          </div>
                        )
                      ) : (
                        msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-auto bg-accent/10" />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.senderId === "bot" ? "bg-muted text-muted-foreground" : "bg-accent text-white"}`}>
                            {msg.senderId === "bot" ? "🤖" : "A"}
                          </div>
                        )
                      )}
                      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                        <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1 justify-end">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {isUser && msg.status === "READ" && <span className="text-blue-500 font-bold">✓✓</span>}
                          {isUser && msg.status === "DELIVERED" && <span className="text-muted-foreground font-bold">✓✓</span>}
                          {isUser && msg.status === "SENT" && <span className="text-muted-foreground font-bold">✓</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* FAQ quick buttons */}
                {messages.length > 0 && !faqSent && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-muted-foreground text-center">Câu hỏi thường gặp:</p>
                    {FAQ_BUTTONS.map(faq => (
                      <button key={faq.label} onClick={() => sendFaq(faq)}
                        className="w-full text-left text-xs px-3 py-2 border border-accent/30 text-accent bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors">
                        {faq.label}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 pb-2 flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-accent/20 text-accent">
                    A
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-muted text-foreground flex gap-1 items-center rounded-tl-sm h-8">
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 border-t border-border px-3 py-2.5 flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <Paperclip size={15} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                <input value={input} onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                  placeholder="Nhập tin nhắn..." className="flex-1 text-xs px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30" />
                <button onClick={() => sendMsg(input)} disabled={!input.trim() || !isConnected}
                  className="w-8 h-8 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40">
                  <Send size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating bubble */}
      <button onClick={() => { setOpen(v => !v); setUnread(0); }}
        className="w-13 h-13 bg-accent text-white rounded-full shadow-xl flex items-center justify-center hover:bg-accent/90 hover:scale-105 transition-all relative"
        style={{ width: 52, height: 52 }}>
        {open ? <X size={20} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}