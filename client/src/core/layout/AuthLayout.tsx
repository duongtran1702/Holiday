import React from "react";

export function AuthLayout({ children, title, subtitle, imgSrc }: {
  children: React.ReactNode; title: string; subtitle: string; imgSrc: string;
}) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col">
        <img src={imgSrc} alt="Holiday Fashion" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-transparent" />
        <div className="relative z-10 flex flex-col h-full p-10">
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white italic">Holiday Fashion</span>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Hệ thống quản lý & kinh doanh</p>
          </div>
          <div className="flex-1 flex flex-col justify-end pb-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white leading-tight mb-3">{title}</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">{subtitle}</p>
            <div className="flex items-center gap-6 mt-8">
              {[["500+", "Sản phẩm"], ["120+", "Đại lý"], ["10K+", "Đơn hàng"]].map(([v, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-white/50 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {children}
      </div>
    </div>
  );
}