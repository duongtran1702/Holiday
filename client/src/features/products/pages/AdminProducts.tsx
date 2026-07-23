import { useState } from "react";
import { Plus, CheckCircle, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { fmt } from "../../../core/utils/format";
import { useAdminProducts } from "../hooks/useAdminProducts";
import { ProductFormModal } from "../components/ProductFormModal";
import { ProductDto } from "../services/productService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../core/components/ui/overlay/AlertDialog";

export function AdminProducts() {
  const { products, loading, deleteProduct, isDeleting, refetch } = useAdminProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleAddNew = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleEdit = (product: ProductDto) => {
      setEditingProduct(product);
      setIsModalOpen(true);
  };

  const confirmDelete = () => {
      if (productToDelete) {
          deleteProduct(productToDelete);
          setProductToDelete(null);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Sản phẩm & Tồn kho</h2>
          <button onClick={handleAddNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              <Plus size={13} /> Thêm sản phẩm
          </button>
      </div>
      <div className="space-y-3">
        {loading ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</div>
        ) : (
            products.map(p => {
                const total = p.stock ? Object.values(p.stock).reduce((s: number, v: number) => s + v, 0) : 0;
                const low = p.stock ? Object.values(p.stock).filter((v: number) => v <= 5).length : 0;
                
                return (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
                        <img src={p.image || "https://placehold.co/100x150?text=No+Image"} alt={p.name} className="w-14 h-[72px] object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                    <span className="text-xs text-muted-foreground">{p.category}</span>
                                    <h3 className="font-semibold text-sm">{p.name}</h3>
                                    <p className="text-xs text-muted-foreground">{p.material}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{fontFamily:"'Playfair Display',serif"}} className="text-accent font-semibold text-sm">{fmt(p.price)}</span>
                                    <button onClick={() => handleEdit(p)} className="p-1 text-muted-foreground hover:text-foreground"><Edit size={13} /></button>
                                    <button onClick={() => setProductToDelete(p.id)} className="p-1 text-muted-foreground hover:text-destructive" disabled={isDeleting}><Trash2 size={13} /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-xs"><strong>{total}</strong> <span className="text-muted-foreground">tổng kho</span></span>
                                <span className="text-xs text-muted-foreground">{p.colors?.length || 0} màu · {p.sizes?.length || 0} size</span>
                                {low > 0 && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} />{low} SKU sắp hết</span>}
                                <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11} />Đang bán</span>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <ProductFormModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
          product={editingProduct} 
          onSuccess={() => refetch()}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa sản phẩm khỏi danh sách. Bạn có chắc chắn muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
