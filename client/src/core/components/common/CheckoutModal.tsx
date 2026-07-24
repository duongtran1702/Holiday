import { useState } from "react";
import { X, CreditCard, Banknote, MapPin, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { orderApi } from "../../../features/orders/services/order.api";
import { CreateOrderRequest } from "../../../features/orders/services/order.api";
import { toast } from "sonner";

interface CheckoutModalProps {
  cart: any[];
  setCart: (c: any[]) => void;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutModal({ cart, setCart, onClose, onSuccess }: CheckoutModalProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  const [form, setForm] = useState({
    name: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    paymentMethod: "COD" as "COD" | "PAYOS",
  });

  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState("");

  // Tính tổng tiền
  const itemsAmount = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const totalAmount = appliedVoucher ? Math.max(0, itemsAmount - (appliedVoucher.discountAmount || 0)) : itemsAmount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      setVoucherError("");
      const res = await import("../../../features/promotions/services/promotionService").then(m => m.promotionService.validateCode(voucherCode, itemsAmount));
      if (res.data) {
        setAppliedVoucher(res.data);
        toast.success("Áp dụng mã giảm giá thành công");
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherError(err.response?.data?.message || "Mã giảm giá không hợp lệ");
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập họ tên người nhận");
      return false;
    }
    if (!form.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!form.phone.match(/^(0|\+84)[0-9]{9}$/)) {
      toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số)");
      return false;
    }
    if (!form.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ nhận hàng chi tiết");
      return false;
    }
    if (form.address.trim().length < 10) {
      toast.error("Địa chỉ nhận hàng quá ngắn, vui lòng nhập chi tiết hơn (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)");
      return false;
    }
    if (cart.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    let toastId: string | number | undefined;
    try {
      setLoading(true);
      toastId = toast.loading("Đang xử lý đơn hàng...");

      const orderRequest: CreateOrderRequest = {
        shippingAddress: form.address,
        phoneNumber: form.phone,
        paymentMethod: form.paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.qty || 1,
          selectedColor: item.selectedColor || item.color,
          selectedSize: item.selectedSize || item.size,
        })),
      };

      const res = await orderApi.createOrder(orderRequest);
      console.log("=== CREATE ORDER RESPONSE ===", res);

      if (res.data?.paymentUrl && form.paymentMethod === "PAYOS") {
        console.log("Redirecting to PayOS URL:", res.data.paymentUrl);
        toast.success("Đang chuyển hướng đến cổng thanh toán...", { id: toastId });
        window.location.href = res.data.paymentUrl;
      } else {
        console.log("NOT redirecting. paymentUrl:", res.data?.paymentUrl, "method:", form.paymentMethod);
        toast.success("Đặt hàng thành công!", { id: toastId });
        setCart([]); // Clear cart
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng, vui lòng thử lại sau.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div 
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">Thanh Toán</h2>
            <p className="text-primary-foreground/70 text-xs mt-0.5">Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Thông tin giao hàng */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin size={16} className="text-accent" />
              Thông tin giao hàng
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Người nhận</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nhập họ và tên người nhận"
                  className="w-full text-sm px-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Số điện thoại liên hệ</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="09xx xxx xxx"
                    className="w-full pl-10 pr-4 text-sm py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Địa chỉ nhận hàng (Chi tiết)</label>
                <textarea 
                  value={form.address} 
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  rows={3}
                  className="w-full text-sm px-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none" 
                />
                <p className="text-[10px] text-muted-foreground mt-1">Thông tin này sẽ được lưu lại cho lần mua hàng sau.</p>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              <CreditCard size={16} className="text-accent" />
              Phương thức thanh toán
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, paymentMethod: "COD" }))}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.paymentMethod === "COD" 
                    ? "border-accent bg-accent/5 text-accent" 
                    : "border-border text-muted-foreground hover:border-accent/30 hover:bg-accent/5"
                }`}
              >
                <Banknote size={24} />
                <span className="text-xs font-medium text-center">Thanh toán khi<br/>nhận hàng (COD)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, paymentMethod: "PAYOS" }))}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.paymentMethod === "PAYOS" 
                    ? "border-accent bg-accent/5 text-accent" 
                    : "border-border text-muted-foreground hover:border-accent/30 hover:bg-accent/5"
                }`}
              >
                <CreditCard size={24} />
                <span className="text-xs font-medium text-center">Thanh toán<br/>Online (PayOS)</span>
              </button>
            </div>
          </div>

          {/* Mã giảm giá */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={voucherCode} 
                onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 text-sm px-4 py-2 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent uppercase" 
              />
              <button 
                onClick={handleApplyVoucher}
                className="px-4 py-2 bg-secondary text-foreground font-medium text-sm rounded-xl hover:bg-muted transition-colors"
              >
                Áp dụng
              </button>
            </div>
            {voucherError && <p className="text-xs text-red-500 mt-2">{voucherError}</p>}
            {appliedVoucher && (
              <p className="text-xs text-emerald-600 mt-2 font-medium">
                Đã áp dụng mã {appliedVoucher.code} (Giảm {(appliedVoucher.discountAmount || 0).toLocaleString("vi-VN")} đ)
              </p>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="bg-muted p-4 rounded-xl flex flex-col gap-2 border border-border/50">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Tạm tính:</span>
              <span>{itemsAmount.toLocaleString("vi-VN")} đ</span>
            </div>
            {appliedVoucher && (
              <div className="flex justify-between items-center text-sm text-emerald-600">
                <span>Giảm giá:</span>
                <span>- {(appliedVoucher.discountAmount || 0).toLocaleString("vi-VN")} đ</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-border pt-2 mt-1">
              <span className="text-sm font-medium text-muted-foreground">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-accent">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card">
          <button 
            onClick={handleCheckout} 
            disabled={loading} 
            className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? "Đang xử lý..." : "Xác nhận Đặt Hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
