import { useRef, useEffect } from "react";
import { ShoppingCart, Search, Filter, ArrowRight, Gift, ClipboardList } from "lucide-react";

import { ProductCard } from "../../../core/components/common/ProductCard";
import { CartDrawer } from "../../../core/components/common/CartDrawer";
import { ChatWidget } from "../../../core/components/common/ChatWidget";
import { ProfileModal } from "../../../core/components/common/ProfileModal";
import { UserMenu } from "../../../core/components/common/UserMenu";
import { OffersModal } from "../../../core/components/common/OffersModal";
import { OrderHistoryPopup } from "../../../core/components/common/OrderHistoryPopup";
import { ProductDetailModal } from "../../../core/components/common/ProductDetailModal";

import { useNavigate } from 'react-router-dom';
import { atminDispatch } from '../../../core/store/reduxHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store/store';
import { CheckoutModal } from '../../../core/components/common/CheckoutModal';
import { logout } from '../../auth';
import { useB2CPortal } from '../hooks/useB2CPortal';

export function B2CPortal() {
  const navigate = useNavigate();
  const dispatch = atminDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const {
    loading,
    cart, setCart,
    cartOpen, setCartOpen,
    profileOpen, setProfileOpen,
    checkoutOpen, setCheckoutOpen,
    offersOpen, setOffersOpen,
    historyOpen, setHistoryOpen,
    search, setSearch,
    category, setCategory,
    sortBy, setSortBy,
    categories,
    filtered,
    addToCart,
    cartCount,
    hasMore,
    loadMore,
    selectedProduct, setSelectedProduct
  } = useB2CPortal();

  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setHistoryOpen]);

  const handleLogout = () => { 
    dispatch(logout()); 
    navigate('/login'); 
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    if (!user) {
      navigate('/login');
    } else {
      setCheckoutOpen(true);
    }
  };

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
            <button onClick={()=>setOffersOpen(true)} className="relative p-2 hover:bg-muted rounded-lg transition-colors text-pink-500" title="Ưu đãi">
              <Gift size={18} />
            </button>
            <div className="relative" ref={historyRef}>
              <button 
                onClick={()=>setHistoryOpen(!historyOpen)} 
                className="relative p-2 hover:bg-muted rounded-lg transition-colors text-blue-500" 
                title="Đơn hàng"
              >
                <ClipboardList size={18} />
              </button>
              <OrderHistoryPopup isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
            </div>
            <button onClick={()=>setCartOpen(true)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart size={18} />
              {cartCount>0 && <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">{cartCount}</span>}
            </button>
            <UserMenu onOpenProfile={()=>setProfileOpen(true)} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <OffersModal isOpen={offersOpen} onClose={() => setOffersOpen(false)} />
      <section className="relative h-[420px] overflow-hidden">
        <img src="/images/b2c-banner.jpg" alt="Holiday Fashion" className="w-full h-full object-cover" />
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
        {loading && filtered.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered.map(p=><ProductCard key={p.id} product={p} onAdd={addToCart} onClick={setSelectedProduct} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="px-6 py-2.5 bg-background border-2 border-border rounded-xl text-sm font-semibold hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Xem thêm sản phẩm"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={()=>setCartOpen(false)} onCheckout={handleCheckoutClick} />}
      {profileOpen && <ProfileModal onClose={()=>setProfileOpen(false)} />}
      {checkoutOpen && <CheckoutModal cart={cart} setCart={setCart} onClose={()=>setCheckoutOpen(false)} onSuccess={() => setCheckoutOpen(false)} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />}
      <ChatWidget loggedInAs={user ? { name: user.fullName, role: "customer" } : undefined} />
    </div>
  );
}
