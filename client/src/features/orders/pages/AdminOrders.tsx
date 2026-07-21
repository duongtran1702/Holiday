import { useState } from "react";
import { Search, Eye, Edit, MailWarning, Loader2 } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { StatusBadge } from "../../../core/components/common/StatusBadge";
import { orderApi } from "../services/order.api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function AdminOrders() {
  const [filter, setFilter] = useState("Tất cả");
  const [isResending, setIsResending] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const queryClient = useQueryClient();
  const statuses = ["Tất cả","PENDING","PENDING_PAYMENT","PAID","COMPLETED","CANCELLED"];
  const statusLabels: Record<string, string> = {
    "Tất cả": "Tất cả",
    "PENDING": "Chờ xử lý",
    "PENDING_PAYMENT": "Chờ thanh toán",
    "PAID": "Đã thanh toán",
    "COMPLETED": "Hoàn thành",
    "CANCELLED": "Đã hủy"
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: orderApi.getAllOrders
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => orderApi.updateOrder(id, data),
    onSuccess: () => {
      toast.success("Cập nhật đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      setEditOrder(null);
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật đơn hàng");
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      status: formData.get('status') as string,
      shippingStatus: formData.get('shippingStatus') as string
    };
    updateMutation.mutate({ id: editOrder.id, data });
  };

  const orders = data?.data || [];
  const filtered = filter === "Tất cả" ? orders : orders.filter(o => o.status === filter);

  const getImageUrl = (url: string) => url?.startsWith('/uploads') ? `http://localhost:8080${url}` : url;

  const handleResendAllFailed = async () => {
    setIsResending(true);
    try {
      const response = await orderApi.resendAllFailedEmails();
      const count = response.data;
      if (count > 0) {
        toast.success(`Đã gửi lại thành công ${count} email lỗi`);
      } else {
        toast.success("Không có email nào bị lỗi cần gửi lại");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi lại email hàng loạt");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold">Quản lý đơn hàng</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleResendAllFailed}
            disabled={isResending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-medium rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            <MailWarning size={14} />
            {isResending ? "Đang gửi..." : "Gửi lại tất cả email lỗi"}
          </button>
          <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="Tìm đơn hàng..." className="text-xs pl-8 pr-3 py-1.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring w-48" /></div>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">{statuses.map(s=><button key={s} onClick={()=>setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter===s?"bg-primary text-primary-foreground border-primary":"border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>{statusLabels[s] || s}</button>)}</div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60"><tr>{["Mã đơn","Ngày tạo","Kênh","Số SP","Tổng tiền","Trạng thái","Vận chuyển",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-accent" /></td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="text-center py-10 text-red-500">Lỗi tải dữ liệu</td></tr>
            ) : filtered.map(o=>(
              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-accent">#{o.orderCode}</td>
                <td className="px-4 py-3 text-sm font-medium">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700`}>B2C</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.items ? o.items.length : 0}</td>
                <td className="px-4 py-3 font-mono font-medium text-sm">{fmt(o.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status as any} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.status === 'CANCELLED' ? 'bg-gray-100 text-gray-400' :
                    o.shippingStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                    o.shippingStatus === 'SHIPPING' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {o.status === 'CANCELLED' ? 'Đã hủy' : o.shippingStatus === 'DELIVERED' ? 'Đã giao' : o.shippingStatus === 'SHIPPING' ? 'Đang giao' : 'Chưa giao'}
                  </span>
                </td>
                <td className="px-4 py-3"><div className="flex gap-1.5"><button onClick={() => setViewOrder(o)} className="text-muted-foreground hover:text-foreground p-1"><Eye size={13} /></button><button onClick={() => setEditOrder(o)} className="text-muted-foreground hover:text-foreground p-1"><Edit size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length===0 && <div className="text-center py-10 text-muted-foreground text-sm">Không có đơn hàng</div>}
      </div>

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl relative flex flex-col">
            <div className="p-5 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Chi tiết đơn hàng #{viewOrder.orderCode}</h3>
                <p className="text-sm text-muted-foreground">{new Date(viewOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Trạng thái chung</p>
                  <StatusBadge status={viewOrder.status} />
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Thanh toán</p>
                  <p className="text-sm font-medium">{viewOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận (COD)' : viewOrder.paymentMethod}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Vận chuyển</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    viewOrder.status === 'CANCELLED' ? 'bg-gray-100 text-gray-400' :
                    viewOrder.shippingStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                    viewOrder.shippingStatus === 'SHIPPING' ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {viewOrder.status === 'CANCELLED' ? 'Đã hủy' : viewOrder.shippingStatus === 'DELIVERED' ? 'Đã giao' : viewOrder.shippingStatus === 'SHIPPING' ? 'Đang giao' : 'Chưa giao'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">Sản phẩm ({viewOrder.items?.length || 0})</h4>
                <div className="space-y-3">
                  {viewOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors">
                      <img src={getImageUrl(item.productImageUrl) || 'https://placehold.co/100x100?text=No+Image'} alt={item.productName} className="w-16 h-16 object-cover rounded-md border border-border/50" />
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                          {item.selectedColor && <span className="flex items-center gap-1">Màu: <span className="font-medium text-foreground">{item.selectedColor}</span></span>}
                          {item.selectedSize && <span className="flex items-center gap-1">Size: <span className="font-medium text-foreground">{item.selectedSize}</span></span>}
                          <span className="flex items-center gap-1">SL: <span className="font-medium text-foreground">{item.quantity}</span></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center font-mono">
                        <p className="text-sm font-medium">{fmt(item.price)}</p>
                        {item.quantity > 1 && <p className="text-xs text-muted-foreground mt-1">Tổng: {fmt(item.price * item.quantity)}</p>}
                      </div>
                    </div>
                  ))}
                  {!viewOrder.items?.length && <p className="text-sm text-muted-foreground italic">Không có chi tiết sản phẩm.</p>}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted/40 rounded-lg border border-border/50">
                <p className="font-medium text-muted-foreground">Tổng cộng</p>
                <p className="text-xl font-bold font-mono text-primary">{fmt(viewOrder.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl w-full max-w-md border border-border shadow-2xl relative flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cập nhật đơn hàng #{editOrder.orderCode}</h3>
              <button onClick={() => setEditOrder(null)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Trạng thái đơn hàng</label>
                <select name="status" defaultValue={editOrder.status} className="w-full p-2.5 text-sm bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Trạng thái vận chuyển</label>
                <select name="shippingStatus" defaultValue={editOrder.shippingStatus} className="w-full p-2.5 text-sm bg-input-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="NOT_SHIPPED">Chưa giao</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="DELIVERED">Đã giao</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditOrder(null)} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
