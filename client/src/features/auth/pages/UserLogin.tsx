import { Lock, ArrowRight, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { InputField } from "../../../core/components/common/InputField";
import { AuthLayout } from "../../../core/layout/AuthLayout";
import { useNavigate } from "react-router-dom";
import { useUserLogin } from "../hooks/useUserLogin";

export function UserLoginPage() {
  const navigate = useNavigate();
  const {
    email, setEmail,
    password, setPassword,
    userError,
    userLoading,
    handleUserLogin,
    googleLogin
  } = useUserLogin();

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục quản lý cửa hàng thời trang Atmin của bạn."
      imgSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col justify-center flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">Holiday Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground">Đăng nhập Khách hàng / Đại lý</h1>
          <p className="text-muted-foreground text-sm mt-1">Chào mừng bạn quay trở lại.</p>
        </div>

        <div className="space-y-4">
          <InputField label="Email" icon={Mail} type="email" placeholder="example@email.com" value={email} onChange={setEmail} required />
          <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={setPassword} required />

          {userError && (
            <div className={`flex items-start gap-2.5 p-3 rounded-lg text-sm border ${userError.includes("chờ") ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{userError}</p>
            </div>
          )}

          <button onClick={handleUserLogin} disabled={userLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
            {userLoading ? <><RefreshCw size={14} className="animate-spin" />Đang kiểm tra...</> : <>Đăng nhập <ArrowRight size={14} /></>}
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button type="button" onClick={() => googleLogin()} className="w-full flex items-center justify-center gap-2.5 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Đăng nhập với Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <button onClick={() => navigate("/register")} className="text-accent font-semibold hover:underline">Đăng ký ngay</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
