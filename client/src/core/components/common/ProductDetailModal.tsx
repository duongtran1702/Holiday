import { useState, useEffect } from "react";
import { X, ShoppingCart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { ProductDto } from "../../../features/products/services/productService";
import { fmt } from "../../utils/format";
import { StarRating } from "./StarRating";
import { CartItem } from "../../types";

export function ProductDetailModal({ product, onClose, onAdd }: { product: ProductDto | null, onClose: () => void, onAdd: (item: CartItem) => void }) {
  const [selColor, setSelColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setSelColor(product.colors[0] || "");
      setSelSize(product.sizes[1] ?? product.sizes[0] ?? "");
      setQty(1);
    }
  }, [product]);

  if (!product) return null;

  const inStock = (product.stock as Record<string, number>)[`${selSize}-${selColor}`] ?? 0;

  const handleAdd = () => {
    onAdd({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selColor,
      size: selSize,
      qty: qty
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="w-full md:w-1/2 bg-muted p-6 flex items-center justify-center min-h-[300px]">
          <img src={product.image} alt={product.name} className="w-full max-w-sm object-cover rounded-xl shadow-lg" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-6 border-b border-border pb-6">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">{product.category}</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-3">{product.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">({product.reviews} đánh giá)</span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-accent">{fmt(product.price)}</p>
          </div>

          <div className="space-y-5 flex-1">
            <div>
              <p className="text-sm font-medium mb-2">Màu sắc: <span className="text-muted-foreground">{selColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setSelColor(c)}
                    title={c}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selColor === c ? "border-primary scale-110 shadow-sm" : "border-border hover:border-primary/50"} bg-muted`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Kích cỡ: <span className="text-muted-foreground">{selSize}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => {
                  const stock = (product.stock as Record<string, number>)[`${s}-${selColor}`] ?? 0;
                  const disabled = stock === 0;
                  return (
                    <button 
                      key={s} 
                      onClick={() => !disabled && setSelSize(s)}
                      disabled={disabled}
                      className={`min-w-[3rem] px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
                        ${selSize === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}
                        ${disabled ? "opacity-30 cursor-not-allowed bg-muted" : ""}
                      `}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Tình trạng: 
                <span className={`font-semibold ${inStock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {inStock > 0 ? `Còn hàng (${inStock} sản phẩm)` : "Hết hàng"}
                </span>
              </p>
            </div>
            
            {inStock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1 hover:bg-muted transition-colors">-</button>
                  <span className="px-4 py-1 font-medium text-sm border-x border-border">{qty}</span>
                  <button onClick={() => setQty(Math.min(inStock, qty + 1))} className="px-3 py-1 hover:bg-muted transition-colors">+</button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <button 
              onClick={handleAdd}
              disabled={inStock === 0}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              {inStock > 0 ? "Thêm vào giỏ hàng" : "Đã hết hàng"}
            </button>
            
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck size={20} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">Hàng chính hãng</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Truck size={20} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">Giao hàng 24h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw size={20} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
