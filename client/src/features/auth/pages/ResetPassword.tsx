import { Lock, ArrowRight, RefreshCw, AlertCircle, CheckCircle, Smartphone } from "lucide-react";
import { InputField } from "../../../core/components/common/InputField";
import { AuthLayout } from "../../../core/layout/AuthLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { authApi } from "../services/auth.api";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [countdown, setCountdown] = useState(email ? 60 : 0);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Không tìm thấy email, vui lòng quay lại trang Quên mật khẩu.");
      return;
    }
    if (countdown > 0) return;
    
    setCountdown(60);
    try {
      await authApi.forgotPassword({ email });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      toast.success("Đã gửi lại mã OTP vào email của bạn.");
    } catch (err: any) {
      setCountdown(0);
      toast.error(err.response?.data?.message || "Không thể gửi lại mã OTP.");
    }
  };
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleSubmit = async () => {
    const token = otp.join("");
    if (token.length < 6 || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải dài ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Mã khôi phục không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mã khôi phục từ email và mật khẩu mới của bạn."
      imgSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col justify-center flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">Holiday Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground">Đặt lại mật khẩu mới</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bảo mật tài khoản của bạn với mật khẩu mới.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Hoàn tất!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Mật khẩu của bạn đã được thay đổi thành công. Bạn đã có thể đăng nhập bằng mật khẩu mới.
              </p>
            </div>
            <button onClick={() => navigate("/login")}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Đăng nhập ngay <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-6">
              <label className="block text-center text-xs font-semibold text-foreground mb-2">Mã khôi phục (6 chữ số)</label>
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
            </div>
            
            <InputField label="Mật khẩu mới" icon={Lock} type="password" placeholder="••••••••" value={newPassword} onChange={setNewPassword} required />
            <InputField label="Xác nhận mật khẩu mới" icon={Lock} type="password" placeholder="••••••••" value={confirmPassword} onChange={setConfirmPassword} required />

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm border bg-red-50 border-red-200 text-red-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
              {loading ? <><RefreshCw size={14} className="animate-spin" />Đang xử lý...</> : <>Đổi mật khẩu <ArrowRight size={14} /></>}
            </button>

            <div className="flex items-center justify-between text-sm mt-6">
              <button onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                Quay lại đăng nhập
              </button>
              {email ? (
                countdown > 0
                  ? <span className="text-xs text-muted-foreground">Gửi lại mã ({countdown}s)</span>
                  : <button onClick={handleResendOtp} className="text-xs text-accent hover:underline">Gửi lại mã OTP</button>
              ) : (
                <button onClick={() => navigate("/forgot-password")} className="text-xs text-accent hover:underline">Nhận lại mã?</button>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
