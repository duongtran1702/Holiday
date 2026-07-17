import { CheckCircle } from "lucide-react";
import { PermSet } from "../../types/index";
import { PERMISSION_MODULES } from "../../utils/mockData";

export function PermissionMatrix({ perms, onChange, readOnly }: { perms: PermSet; onChange?: (p: PermSet) => void; readOnly?: boolean }) {
  const ACTION_LABELS: Record<string, string> = { view: "Xem", create: "Thêm", update: "Sửa", delete: "Xóa" };
  const ALL_ACTIONS = ["view", "create", "update", "delete"] as const;

  const toggle = (mod: string, action: string) => {
    if (readOnly || !onChange) return;
    const updated = { ...perms, [mod]: { ...perms[mod], [action]: !perms[mod]?.[action] } };
    if (!updated[mod]["view"] && action !== "view") {
      // auto-check view when enabling other perms
    }
    onChange(updated);
  };

  const toggleAll = (mod: string, checked: boolean) => {
    if (readOnly || !onChange) return;
    const m = PERMISSION_MODULES.find(m => m.key === mod)!;
    onChange({ ...perms, [mod]: Object.fromEntries(m.actions.map(a => [a, checked])) });
  };

  const allChecked = (mod: string) => {
    const m = PERMISSION_MODULES.find(m => m.key === mod)!;
    return m.actions.every(a => perms[mod]?.[a]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[40%]">Module / Chức năng</th>
            {ALL_ACTIONS.map(a => (
              <th key={a} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">{ACTION_LABELS[a]}</th>
            ))}
            {!readOnly && <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tất cả</th>}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((mod, ri) => (
            <tr key={mod.key} className={`border-t border-border ${ri % 2 === 1 ? "bg-muted/20" : "bg-card"}`}>
              <td className="px-4 py-3">
                <span className="text-sm font-medium">{mod.label}</span>
              </td>
              {ALL_ACTIONS.map(action => {
                const applicable = (mod.actions as readonly string[]).includes(action);
                const checked = applicable && !!perms[mod.key]?.[action];
                return (
                  <td key={action} className="px-3 py-3 text-center">
                    {applicable ? (
                      <button onClick={() => toggle(mod.key, action)} disabled={readOnly}
                        className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-all ${checked ? "bg-accent text-white" : "border-2 border-muted-foreground/30 hover:border-accent"} ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
                        {checked && <CheckCircle size={12} />}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </td>
                );
              })}
              {!readOnly && (
                <td className="px-3 py-3 text-center">
                  <button onClick={() => toggleAll(mod.key, !allChecked(mod.key))}
                    className={`w-5 h-5 rounded flex items-center justify-center mx-auto border-2 transition-all ${allChecked(mod.key) ? "bg-primary border-primary text-white" : "border-muted-foreground/30 hover:border-primary"}`}>
                    {allChecked(mod.key) && <CheckCircle size={12} />}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}