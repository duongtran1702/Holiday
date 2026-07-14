import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export function InputField({ label, icon: Icon, type = "text", placeholder, value, onChange, required, error, hint, options }: {
  label: string; icon?: React.ElementType; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean; error?: string; hint?: string;
  options?: string[];
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />}
        {options ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            className={`w-full text-sm py-2.5 rounded-lg border bg-input-background focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${Icon ? "pl-9" : "px-3"} pr-8 ${error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-accent/25 focus:border-accent"}`}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <>
            <input type={currentType} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
              className={`w-full text-sm py-2.5 rounded-lg border bg-input-background focus:outline-none focus:ring-2 transition-all ${Icon ? "pl-9" : "pl-3"} ${isPassword ? "pr-10" : "pr-3"} ${error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-accent/25 focus:border-accent"}`} />
            {isPassword && (
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}