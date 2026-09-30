import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, LogOut } from "lucide-react";
import { atminDispatch } from "../store/reduxHook";
import { logout } from "../../features/auth";
import { CartDrawer } from "../components/common/CartDrawer";
import { NotificationMenu } from "./NotificationMenu";

export function LayoutB2C() {
  const navigate = useNavigate();
  const dispatch = atminDispatch();
  const [cartOpen, setCartOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-screen-xl mx-auto px-5 py-2.5 flex items-center justify-between gap-4">
          <div style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold italic text-primary shrink-0 cursor-pointer" onClick={() => navigate("/b2c")}>Holiday Fashion</div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Tìm sản phẩm..."
                className="text-xs pl-8 pr-3 py-1.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring w-40" />
            </div>
            <button onClick={() => setCartOpen(true)} className="relative w-8 h-8 flex items-center justify-center bg-muted rounded-full hover:bg-muted/80 transition-colors">
              <ShoppingCart size={14} className="text-foreground" />
            </button>
            <div className="scale-75 origin-right">
              <NotificationMenu />
            </div>
            <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3 ml-1">
              <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      {cartOpen && <CartDrawer cart={[]} setCart={() => {}} onClose={() => setCartOpen(false)} />}
    </div>
  );
}
