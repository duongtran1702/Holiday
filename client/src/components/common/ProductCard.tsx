import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { PRODUCTS } from "../../util/mockData";
import { fmt } from "../../util/format";
import { StarRating } from "./StarRating";

export function ProductCard({ product, onAdd }: { product: typeof PRODUCTS[0]; onAdd: (item: CartItem) => void }) {
  const [sel, setSel] = useState({ size: product.sizes[1] ?? product.sizes[0], color: product.colors[0] });
  const inStock = (product.stock as Record<string, number>)[`${sel.size}-${sel.color}`] ?? 0;
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative overflow-hidden aspect-[3/4] bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && <span className="absolute top-2.5 left-2.5 bg-accent text-white text-xs font-medium px-2 py-0.5 rounded-full">{product.badge}</span>}
        {inStock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">Hết hàng</span></div>}
      </div>
      <div className="p-3.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{product.category}</p>
        <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="font-semibold text-sm leading-snug mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-2.5"><StarRating rating={product.rating} /><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
        <div className="flex gap-1 mb-2">
          {product.colors.slice(0, 4).map(c => <button key={c} onClick={() => setSel(s => ({ ...s, color: c }))} title={c} className={`w-4 h-4 rounded-full border-2 transition-all ${sel.color === c ? "border-primary scale-110" : "border-transparent"} bg-muted`} />)}
          <span className="text-xs text-muted-foreground self-center ml-1">{sel.color}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.sizes.map(s => <button key={s} onClick={() => setSel(p => ({ ...p, size: s }))} className={`text-xs px-2 py-0.5 rounded border transition-colors ${sel.size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}>{s}</button>)}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-base font-bold text-accent">{fmt(product.price)}</span>
            <p className="text-xs text-muted-foreground">{inStock > 0 ? `Còn ${inStock}` : "Hết"}</p>
          </div>
          <button disabled={inStock === 0} onClick={() => onAdd({ productId: product.id, size: sel.size, color: sel.color, qty: 1, price: product.price, name: product.name, image: product.image })}
            className="flex items-center gap-1 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingCart size={12} /> Thêm
          </button>
        </div>
      </div>
    </div>
  );
}