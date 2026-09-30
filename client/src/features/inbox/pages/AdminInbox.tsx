import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { chatApi } from "../services/chat.api";
import { ConversationDTO } from "../../../core/types";


const ROLE_COLOR: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700",
  agent: "bg-purple-50 text-purple-700",
  guest: "bg-gray-50 text-gray-700",
  DIRECT: "bg-blue-50 text-blue-700",
  GROUP: "bg-purple-50 text-purple-700",
};

const ROLE_LABEL: Record<string, string> = {
  customer: "Khách lẻ",
  agent: "Đại lý",
  guest: "Khách vãng lai",
  DIRECT: "Trực tiếp",
  GROUP: "Nhóm",
};

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  return date.toLocaleDateString();
};

export function AdminInbox() {
  const [convos, setConvos] = useState<ConversationDTO[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [reply, setReply] = useState("");
  const [layout, setLayout] = useState<"standard" | "reversed">("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth token
  const token = useSelector((state: any) => state.auth.accessToken);
  const user = useSelector((state: any) => state.auth.user);

  const fetchConvos = () => {
    chatApi.getAllConversations().then(res => {
      if (res?.data) {
        setConvos(res.data);
      }
    });
  };

  const { messages, sendMessage, isConnected, hasMore, isLoadingMore, loadMore, typingUsers, sendTyping, presenceMap } = useChatWebSocket({ 
    token, 
    conversationId: activeId,
    onAdminUpdate: () => fetchConvos(),
    userId: user?.id,
    userName: user?.fullName,
    userAvatar: user?.avatarUrl
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
      scrollHeightRef.current = e.currentTarget.scrollHeight;
      loadMore();
    }
  };

  useEffect(() => {
    if (!isLoadingMore && scrollHeightRef.current > 0 && messagesContainerRef.current) {
       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - scrollHeightRef.current;
       scrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore]);

  const handleInput = (val: string) => {
    setReply(val);
    if (!typingTimeoutRef.current) {
      sendTyping();
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const active = convos.find(c => c.id === activeId);
  const staffOnRight = layout === "standard";

  // Load conversations
  useEffect(() => {
    if (token) {
      fetchConvos();
    }
  }, [token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollHeightRef.current === 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeId, messages]);

  const sendReply = () => {
    if (!reply.trim() || !activeId || !isConnected) return;
    sendMessage(reply.trim());
    setReply("");
  };

  const markRead = (id: string) => {
    setActiveId(id);
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  };

  const totalUnread = convos.reduce((s, c) => s + c.unreadCount, 0);
  const unreadConversations = convos.filter(c => c.unreadCount > 0).length;

  return (
    <div className="flex h-full gap-0 -m-5 overflow-hidden rounded-xl border border-border bg-card" style={{ height: "calc(100vh - 120px)" }}>
      {/* Left: conversation list */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Hộp thư hỗ trợ</h2>
            {totalUnread > 0 && <p className="text-xs text-accent mt-0.5">{unreadConversations} khách / {totalUnread} tin mới</p>}
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{convos.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {convos.map(c => (
            <button key={c.id} onClick={() => markRead(c.id)}
              className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors ${activeId === c.id ? "bg-accent/5 border-l-2 border-accent" : ""}`}>
              <div className="flex items-start gap-2.5">
                {c.avatarUrl ? (
                  <div className="relative shrink-0 mt-0.5">
                    <img src={c.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    {c.participantId && presenceMap[c.participantId]?.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                ) : (
                  <div className={`relative shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c.type === "GROUP" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {c.name ? c.name[0] : "K"}
                    {c.participantId && presenceMap[c.participantId]?.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-semibold truncate">{c.name || "Khách hàng"}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {c.lastMessage ? c.lastMessage.content : "Chưa có tin nhắn"}
                  </p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[c.type] || ROLE_COLOR.DIRECT}`}>
                      {ROLE_LABEL[c.type] || ROLE_LABEL.DIRECT}
                    </span>
                    {c.unreadCount > 0 && <span className="ml-auto bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{c.unreadCount}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
              {active.avatarUrl ? (
                <img src={active.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${active.type === "GROUP" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {active.name ? active.name[0] : "K"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{active.name || "Khách hàng"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[active.type] || ROLE_COLOR.DIRECT}`}>
                    {ROLE_LABEL[active.type] || ROLE_LABEL.DIRECT}
                  </span>
                </div>
                {(() => {
                  const p = active.participantId ? presenceMap[active.participantId] : null;
                  if (p?.online) {
                    return <p className="text-xs text-green-500 mt-0.5 font-medium">● Đang trực tuyến</p>;
                  }
                  if (p?.lastSeenAt) {
                    return <p className="text-xs text-muted-foreground mt-0.5">Hoạt động {formatTimeAgo(p.lastSeenAt)}</p>;
                  }
                  return <p className="text-xs text-muted-foreground mt-0.5">Ngoại tuyến</p>;
                })()}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Layout toggle */}
                <button
                  onClick={() => setLayout(l => l === "standard" ? "reversed" : "standard")}
                  title={layout === "standard" ? "Đang: Tôi bên phải — Nhấn để đổi" : "Đang: Tôi bên trái — Nhấn để đổi"}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <ArrowLeft size={12} className={layout === "standard" ? "rotate-180" : ""} />
                  {layout === "standard" ? "Tôi: Phải" : "Tôi: Trái"}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-muted/10" ref={messagesContainerRef} onScroll={handleScroll}>
              {isLoadingMore && (
                <div className="flex justify-center py-2">
                  <div className="animate-pulse flex gap-1">
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              {messages.map(msg => {
                const isMyMsg = msg.senderId === user?.id || msg.senderId === "staff" || msg.senderId === "bot";
                const myOnRight = staffOnRight;
                const bubbleRight = isMyMsg ? myOnRight : !myOnRight;
                const bubbleColor = !isMyMsg ? "bg-muted text-foreground" : (msg.senderId === "bot" ? "bg-muted text-foreground border border-border" : "bg-accent text-white");
                const bubbleCorner = bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm";
                const bubbleStyle = `${bubbleColor} ${bubbleCorner}`;

                return (
                  <div key={msg.id} className={`flex gap-2.5 ${bubbleRight ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    {isMyMsg ? (
                      msg.senderAvatar ? (
                        <img src={msg.senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto bg-accent" />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.senderId === "bot" ? "bg-muted text-muted-foreground" : "bg-accent text-white"}`}>
                          {msg.senderId === "bot" ? "🤖" : (msg.senderName?.[0] || "NV")}
                        </div>
                      )
                    ) : (
                      msg.senderAvatar || active.avatarUrl ? (
                        <img src={msg.senderAvatar || active.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto bg-blue-100" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto bg-blue-100 text-blue-700">
                          {msg.senderName?.[0] || active.name?.[0] || "K"}
                        </div>
                      )
                    )}
                    {/* Bubble */}
                    <div className={`max-w-[65%] flex flex-col gap-0.5 ${bubbleRight ? "items-end" : "items-start"}`}>
                      <span className="text-xs text-muted-foreground px-1">
                        {isMyMsg ? (msg.senderName || "Tôi") : (msg.senderName || active.name || "Khách hàng")}
                      </span>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${bubbleStyle}`}>
                        {msg.content}
                      </div>
                      <span className={`text-[10px] text-muted-foreground px-1 flex items-center gap-1 ${bubbleRight ? "justify-end" : "justify-start"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isMyMsg && msg.status === "READ" && <span className="text-blue-500 font-bold">✓✓</span>}
                        {isMyMsg && msg.status === "DELIVERED" && <span className="text-muted-foreground font-bold">✓✓</span>}
                        {isMyMsg && msg.status === "SENT" && <span className="text-muted-foreground font-bold">✓</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="px-5 pb-2 pt-2 bg-muted/10 flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700">
                  {active.name?.[0] || "K"}
                </div>
                <div className="px-3 py-2 rounded-2xl bg-muted text-foreground flex gap-1 items-center rounded-tl-sm h-8">
                  <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}

            {/* Reply input */}
            <div className="shrink-0 border-t border-border px-5 py-3 bg-card">
              <div className="flex items-end gap-2.5">
                <textarea value={reply} onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder={`Trả lời ${active.name || "Khách hàng"}...`} rows={2}
                  disabled={!isConnected}
                  className="flex-1 text-sm px-3 py-2 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none" />
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={sendReply} disabled={!reply.trim() || !isConnected}
                    className="w-9 h-9 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40">
                    <Send size={15} />
                  </button>
                  <button className="w-9 h-9 border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                    <Paperclip size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Chọn một cuộc hội thoại để xem
          </div>
        )}
      </div>
    </div>
  );
}
