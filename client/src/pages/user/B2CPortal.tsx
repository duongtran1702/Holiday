import React, { useState, useMemo } from "react";
import { ShoppingCart, Search, Filter, ArrowRight } from "lucide-react";
import { PRODUCTS } from "../../util/mockData";
import { StarRating } from "../../components/common/StarRating";
import { ProductCard } from "../../components/common/ProductCard";
import { CartDrawer } from "../../components/common/CartDrawer";
import { ChatWidget } from "../../components/common/ChatWidget";
import { ProfileModal } from "../../components/common/ProfileModal";
import { UserMenu } from "../../components/common/UserMenu";

import { useNavigate } from 'react-router-dom';
import { atminDispatch } from '../../hook/reduxHook';
import { logout } from '../../redux/slice/authSlice';

export function B2CPortal() {
  const navigate = useNavigate();
  const dispatch = atminDispatch();
  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Mới nhất");
  const categories = ["Tất cả", "Áo", "Quần", "Đầm/Váy"];
  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (category !== "Tất cả") list = list.filter(p => p.category === category);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "Giá tăng") list = [...list].sort((a,b)=>a.price-b.price);
    if (sortBy === "Giá giảm") list = [...list].sort((a,b)=>b.price-a.price);
    if (sortBy === "Đánh giá") list = [...list].sort((a,b)=>b.rating-a.rating);
    return list;
  }, [category, search, sortBy]);
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId===item.productId && i.size===item.size && i.color===item.color);
      if (idx>=0) return prev.map((i,n) => n===idx ? {...i,qty:i.qty+1} : i);
      return [...prev, item];
    });
    setCartOpen(true);
  };
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-xl mx-auto px-5 py-2.5 flex items-center justify-between gap-4">
          <div style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold italic text-primary shrink-0">Holiday Fashion</div>
          <nav className="hidden md:flex items-center gap-5">
            {categories.map(c => <button key={c} onClick={()=>setCategory(c)} className={`text-sm transition-colors pb-0.5 ${category===c?"text-foreground font-medium border-b-2 border-accent":"text-muted-foreground hover:text-foreground"}`}>{c}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm sản phẩm..."
                className="text-xs pl-8 pr-3 py-1.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring w-40" />
            </div>
            <button onClick={()=>setCartOpen(true)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart size={18} />
              {cartCount>0 && <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
            </button>
            <UserMenu onOpenProfile={()=>setProfileOpen(true)} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <section className="relative h-[420px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=600&fit=crop&auto=format" alt="Holiday Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-screen-xl mx-auto px-8 md:px-14">
            <p className="text-accent text-xs uppercase tracking-[0.3em] mb-3 font-medium">Bộ sưu tập 2026</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">Thời trang<br /><em>định nghĩa bạn</em></h1>
            <p className="text-white/65 text-sm mb-7 max-w-sm">Khám phá bộ sưu tập mới nhất — phong cách hiện đại, chất liệu cao cấp.</p>
            <button className="bg-accent text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2">Mua sắm ngay <ArrowRight size={14} /></button>
          </div>
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold">Sản phẩm</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} sản phẩm</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="text-xs px-2.5 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
              {["Mới nhất","Giá tăng","Giá giảm","Đánh giá"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart} />)}
        </div>
      </section>
      <section className="bg-secondary border-y border-border py-10 px-5">
        <div className="max-w-screen-xl mx-auto text-center">
          <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-semibold mb-5">Khách hàng nói gì</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Nguyễn Thị Lan", text: "Áo polo chất lượng tuyệt vời, mặc thoáng mát. Sẽ ủng hộ Atmin lần nữa!", rating: 5, product: "Áo Polo Atmin Classic" },
              { name: "Trần Minh Hoàng", text: "Quần jeans vừa vặn, chất vải tốt không phai màu sau nhiều lần giặt.", rating: 5, product: "Quần Jeans Slim Fit" },
              { name: "Phạm Thu Hương", text: "Đầm floral siêu cute, nhận hàng đúng hẹn, đóng gói cẩn thận!", rating: 4, product: "Đầm Floral Summer" },
            ].map((r,i) => (
              <div key={i} className="bg-card p-4 rounded-xl border border-border text-left">
                <StarRating rating={r.rating} />
                <p className="text-sm mt-2.5 mb-2.5 text-foreground/75 italic leading-relaxed">"{r.text}"</p>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={()=>setCartOpen(false)} />}
      {profileOpen && <ProfileModal onClose={()=>setProfileOpen(false)} />}
      <ChatWidget loggedInAs={{ name: "Nguyễn Văn Minh", role: "customer" }} />
    </div>
  );
}
