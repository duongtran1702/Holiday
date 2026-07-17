import { Lock, ArrowRight, Mail, ShieldCheck, AlertCircle, Smartphone, RotateCcw } from "lucide-react";
import { InputField } from "../../../core/components/common/InputField";
import { AuthLayout } from "../../../core/layout/AuthLayout";
import { useNavigate } from "react-router-dom";
import { useAdminLogin } from "../hooks/useAdminLogin";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    adminEmail, setAdminEmail,
    adminPw, setAdminPw,
    adminStep, setAdminStep,
    otp, 
    adminError, setAdminError,
    failCount, setFailCount,
    countdown, 
    otpRefs,
    handleAdminCreds,
    handleResendOtp,
    handleOtpInput,
    handleOtpVerify
  } = useAdminLogin();

  return (
    <AuthLayout
      title="Cổng bảo mật nội bộ"
      subtitle="Quản trị hệ thống và vận hành Holiday Fashion."
      imgSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col justify-center flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">Holiday Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground">Đăng nhập Nội bộ</h1>
          <p className="text-muted-foreground text-sm mt-1">Hệ thống quản trị và vận hành.</p>
        </div>

        <div>
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl mb-5">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">Cổng đăng nhập nội bộ bảo mật</p>
              <p className="text-xs text-muted-foreground">Yêu cầu xác thực 2 yếu tố (2FA) bắt buộc</p>
            </div>
          </div>

          {adminStep === "creds" && (
            <div className="space-y-4">
              <InputField label="Email nội bộ" icon={Mail} type="email" placeholder="admin@atmin.vn" value={adminEmail} onChange={setAdminEmail} required />
              <InputField label="Mật khẩu hệ thống" icon={Lock} type="password" placeholder="••••••••" value={adminPw} onChange={setAdminPw} required />
              {adminError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" /><p>{adminError}</p>
                </div>
              )}
              {failCount > 0 && failCount < 5 && (
                <div className="flex gap-1.5 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < failCount ? "bg-destructive" : "bg-muted"}`} />
                  ))}
                  <span className="text-xs text-destructive ml-1">{failCount}/5</span>
                </div>
              )}
              <button onClick={handleAdminCreds}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                Tiếp tục <ArrowRight size={14} />
              </button>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Nhầm lẫn?{" "}
                <button onClick={() => navigate("/login")} className="text-accent font-semibold hover:underline">Về trang Khách hàng</button>
              </p>
            </div>
          )}

          {adminStep === "locked" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Lock size={28} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Tài khoản bị tạm khóa</h3>
                <p className="text-sm text-muted-foreground mt-1">Đăng nhập sai quá 5 lần. Tài khoản bị khóa tạm thời.</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium mb-1">Mở khóa sau:</p>
                <p className="text-2xl font-mono font-bold text-destructive">
                  {Math.floor(countdown / 60).toString().padStart(2, "0")}:{(countdown % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Email cảnh báo xâm nhập đã được gửi đến Chủ shop.</p>
              <button onClick={() => { setAdminStep("creds"); setFailCount(0); setAdminError(""); }}
                className="text-sm text-accent hover:underline">Liên hệ Admin để mở khóa</button>
            </div>
          )}

          {adminStep === "otp" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone size={24} className="text-accent" />
                </div>
                <h3 className="font-semibold text-base">Xác thực 2 bước (2FA)</h3>
                <p className="text-sm text-muted-foreground mt-1">Nhập mã 6 chữ số từ ứng dụng Google Authenticator hoặc SMS gửi đến <strong>{adminEmail}</strong></p>
              </div>

              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" maxLength={1} value={d}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    className="w-11 h-12 text-center text-lg font-bold border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                ))}
              </div>

              {adminError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={14} />{adminError}
                </div>
              )}

              <button onClick={handleOtpVerify} disabled={otp.join("").length < 6}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <ShieldCheck size={15} /> Xác thực & Đăng nhập
              </button>

              <div className="flex items-center justify-between text-sm">
                <button onClick={() => setAdminStep("creds")} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                  <RotateCcw size={12} /> Quay lại
                </button>
                {countdown > 0
                  ? <span className="text-xs text-muted-foreground">Gửi lại mã ({countdown}s)</span>
                  : <button onClick={handleResendOtp} className="text-xs text-accent hover:underline">Gửi lại mã OTP</button>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
