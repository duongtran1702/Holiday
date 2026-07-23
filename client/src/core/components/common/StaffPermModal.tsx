import { useState } from "react";
import { User, X, CheckCircle, Settings, Phone, Mail, ShieldCheck, Save, Info } from "lucide-react";
import { PermSet, StaffMember } from "../../types/index";
import { defaultPerms, STAFF_PRESETS } from "../../utils/mockData";
import { countPerms } from "../../utils/helpers";
import { InputField } from "./InputField";
import { PermissionMatrix } from "./PermissionMatrix";

const LOCAL_PRESETS: Record<string, PermSet> = {
  "Kế toán": { ...defaultPerms(), debts: { view: true, update: true }, reports: { view: true } },
  "Nhân viên Kho": { ...defaultPerms(), inventory: { view: true, create: true, update: true }, orders: { view: true, create: false, update: true, delete: false } },
  "Sales": { ...defaultPerms(), orders: { view: true, create: true, update: true, delete: false }, agents: { view: true, create: false, update: true, delete: false }, promotions: { view: true, create: true, update: true, delete: false }, inbox: { view: true, create: true } },
  "CSKH": { ...defaultPerms(), inbox: { view: true, create: true }, orders: { view: true, create: false, update: false, delete: false }, promotions: { view: true, create: false, update: false, delete: false } },
  "Quản lý (Full)": { 
    ...defaultPerms(), 
    products: { view: true, create: true, update: true, delete: true },
    inventory: { view: true, create: true, update: true },
    orders: { view: true, create: true, update: true, delete: true },
    agents: { view: true, create: true, update: true, delete: true },
    debts: { view: true, update: true },
    promotions: { view: true, create: true, update: true, delete: true },
    reports: { view: true },
    inbox: { view: true, create: true }
  }
};

export function StaffPermModal({ staff, onSave, onClose }: {
  staff: StaffMember; onSave: (id: string, perms: PermSet, meta: Partial<StaffMember>) => void; onClose: () => void;
}) {
  const [perms, setPerms] = useState<PermSet>(JSON.parse(JSON.stringify(staff.permissions)));
  const [meta, setMeta] = useState({ name: staff.name, email: staff.email, phone: staff.phone, jobTitle: staff.jobTitle });
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"info" | "perms">("perms");

  const handleSave = () => {
    onSave(staff.id, perms, meta);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const applyPreset = (preset: keyof typeof LOCAL_PRESETS) => {
    setPerms(JSON.parse(JSON.stringify(LOCAL_PRESETS[preset])));
  };

  const totalPerms = countPerms(perms);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {staff.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-base">{staff.name}</h2>
              <p className="text-primary-foreground/50 text-xs">{staff.email} · {staff.jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-foreground/60 bg-white/10 px-2.5 py-1 rounded-full">
              {totalPerms} quyền đang cấp
            </span>
            <button onClick={onClose} className="text-primary-foreground/50 hover:text-primary-foreground p-1"><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-card">
          {[{ key: "perms", label: "Bảng phân quyền", icon: ShieldCheck }, { key: "info", label: "Thông tin nhân viên", icon: User }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {tab === "perms" && (
            <div>
              {/* Preset toolbar */}
              <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Áp dụng mẫu nhanh:</span>
                {Object.keys(LOCAL_PRESETS).map(preset => {
                  const isActive = JSON.stringify(perms) === JSON.stringify(LOCAL_PRESETS[preset]);
                  return (
                    <button key={preset} onClick={() => applyPreset(preset as any)}
                      className={`text-xs px-3 py-1.5 border rounded-lg transition-colors font-medium ${
                        isActive 
                          ? "border-accent bg-accent/10 text-accent" 
                          : "border-border bg-card hover:border-accent hover:text-accent"
                      }`}>
                      {preset}
                    </button>
                  );
                })}
                <button onClick={() => setPerms(defaultPerms())}
                  className="text-xs px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-red-50 transition-colors ml-auto">
                  Xóa tất cả quyền
                </button>
              </div>

              <div className="px-2">
                <PermissionMatrix perms={perms} onChange={setPerms} />
              </div>

              {/* Legend */}
              <div className="px-5 py-3 border-t border-border bg-muted/20 flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-1">Hướng dẫn:</div>
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-accent rounded flex items-center justify-center"><CheckCircle size={10} className="text-white" /></span>Được phép thao tác</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-4 border-2 border-muted-foreground/30 rounded" />Bị chặn (Không có quyền)</span>
                  <span className="flex items-center gap-1.5"><span className="text-muted-foreground/30">—</span>Quyền này không áp dụng cho module tương ứng</span>
                </div>
              </div>
            </div>
          )}

          {tab === "info" && (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Họ và tên" icon={User} value={meta.name} onChange={v => setMeta(p => ({ ...p, name: v }))} />
                <InputField label="Chức danh" icon={Settings} value={meta.jobTitle} onChange={v => setMeta(p => ({ ...p, jobTitle: v }))} />
                <InputField label="Email" icon={Mail} type="email" value={meta.email} onChange={v => setMeta(p => ({ ...p, email: v }))} />
                <InputField label="Số điện thoại" icon={Phone} value={meta.phone} onChange={v => setMeta(p => ({ ...p, phone: v }))} />
              </div>
              <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex gap-2">
                <Info size={13} className="shrink-0 mt-0.5" />Để đặt lại mật khẩu cho nhân viên, hãy dùng chức năng "Gửi email đặt lại mật khẩu" hoặc liên hệ quản trị hệ thống.
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Lần đăng nhập cuối: <strong>{staff.lastLogin}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Hủy</button>
            <button onClick={handleSave}
              className={`text-sm px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              {saved ? <><CheckCircle size={14} /> Đã lưu</> : <><Save size={14} /> Lưu phân quyền</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}