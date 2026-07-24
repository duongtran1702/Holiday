import { User, CheckCircle, Clock, Lock, ArrowRight, Building2, Phone, Mail, AlertCircle, Info } from "lucide-react";
import { InputField } from "../../../core/components/common/InputField";
import { AuthLayout } from "../../../core/layout/AuthLayout";
import { useRegister } from "../hooks/useRegister";

export function RegisterPage() {
  const {
    tab, setTab,
    b2cStep, setB2cStep,
    b2bStep, setB2bStep,
    isRegistering,
    b2c, setB2c,
    b2cOtp, 
    b2cError, setB2cError,
    otpRefs2,
    b2b, setB2b,
    b2bError, setB2bError,
    handleB2cOtp,
    handleB2CSubmit,
    handleB2BSubmit,
    navigate
  } = useRegister();

  return (
    <AuthLayout
      title="Tham gia cùng Holiday Fashion"
      subtitle="Tạo tài khoản để mua sắm trực tuyến hoặc đăng ký làm đối tác đại lý phân phối."
      imgSrc="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&auto=format"
    >
      <div className="flex flex-col flex-1 px-8 py-10 max-w-lg mx-auto w-full">
        <div className="mb-7">
          <div className="lg:hidden mb-4">
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold italic text-primary">Holiday Fashion</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-muted-foreground text-sm mt-1">Chọn loại tài khoản phù hợp với nhu cầu của bạn.</p>
        </div>

        {/* Account type selector */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { key: "b2c", icon: User, title: "Khách hàng cá nhân", sub: "Mua lẻ với giá niêm yết" },
            { key: "b2b", icon: Building2, title: "Đối tác / Đại lý", sub: "Mua sỉ, chiết khấu đặc biệt" },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setB2cError(""); setB2bError(""); setB2cStep("form"); setB2bStep("form"); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${tab === t.key ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-accent/40"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tab === t.key ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>
                <t.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* B2C Form */}
        {tab === "b2c" && b2cStep === "form" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Họ và tên" icon={User} placeholder="Nguyễn Văn A" value={b2c.name} onChange={(v) => setB2c(p => ({ ...p, name: v }))} required />
              <InputField label="Số điện thoại" icon={Phone} type="tel" placeholder="09xx xxx xxx" value={b2c.phone} onChange={(v) => setB2c(p => ({ ...p, phone: v }))} required />
            </div>
            <InputField label="Email" icon={Mail} type="email" placeholder="email@example.com" value={b2c.email} onChange={(v) => setB2c(p => ({ ...p, email: v }))} required hint="Mã xác thực sẽ được gửi đến email này" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2c.pw} onChange={(v) => setB2c(p => ({ ...p, pw: v }))} required hint="Tối thiểu 8 ký tự" />
              <InputField label="Xác nhận mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2c.confirm} onChange={(v) => setB2c(p => ({ ...p, confirm: v }))} required />
            </div>
            {b2cError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle size={14} />{b2cError}</div>}
            <button onClick={handleB2CSubmit} disabled={isRegistering}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
              {isRegistering ? "Đang đăng ký..." : "Đăng ký tài khoản" } <ArrowRight size={14} />
            </button>
          </div>
        )}

        {tab === "b2c" && b2cStep === "otp" && (
          <div className="space-y-5 text-center">
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3"><Mail size={24} className="text-accent" /></div>
              <h3 className="font-semibold">Xác thực Email</h3>
              <p className="text-sm text-muted-foreground mt-1">Mã OTP đã được gửi đến <strong>{b2c.email || "email của bạn"}</strong>. Có hiệu lực trong 10 phút.</p>
            </div>
            <div className="flex gap-2 justify-center">
              {b2cOtp.map((d, i) => (
                <input key={i} ref={el => { otpRefs2.current[i] = el; }} type="text" maxLength={1} value={d}
                  onChange={(e) => handleB2cOtp(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) otpRefs2.current[i - 1]?.focus(); }}
                  className="w-11 h-12 text-center text-lg font-bold border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" />
              ))}
            </div>
            <button onClick={() => setB2cStep("done")} disabled={b2cOtp.join("").length < 6}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <CheckCircle size={15} /> Xác thực & Hoàn tất
            </button>
          </div>
        )}

        {tab === "b2c" && b2cStep === "done" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-emerald-700">Đăng ký thành công!</h3>
              <p className="text-sm text-muted-foreground mt-2">Chào mừng <strong>{b2c.name || "bạn"}</strong> đến với Holiday Fashion. Tài khoản đã sẵn sàng để mua sắm.</p>
            </div>
            <button onClick={() => navigate("/login")} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Bắt đầu mua sắm <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* B2B Form */}
        {tab === "b2b" && b2bStep === "form" && (
          <div className="space-y-3.5">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-2">
              <Info size={13} className="shrink-0 mt-0.5" />
              Hồ sơ đại lý sẽ được Ban quản trị xét duyệt trước khi kích hoạt. Thời gian: 1-2 ngày làm việc.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Người đại diện" icon={User} placeholder="Họ và tên" value={b2b.name} onChange={v => setB2b(p => ({ ...p, name: v }))} required />
              <InputField label="Số điện thoại" icon={Phone} type="tel" placeholder="09xx xxx xxx" value={b2b.phone} onChange={v => setB2b(p => ({ ...p, phone: v }))} required />
            </div>
            <InputField label="Email đăng nhập" icon={Mail} type="email" placeholder="business@email.com" value={b2b.email} onChange={v => setB2b(p => ({ ...p, email: v }))} required />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2b.pw} onChange={v => setB2b(p => ({ ...p, pw: v }))} required />
              <InputField label="Xác nhận mật khẩu" icon={Lock} type="password" placeholder="••••••••" value={b2b.confirm} onChange={v => setB2b(p => ({ ...p, confirm: v }))} required />
            </div>
            <InputField label="Tên cửa hàng / Doanh nghiệp" icon={Building2} placeholder="Cty TNHH / Cửa hàng..." value={b2b.business} onChange={v => setB2b(p => ({ ...p, business: v }))} required />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Mã số thuế" placeholder="0123456789 (nếu có)" value={b2b.tax} onChange={v => setB2b(p => ({ ...p, tax: v }))} hint="Tùy chọn" />
              <InputField label="Địa chỉ kinh doanh" placeholder="Số nhà, đường, quận..." value={b2b.address} onChange={v => setB2b(p => ({ ...p, address: v }))} required />
            </div>
            {b2bError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle size={14} />{b2bError}</div>}
            <button onClick={handleB2BSubmit} disabled={isRegistering}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isRegistering ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký"} <ArrowRight size={14} />
            </button>
          </div>
        )}

        {tab === "b2b" && b2bStep === "pending" && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Clock size={28} className="text-amber-600" />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-amber-700">Hồ sơ đang xét duyệt</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Cảm ơn <strong>{b2b.name || "bạn"}</strong> đã đăng ký làm đối tác. Hồ sơ của bạn đang được Ban quản trị xem xét. Chúng tôi sẽ liên hệ lại qua email <strong>{b2b.email}</strong> và số điện thoại sớm nhất.
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-left space-y-2.5">
              {[
                { step: "1", text: "Hồ sơ đã được ghi nhận", done: true },
                { step: "2", text: "Đang xét duyệt bởi Admin (1-2 ngày)", done: false },
                { step: "3", text: "Nhận email kích hoạt tài khoản", done: false },
                { step: "4", text: "Đăng nhập & bắt đầu đặt hàng sỉ", done: false },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-border text-muted-foreground"}`}>
                    {s.done ? <CheckCircle size={12} /> : s.step}
                  </div>
                  <span className={s.done ? "text-foreground font-medium" : "text-muted-foreground"}>{s.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/login")} className="text-sm text-accent hover:underline">Về trang đăng nhập</button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{" "}
          <button onClick={() => navigate("/login")} className="text-accent font-semibold hover:underline">Đăng nhập</button>
        </p>
      </div>
    </AuthLayout>
  );
}
