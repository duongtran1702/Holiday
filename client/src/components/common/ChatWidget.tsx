import React, { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, Paperclip, Headphones } from "lucide-react";
import { nowTime } from "../../util/helpers";

export function ChatWidget({ loggedInAs }: { loggedInAs?: { name: string; role: "customer" | "agent" } }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [guestForm, setGuestForm] = useState({ name: "", phone: "" });
  const [guestReady, setGuestReady] = useState(!!loggedInAs);
  const [unread, setUnread] = useState(1);
  const [faqSent, setFaqSent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAfterHours = new Date().getHours() >= 22 || new Date().getHours() < 7;

  const userName = loggedInAs?.name ?? guestForm.name;

  useEffect(() => {
    if (open && messages.length === 0 && guestReady) {
      const welcome: ChatMsg = {
        id: "w1", from: "bot", time: nowTime(),
        text: isAfterHours
          ? "Hiện tại cửa hàng đã nghỉ. Vui lòng để lại lời nhắn hoặc số điện thoại, chúng tôi sẽ liên hệ lại vào sáng mai 🌙"
          : `Chào ${userName || "bạn"}! Cửa hàng thời trang Atmin có thể giúp gì cho bạn? 😊`,
      };
      setMessages([welcome]);
      setUnread(0);
    }
  }, [open, guestReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMsg = { id: Date.now().toString(), from: "user", text: text.trim(), time: nowTime() };
    setMessages(prev => [...prev, msg]);
    setInput("");
    // Simulate staff reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), from: "staff", time: nowTime(),
        text: "Cảm ơn bạn đã liên hệ! Nhân viên Atmin sẽ phản hồi trong giây lát. Trong thời gian chờ, bạn có thể tham khảo các câu hỏi thường gặp bên dưới.",
      }]);
    }, 1500);
  };

  const sendFaq = (faq: typeof FAQ_BUTTONS[0]) => {
    const userMsg: ChatMsg = { id: Date.now().toString(), from: "user", text: faq.label, time: nowTime() };
    const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), from: "bot", text: faq.answer, time: nowTime() };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setFaqSent(true);
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
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Hỗ trợ Holiday Fashion</p>
              <p className="text-xs text-primary-foreground/50">{isAfterHours ? "Ngoài giờ làm việc" : "Đang trực tuyến · Trả lời ngay"}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/50 hover:text-primary-foreground p-1 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Guest form */}
          {!guestReady ? (
            <div className="flex-1 flex flex-col justify-center px-5 py-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Headphones size={24} className="text-accent" />
                </div>
                <h3 className="font-semibold text-sm">Bắt đầu trò chuyện</h3>
                <p className="text-xs text-muted-foreground mt-1">Nhập thông tin để nhân viên tiện hỗ trợ bạn</p>
              </div>
              <div className="space-y-2.5">
                <input value={guestForm.name} onChange={e => setGuestForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Họ và tên *" className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/40" />
                <input value={guestForm.phone} onChange={e => setGuestForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Số điện thoại *" type="tel" className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/40" />
              </div>
              <button onClick={() => { if (guestForm.name && guestForm.phone) setGuestReady(true); }}
                disabled={!guestForm.name || !guestForm.phone}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-all">
                Bắt đầu chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.from !== "user" && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.from === "bot" ? "bg-muted text-muted-foreground" : "bg-accent text-white"}`}>
                        {msg.from === "bot" ? "🤖" : "A"}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${msg.from === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

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

              {/* Input */}
              <div className="shrink-0 border-t border-border px-3 py-2.5 flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <Paperclip size={15} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(input); } }}
                  placeholder="Nhập tin nhắn..." className="flex-1 text-xs px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30" />
                <button onClick={() => sendMsg(input)} disabled={!input.trim()}
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