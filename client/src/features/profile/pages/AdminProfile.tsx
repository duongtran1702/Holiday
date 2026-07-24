import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera, Save, Lock, Shield, MapPin, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "../../auth";
import { userApi } from "../services/user.api";
import { authApi } from "../../auth/services/auth.api";

export function AdminProfile() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const userRole = useSelector((state: any) => state.auth.userRole);
  
  const isAdmin = userRole === "admin";
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Password form
  const [pass, setPass] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Đang tải ảnh lên...", { id: "avatar" });
      const res = await userApi.uploadAvatar(file);
      if (res.data) {
        dispatch(updateUser(res.data));
        toast.success("Cập nhật ảnh thành công", { id: "avatar" });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi tải ảnh", { id: "avatar" });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.fullName.trim()) {
      toast.error("Họ tên không được để trống");
      return;
    }
    
    setLoading(true);
    try {
      const res = await userApi.updateProfile(profile);
      if (res.data) {
        dispatch(updateUser(res.data));
        toast.success("Cập nhật thông tin thành công");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pass.oldPassword || !pass.newPassword || !pass.confirmPassword) {
      toast.error("Vui lòng nhập đủ thông tin mật khẩu");
      return;
    }
    if (pass.newPassword !== pass.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    setLoading(true);
    try {
      await authApi.changePassword(pass);
      toast.success("Đổi mật khẩu thành công!");
      setPass({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-accent/10 border-4 border-background shadow-lg">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-accent">
                    {user?.fullName?.[0] || "U"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            
            <h3 className="font-semibold text-lg">{user?.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
              <Shield size={12} />
              {isAdmin ? "Quản trị viên (Admin)" : "Nhân viên (Staff)"}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold flex items-center gap-2"><User size={16} className="text-accent"/> Thông tin cá nhân</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      value={profile.fullName} 
                      onChange={e => setProfile({...profile, fullName: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Email (Không thể đổi)</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      value={user?.email || ""} 
                      disabled
                      className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-lg opacity-60"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Địa chỉ</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      value={profile.address} 
                      onChange={e => setProfile({...profile, address: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  <Save size={16} /> Lưu thông tin
                </button>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold flex items-center gap-2"><Lock size={16} className="text-accent"/> Đổi mật khẩu</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Mật khẩu hiện tại</label>
                <input 
                  type="password"
                  value={pass.oldPassword} 
                  onChange={e => setPass({...pass, oldPassword: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Mật khẩu mới</label>
                  <input 
                    type="password"
                    value={pass.newPassword} 
                    onChange={e => setPass({...pass, newPassword: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Xác nhận mật khẩu</label>
                  <input 
                    type="password"
                    value={pass.confirmPassword} 
                    onChange={e => setPass({...pass, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                >
                  <Save size={16} /> Cập nhật mật khẩu
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
