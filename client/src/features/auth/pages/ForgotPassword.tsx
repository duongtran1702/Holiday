import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { InputField } from "../../../core/components/common/InputField";
import { AuthLayout } from "../../../core/layout/AuthLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../services/auth.api";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
      toast.success("Mã khôi phục đã được gửi vào email của bạn!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Khôi phục mật khẩu"
      subtitle="Nhập email của bạn để nhận mã khôi phục."
      imgSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col justify-center flex-1 px-8 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">Holiday Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground">Quên mật khẩu?</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Đừng lo lắng, chúng tôi sẽ gửi cho bạn hướng dẫn khôi phục mật khẩu qua email.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Đã gửi email khôi phục!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Vui lòng kiểm tra hòm thư của <span className="font-medium text-foreground">{email}</span> để lấy mã khôi phục (OTP).
              </p>
            </div>
            <button onClick={() => navigate("/reset-password", { state: { email } })}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Tiếp tục nhập mã <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate("/login")} className="text-sm text-accent hover:underline">
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <InputField label="Email" icon={Mail} type="email" placeholder="Nhập email đã đăng ký..." value={email} onChange={setEmail} required />

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm border bg-red-50 border-red-200 text-red-700">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <><RefreshCw size={14} className="animate-spin" />Đang gửi...</> : <>Nhận mã khôi phục <ArrowRight size={14} /></>}
            </button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Nhớ mật khẩu?{" "}
              <button onClick={() => navigate("/login")} className="text-accent font-semibold hover:underline">Về đăng nhập</button>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
