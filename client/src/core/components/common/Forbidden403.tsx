import { AlertTriangle, Lock } from "lucide-react";

export function Forbidden403({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16 px-8">
      <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-5">
        <Lock size={32} className="text-destructive" />
      </div>
      <p className="text-xs font-mono text-destructive/60 uppercase tracking-widest mb-2">403 Forbidden</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-foreground mb-2">
        Không có quyền truy cập
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Tài khoản của bạn chưa được cấp quyền xem module <strong>"{tabLabel}"</strong>. Liên hệ Admin để được cấp quyền bổ sung.
      </p>
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 max-w-xs text-left space-y-1">
        <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={12} />Hành vi truy cập trái phép đã được ghi lại</p>
        <p>IP, trình duyệt và thời gian truy cập đã được lưu vào audit log.</p>
      </div>
    </div>
  );
}