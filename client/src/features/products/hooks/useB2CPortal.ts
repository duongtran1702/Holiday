import { useState, useMemo } from "react";
import { PRODUCTS } from "../../../core/utils/mockData";
import { CartItem } from "../../../core/types";

export const useB2CPortal = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  return {
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
    cartCount
  };
};
