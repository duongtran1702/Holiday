import React, { useState, useRef, useEffect } from "react";
import { User, X, AlertTriangle, Camera, Lock } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slice/authSlice";
import { userApi } from "../../api/user.api";

import { toast } from "sonner";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [tab, setTab] = useState<"info" | "password">("info");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ 
    name: user?.fullName || "", 
    email: user?.email || "", 
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleSaveInfo = async () => {
    if (form.phone && !form.phone.match(/^(0|\+84)[0-9]{9}$/)) {
      toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số)");
      return;
    }
    const toastId = toast.loading("Đang cập nhật thông tin...");
    try {
      setLoading(true);
      let updatedUser = { ...user };
      
      // Upload avatar if changed
      if (selectedFile) {
        toast.loading("Đang tải ảnh lên...", { id: toastId });
        const res = await userApi.uploadAvatar(selectedFile);
        updatedUser = { ...updatedUser, ...res.data };
      }
      
      // Update info
      toast.loading("Đang lưu thông tin...", { id: toastId });
      const profileRes = await userApi.updateProfile({ fullName: form.name, phone: form.phone, address: form.address });
      updatedUser = { ...updatedUser, ...profileRes.data };
      
      dispatch(updateUser(updatedUser as any));
      toast.success("Cập nhật thông tin thành công!", { id: toastId });
      onClose();
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại sau.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
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
          {[{ key: "info", icon: User, label: "Thông tin" }, { key: "password", icon: Lock, label: "Đổi mật khẩu" }]
            .filter(t => !(t.key === "password" && user?.authProvider === "GOOGLE"))
            .map(t => (
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
                    {avatarPreview || user?.avatarUrl ? <img src={avatarPreview || user?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {form.name ? form.name.charAt(0).toUpperCase() : "U"}
                      </div>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                    <Camera size={13} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <p className="text-xs text-muted-foreground">Nhấp camera để đổi ảnh đại diện</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Họ và tên", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Số điện thoại", key: "phone", type: "tel" },
                  { label: "Địa chỉ nhận hàng", key: "address", type: "text" },
                ].map(f => (
                  <div key={f.key} className={f.key === "address" ? "col-span-2" : (f.key === "name" || f.key === "email" ? "col-span-2" : "col-span-2")}>
                    <label className="block text-xs font-medium mb-1.5">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      disabled={f.key === "email"}
                      className={`w-full text-sm px-3 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${f.key === "email" ? "opacity-60 cursor-not-allowed" : ""}`} />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveInfo} disabled={loading} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                {saved ? "✓ Đã lưu" : (loading ? "Đang lưu..." : "Lưu thông tin")}
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
              <button onClick={handleSavePassword} disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
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