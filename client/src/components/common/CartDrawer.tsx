import React, { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, ArrowRight, Trash2 } from "lucide-react";
import { fmt } from "../../util/format";

export function CartDrawer({ cart, setCart, onClose, onCheckout }: Readonly<{ cart: any[]; setCart: (c: any[]) => void; onClose: () => void; onCheckout?: () => void; }>) {
  const [voucher, setVoucher] = useState("");
  const [voucherOk, setVoucherOk] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = voucherOk ? Math.floor(subtotal * 0.1) : 0;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${!mounted || isClosing ? 'opacity-0' : 'opacity-100'}`} 
        onClick={handleClose} 
      />
      
      {/* Drawer */}
      <div 
        className={`relative w-[340px] max-w-[100vw] bg-background flex flex-col shadow-2xl transition-transform duration-300 ease-out ${!mounted || isClosing ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
            Giỏ hàng 
            <span className="bg-foreground text-background text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{cart.reduce((s,i)=>s+i.qty,0)}</span>
          </h2>
          <button onClick={handleClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-full transition-colors"><X size={16} strokeWidth={2} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
              <ShoppingCart size={40} strokeWidth={1.5} className="mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">Giỏ hàng của bạn đang trống</p>
              <button onClick={handleClose} className="mt-4 text-xs font-semibold px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors">Tiếp tục mua sắm</button>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Thumbnail Image */}
                  <div className="w-20 h-24 bg-muted/40 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-border/40 relative group">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="text-muted-foreground/30" size={20} />
                    )}
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/80 backdrop-blur p-1 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"><X size={12} strokeWidth={3} /></button>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-sm font-medium leading-tight line-clamp-2 pr-4">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.color} / {item.size}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Cuter Buttons */}
                      <div className="flex items-center gap-1.5 bg-muted/50 rounded-full p-0.5 border border-border/40">
                        <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:Math.max(1,i.qty-1)} : i))} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-muted-foreground hover:text-foreground shadow-sm transition-colors"><Minus size={12} strokeWidth={2.5} /></button>
                        <span className="text-xs font-medium w-4 text-center">{item.qty}</span>
                        <button onClick={() => setCart(cart.map((i,n) => n===idx ? {...i,qty:i.qty+1} : i))} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-muted-foreground hover:text-foreground shadow-sm transition-colors"><Plus size={12} strokeWidth={2.5} /></button>
                      </div>
                      <p className="text-sm font-bold text-accent">{fmt(item.price * item.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-background border-t border-border/40 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] z-10">
            <div className="mb-4 flex gap-2">
              <input value={voucher} onChange={e => setVoucher(e.target.value)} placeholder="Nhập mã giảm giá..."
                className="flex-1 text-sm bg-muted/30 border border-border/60 rounded-full focus:border-foreground focus:outline-none py-2 px-4 transition-colors placeholder:text-muted-foreground/60" />
              <button onClick={() => { if (voucher.toUpperCase() === "ATMIN10") setVoucherOk(true); }}
                className="text-xs font-semibold px-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors whitespace-nowrap">Áp Dụng</button>
            </div>
            
            {voucherOk && <div className="flex justify-between text-sm text-emerald-600 mb-3 font-medium px-1"><span>Giảm giá (ATMIN10)</span><span>-{fmt(discount)}</span></div>}
            
            <div className="flex justify-between items-end mb-4 px-1">
              <span className="text-sm font-medium text-muted-foreground">Tổng cộng</span>
              <span className="text-lg font-bold">{fmt(subtotal - discount)}</span>
            </div>
            
            <button onClick={onCheckout} className="w-full bg-accent text-white py-3.5 rounded-full text-sm font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/20">
              Tiến Hành Thanh Toán <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}