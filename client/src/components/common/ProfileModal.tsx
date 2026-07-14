import React, { useState, useRef } from "react";
import { User, X, AlertTriangle, Camera, Lock } from "lucide-react";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "password">("info");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "Nguyễn Văn Minh", email: "minh@example.com", phone: "0901 234 567" });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold">Tài khoản của tôi</h2>
            <p className="text-primary-foreground/50 text-xs mt-0.5">Quản lý thông tin cá nhân</p>
          </div>
          <button onClick={onClose} className="text-primary-foreground/50 hover:text-primary-foreground p-1"><X size={18} /></button>
        </div>
        <div className="flex border-b border-border">
          {[{ key: "info", icon: User, label: "Thông tin" }, { key: "password", icon: Lock, label: "Đổi mật khẩu" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="px-6 py-5">
          {tab === "info" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border">
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>M</div>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                    <Camera size={13} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <p className="text-xs text-muted-foreground">Nhấp camera để đổi ảnh đại diện</p>
              </div>
              {[
                { label: "Họ và tên", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Số điện thoại", key: "phone", type: "tel" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full text-sm px-3 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                </div>
              ))}
              <button onClick={handleSave} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {saved ? "✓ Đã lưu" : "Lưu thông tin"}
              </button>
            </div>
          )}
          {tab === "password" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa và chữ số.
              </div>
              {[
                { label: "Mật khẩu hiện tại", key: "current" },
                { label: "Mật khẩu mới", key: "next" },
                { label: "Xác nhận mật khẩu mới", key: "confirm" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5">{f.label}</label>
                  <input type="password" value={(pwForm as any)[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="••••••••" className="w-full text-sm px-3 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
                </div>
              ))}
              {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && <p className="text-xs text-destructive">Mật khẩu không khớp</p>}
              <button onClick={handleSave} disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"}`}>
                {saved ? "✓ Đã đổi mật khẩu" : "Đổi mật khẩu"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}