import { useState } from 'react';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { PRODUCTS, PRICING_TIERS } from '../../../core/utils/mockData';
import { fmt } from '../../../core/utils/format';
import { TierProgress } from '../components/TierProgress';
type MatrixQty = Record<string, number>;

export function B2BOrderTab() {
    const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
    const [matrixQty, setMatrixQty] = useState<MatrixQty>({});
    const [payMethod, setPayMethod] = useState<'cash' | 'credit'>('cash');
    const sizes = selectedProduct.sizes;
    const colors = selectedProduct.colors;
    const totalQty = Object.values(matrixQty).reduce((s, v) => s + v, 0);
    const activeTier =
        PRICING_TIERS.find((t) => totalQty >= t.min && totalQty <= t.max) ??
        PRICING_TIERS[0];
    const totalAmount = totalQty * activeTier.price;
    const stockOf = (s: string, c: string) =>
        (selectedProduct.stock as Record<string, number>)[`${s}-${c}`] ?? 0;
    const setCell = (s: string, c: string, v: number) =>
        setMatrixQty((p) => ({ ...p, [`${s}-${c}`]: Math.max(0, v) }));
    const sizeTotal = (s: string) =>
        colors.reduce((a, c) => a + (matrixQty[`${s}-${c}`] ?? 0), 0);
    const colorTotal = (c: string) =>
        sizes.reduce((a, s) => a + (matrixQty[`${s}-${c}`] ?? 0), 0);
    return (
        <div className="flex gap-5 h-full">
            <div className="w-52 shrink-0 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
                    Chọn sản phẩm
                </p>
                {PRODUCTS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setSelectedProduct(p);
                            setMatrixQty({});
                        }}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${selectedProduct.id === p.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-card hover:border-accent/40 hover:bg-muted/30'}`}
                    >
                        <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-medium leading-snug line-clamp-2">
                                {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {fmt(p.price)}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="flex-1 min-w-0 space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
                    <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-16 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {selectedProduct.category}
                        </p>
                        <h2
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-lg font-semibold leading-snug"
                        >
                            {selectedProduct.name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedProduct.material}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground">
                                {selectedProduct.colors.length} màu ·{' '}
                                {selectedProduct.sizes.length} size
                            </span>
                            <span className="text-xs font-medium text-accent">
                                Giá lẻ: {fmt(selectedProduct.price)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <TierProgress totalQty={totalQty} />
                </div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                            Bảng đặt hàng theo Size × Màu
                        </h3>
                        <button
                            onClick={() => setMatrixQty({})}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/60">
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                                        Size
                                    </th>
                                    {colors.map((c) => (
                                        <th
                                            key={c}
                                            className="px-3 py-2.5 text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider"
                                        >
                                            {c}
                                        </th>
                                    ))}
                                    <th className="px-4 py-2.5 text-xs font-semibold text-center text-accent uppercase tracking-wider">
                                        Tổng
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.map((size, ri) => (
                                    <tr
                                        key={size}
                                        className={`border-t border-border ${ri % 2 === 1 ? 'bg-muted/20' : ''}`}
                                    >
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center justify-center w-8 h-7 bg-primary text-primary-foreground text-xs font-bold rounded-md">
                                                {size}
                                            </span>
                                        </td>
                                        {colors.map((color) => {
                                            const qty =
                                                matrixQty[`${size}-${color}`] ??
                                                0;
                                            const stock = stockOf(size, color);
                                            const over = qty > stock;
                                            let inputStateClass = 'border-border bg-input-background focus:ring-accent/30 focus:border-accent';
                                            if (over) {
                                                inputStateClass = 'border-destructive bg-red-50 text-destructive';
                                            } else if (qty > 0) {
                                                inputStateClass = 'border-accent bg-accent/5 focus:ring-accent/30';
                                            }
                                            
                                            let stockTextClass = 'text-muted-foreground';
                                            if (stock === 0) {
                                                stockTextClass = 'text-destructive';
                                            } else if (stock <= 5) {
                                                stockTextClass = 'text-amber-500';
                                            }

                                            return (
                                                <td
                                                    key={color}
                                                    className="px-2 py-1.5"
                                                >
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={stock}
                                                            value={
                                                                qty === 0
                                                                    ? ''
                                                                    : qty
                                                            }
                                                            onChange={(e) =>
                                                                setCell(
                                                                    size,
                                                                    color,
                                                                    Number.parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            placeholder="0"
                                                            className={`w-14 text-center py-1 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 transition-colors ${inputStateClass}`}
                                                        />
                                                        <span
                                                            className={`text-xs ${stockTextClass}`}
                                                        >
                                                            {stock === 0
                                                                ? 'Hết'
                                                                : `/${stock}`}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-2 text-center">
                                            <span
                                                className={`text-sm font-bold font-mono ${sizeTotal(size) > 0 ? 'text-accent' : 'text-muted-foreground'}`}
                                            >
                                                {sizeTotal(size)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-primary/20 bg-primary/5">
                                    <td className="px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase">
                                        Tổng/Màu
                                    </td>
                                    {colors.map((c) => (
                                        <td
                                            key={c}
                                            className="px-3 py-2.5 text-center font-bold font-mono text-sm"
                                        >
                                            {colorTotal(c)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2.5 text-center font-bold font-mono text-accent text-base">
                                        {totalQty}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="w-60 shrink-0 space-y-3">
                <div className="bg-card border border-border rounded-xl p-4 sticky top-32">
                    <h3 className="text-sm font-semibold mb-3">
                        Tóm tắt đơn hàng
                    </h3>
                    {totalQty === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Package
                                size={28}
                                className="mx-auto mb-2 opacity-30"
                            />
                            <p className="text-xs">
                                Nhập số lượng vào bảng để bắt đầu
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs">
                                    Tổng số lượng
                                </span>
                                <span className="font-mono font-bold text-base">
                                    {totalQty} bộ
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs">
                                    Bậc giá
                                </span>
                                <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                                    {activeTier.label}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs">
                                    Đơn giá
                                </span>
                                <span className="font-mono text-xs">
                                    {fmt(activeTier.price)}
                                </span>
                            </div>
                            {activeTier.discount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span className="text-xs">Tiết kiệm</span>
                                    <span className="text-xs font-medium">
                                        −
                                        {fmt(
                                            (selectedProduct.price -
                                                activeTier.price) *
                                                totalQty,
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-border pt-2.5 flex justify-between items-baseline">
                                <span className="text-xs text-muted-foreground">
                                    Thành tiền
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                    }}
                                    className="text-lg font-bold text-accent"
                                >
                                    {fmt(totalAmount)}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Thanh toán
                        </p>
                        {[
                            {
                                key: 'cash',
                                label: 'Thanh toán ngay',
                                sub: 'Chuyển khoản / VNPay',
                            },
                            {
                                key: 'credit',
                                label: 'Ghi nợ',
                                sub: 'Còn hạn mức: 36.5tr',
                            },
                        ].map((m) => (
                            <label
                                key={m.key}
                                htmlFor={`b2b-pay-${m.key}`}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${payMethod === m.key ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
                            >
                                <input
                                    id={`b2b-pay-${m.key}`}
                                    type="radio"
                                    name="b2b-pay"
                                    checked={payMethod === m.key}
                                    onChange={() => setPayMethod(m.key as any)}
                                    className="mt-0.5 accent-accent"
                                />
                                <span className="flex flex-col">
                                    <span className="text-xs font-medium">
                                        {m.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {m.sub}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex gap-1.5">
                        <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                        Hạn mức còn: <strong>36.5 triệu</strong>
                    </div>
                    <button
                        disabled={totalQty === 0}
                        className="w-full mt-3 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {totalQty > 0 ? `Đặt ${totalQty} bộ` : 'Chưa chọn SP'}{' '}
                        {totalQty > 0 && <ArrowRight size={13} />}
                    </button>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Công nợ hiện tại
                    </p>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Đang nợ
                            </span>
                            <span className="font-mono text-destructive font-medium">
                                13.5 tr
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Hạn mức
                            </span>
                            <span className="font-mono">50 tr</span>
                        </div>
                        <div className="relative h-1.5 bg-muted rounded-full mt-2">
                            <div
                                className="absolute inset-y-0 left-0 bg-accent rounded-full"
                                style={{ width: '27%' }}
                            />
                        </div>
                        <p className="text-muted-foreground">
                            Đã dùng 27% hạn mức
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
