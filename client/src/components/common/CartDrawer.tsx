import React, { useState } from "react";
import { ShoppingCart, X, Plus, Minus, ArrowRight } from "lucide-react";
import { fmt } from "../../util/format";

export function CartDrawer({ cart, setCart, onClose }: Readonly<{ cart: CartItem[]; setCart: (c: CartItem[]) => void; onClose: () => void }>) {
  const [voucher, setVoucher] = useState("");
  const [voucherOk, setVoucherOk] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherOk ? Math.floor(subtotal * 0.1) : 0;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="w-72 bg-card flex flex-col shadow-2xl border-l border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} />
            <span className="text-sm font-semibold">Giỏ hàng</span>
            {cart.length > 0 && <span className="bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingCart size={32} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Giỏ hàng trống</p>
              <button onClick={onClose} className="mt-3 text-xs text-accent hover:underline">Tiếp tục mua sắm</button>
            </div>
          ) : cart.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.size} · {item.color}</p>
                <p className="text-xs font-semibold text-accent mt-0.5">{fmt(item.price * item.qty)}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-destructive transition-colors"><X size={11} /></button>
                <div className="flex items-center border border-border rounded overflow-hidden">
                  <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:Math.max(1,i.qty-1)} : i))} className="w-5 h-5 flex items-center justify-center hover:bg-muted text-muted-foreground"><Minus size={9} /></button>
                  <span className="text-xs w-5 text-center">{item.qty}</span>
                  <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:i.qty+1} : i))} className="w-5 h-5 flex items-center justify-center hover:bg-muted text-muted-foreground"><Plus size={9} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-border px-4 py-3 space-y-2.5">
            <div className="flex gap-1.5">
              <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Mã giảm giá (ATMIN10)"
                className="flex-1 text-xs px-2.5 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={() => { if (voucher.toUpperCase() === "ATMIN10") setVoucherOk(true); }}
                className="text-xs px-2.5 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors whitespace-nowrap">Dùng</button>
            </div>
            {voucherOk && <p className="text-xs text-emerald-600 font-medium">✓ Giảm 10% — {fmt(discount)}</p>}
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/60">
              <span>Tổng</span>
              <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-accent">{fmt(subtotal - discount)}</span>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
              Thanh toán <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}