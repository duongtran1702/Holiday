import { useState, useEffect } from "react";
import { productService, ProductDto } from "../services/productService";
import { CartItem } from "../../../core/types";

export const useB2CPortal = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Mới nhất");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const categories = ["Tất cả", "Áo", "Quần", "Đầm/Váy"];

  const fetchProducts = (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    const currentPage = isLoadMore ? page + 1 : 0;
    
    productService.getProducts({
      page: currentPage,
      size: 12,
      search,
      category: category !== "Tất cả" ? category : undefined,
      sort: sortBy
    }).then(res => {
      if (res.data) {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...res.data.content]);
        } else {
          setProducts(res.data.content);
        }
        setPage(res.data.number);
        setHasMore(!res.data.last);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sortBy]);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchProducts(true);
    }
  };

  const filtered = products;

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
    products,
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
    loadMore,
    hasMore,
    selectedProduct, setSelectedProduct
  };
};
