import React, { useState, useEffect, useRef } from "react";
import { Tag, Send, Paperclip, ArrowLeft, TagIcon, UserCheck } from "lucide-react";
import { nowTime } from "../../util/helpers";

type ChatMsg = {
  id: string;
  from: "user" | "staff" | "bot";
  text: string;
  time: string;
};

type Convo = {
  id: string;
  name: string;
  phone: string;
  role: "customer" | "agent" | "guest";
  lastMsg: string;
  lastTime: string;
  unread: number;
  tag?: string;
  messages: ChatMsg[];
};

const TAGS = ["Hỗ trợ đơn hàng", "Khiếu nại", "Tư vấn size", "Đại lý"];

const ROLE_COLOR: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700",
  agent: "bg-purple-50 text-purple-700",
  guest: "bg-gray-50 text-gray-700"
};

const ROLE_LABEL: Record<string, string> = {
  customer: "Khách lẻ",
  agent: "Đại lý",
  guest: "Khách vãng lai"
};

const DEMO_CONVOS: Convo[] = [
  {
    id: "c1",
    name: "Trần Minh",
    phone: "0901234567",
    role: "customer",
    lastMsg: "Cảm ơn bạn nhé",
    lastTime: "10:30",
    unread: 2,
    tag: "Tư vấn size",
    messages: [
      { id: "m1", from: "user", text: "Shop ơi áo sơ mi nam size L còn màu trắng không?", time: "10:28" },
      { id: "m2", from: "bot", text: "Dạ sản phẩm này hiện đang còn màu trắng size L ạ. Bạn có muốn đặt hàng luôn không?", time: "10:28" },
      { id: "m3", from: "user", text: "Cảm ơn bạn nhé", time: "10:30" }
    ]
  },
  {
    id: "c2",
    name: "Đại lý TPHCM (Chị Mai)",
    phone: "0988777666",
    role: "agent",
    lastMsg: "Lên cho mình đơn 50 áo phông",
    lastTime: "09:15",
    unread: 0,
    tag: "Đại lý",
    messages: [
      { id: "m1", from: "user", text: "Chào shop, bảng giá sỉ tháng này có gì thay đổi không?", time: "09:10" },
      { id: "m2", from: "staff", text: "Dạ không thay đổi ạ, vẫn áp dụng mức chiết khấu 30% cho mốc 50 sản phẩm chị nhé.", time: "09:12" },
      { id: "m3", from: "user", text: "Lên cho mình đơn 50 áo phông", time: "09:15" }
    ]
  }
];

export function AdminInbox() {
  const [convos, setConvos] = useState<Convo[]>(DEMO_CONVOS);
  const [activeId, setActiveId] = useState<string>(DEMO_CONVOS[0].id);
  const [reply, setReply] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  // Layout preference: "standard" = staff RIGHT / customer LEFT (mặc định, giống Zalo)
  //                   "reversed" = staff LEFT / customer RIGHT
  const [layout, setLayout] = useState<"standard" | "reversed">("standard");
  const bottomRef = useRef<HTMLDivElement>(null);
  const active = convos.find(c => c.id === activeId)!;

  // staffOnRight = true means staff msg bubble sits on RIGHT
  const staffOnRight = layout === "standard";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages.length]);

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg: ChatMsg = { id: Date.now().toString(), from: "staff", text: reply.trim(), time: nowTime() };
    setConvos(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, msg], lastMsg: reply.trim(), lastTime: nowTime(), unread: 0 }
      : c));
    setReply("");
  };

  const setTag = (tag: string) => {
    setConvos(prev => prev.map(c => c.id === activeId ? { ...c, tag } : c));
    setTagOpen(false);
  };

  const markRead = (id: string) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setActiveId(id);
  };

  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full gap-0 -m-5 overflow-hidden rounded-xl border border-border bg-card" style={{ height: "calc(100vh - 120px)" }}>
      {/* Left: conversation list */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Hộp thư hỗ trợ</h2>
            {totalUnread > 0 && <p className="text-xs text-accent mt-0.5">{totalUnread} tin chưa đọc</p>}
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{convos.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {convos.map(c => (
            <button key={c.id} onClick={() => markRead(c.id)}
              className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors ${activeId === c.id ? "bg-accent/5 border-l-2 border-accent" : ""}`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${c.role === "agent" ? "bg-purple-100 text-purple-700" : c.role === "customer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-semibold truncate">{c.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{c.lastTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">{c.lastMsg}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[c.role]}`}>{ROLE_LABEL[c.role]}</span>
                    {c.tag && <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full">{c.tag}</span>}
                    {c.unread > 0 && <span className="ml-auto bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{c.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="shrink-0 px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${active.role === "agent" ? "bg-purple-100 text-purple-700" : active.role === "customer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
            {active.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{active.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[active.role]}`}>{ROLE_LABEL[active.role]}</span>
              {active.tag && <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">{active.tag}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{active.phone}</p>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tag picker */}
            <div className="relative">
              <button onClick={() => setTagOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
                <TagIcon size={12} /> {active.tag ?? "Gắn thẻ"}
              </button>
              {tagOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20 w-44">
                  {TAGS.map(t => (
                    <button key={t} onClick={() => setTag(t)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${active.tag === t ? "font-semibold text-accent" : ""}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <UserCheck size={12} /> Chuyển Admin
            </button>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-muted/10">
          {active.messages.map(msg => {
            // Determine which side this bubble goes to
            const isMyMsg = msg.from === "staff" || msg.from === "bot";
            const myOnRight = staffOnRight;
            const bubbleRight = isMyMsg ? myOnRight : !myOnRight;

            return (
              <div key={msg.id} className={`flex gap-2.5 ${bubbleRight ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {isMyMsg ? (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${msg.from === "bot" ? "bg-muted border border-border text-muted-foreground" : "bg-accent text-white"}`}>
                    {msg.from === "bot" ? "🤖" : "NV"}
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto ${active.role === "agent" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {active.name[0]}
                  </div>
                )}
                {/* Bubble */}
                <div className={`max-w-[65%] flex flex-col gap-0.5 ${bubbleRight ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-muted-foreground px-1">
                    {msg.from === "bot" ? "Bot tự động" : msg.from === "staff" ? "Nhân viên Atmin" : active.name}
                  </span>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-muted text-foreground " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                      : msg.from === "bot"
                      ? "bg-card border border-border text-foreground " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                      : "bg-accent text-white " + (bubbleRight ? "rounded-tr-sm" : "rounded-tl-sm")
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div className="shrink-0 border-t border-border px-5 py-3 bg-card">
          <div className="flex items-end gap-2.5">
            <textarea value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder={`Trả lời ${active.name}...`} rows={2}
              className="flex-1 text-sm px-3 py-2 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none" />
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={sendReply} disabled={!reply.trim()}
                className="w-9 h-9 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-40">
                <Send size={15} />
              </button>
              <button className="w-9 h-9 border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                <Paperclip size={14} />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Enter để gửi · Shift+Enter xuống dòng</p>
        </div>
      </div>
    </div>
  );
}
