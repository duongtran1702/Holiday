import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X, Upload } from "lucide-react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "../../../core/components/ui/overlay/Dialog";
import { Button } from "../../../core/components/ui/forms/Button";
import { Input } from "../../../core/components/ui/forms/Input";
import { Label } from "../../../core/components/ui/forms/Label";
import { CreateProductDto, ProductDto, productService } from "../services/productService";
import { toast } from "sonner";

interface ProductFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: ProductDto | null;
    onSuccess: () => void;
}

const DEFAULT_COLORS = ["Đen", "Trắng", "Xám", "Xanh Navy", "Đỏ", "Vàng"];
const DEFAULT_MATERIALS = ["Cotton 100%", "Polyester", "Linen", "Denim"];
const PRESET_SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];

export function ProductFormModal({ open, onOpenChange, product, onSuccess }: ProductFormModalProps) {
    const isEdit = !!product;
    const { register, handleSubmit, reset, watch, setValue } = useForm<CreateProductDto>({
        defaultValues: {
            name: "",
            category: "Áo Polo",
            price: 0,
            material: "",
            rating: 5,
            reviews: 0,
            image: "",
            badge: "",
            colors: [],
            sizes: [],
            stock: {}
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [colorInput, setColorInput] = useState("");
    const [materialInput, setMaterialInput] = useState("");

    const [savedMaterials, setSavedMaterials] = useState<string[]>(DEFAULT_MATERIALS);

    const watchColors = watch("colors") || [];
    const watchSizes = watch("sizes") || [];
    const watchStock = watch("stock") || {};
    const watchMaterial = watch("material") || "";

    const { data: serverColors = [] } = useQuery({
        queryKey: ["available-colors"],
        queryFn: productService.getAvailableColors,
        refetchOnWindowFocus: false
    });

    const displayColors = Array.from(new Set([...DEFAULT_COLORS, ...serverColors]));

    useEffect(() => {
        const localMaterials = localStorage.getItem("saved_materials");
        if (localMaterials) {
            try {
                const parsed = JSON.parse(localMaterials);
                setSavedMaterials(Array.from(new Set([...DEFAULT_MATERIALS, ...parsed])));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (open) {
            if (product) {
                reset({
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    material: product.material,
                    rating: product.rating,
                    reviews: product.reviews,
                    image: product.image,
                    badge: product.badge,
                    colors: product.colors || [],
                    sizes: product.sizes || [],
                    stock: product.stock || {}
                });
            } else {
                reset({
                    name: "",
                    category: "Áo Polo",
                    price: 0,
                    material: "",
                    rating: 5,
                    reviews: 0,
                    image: "",
                    badge: "",
                    colors: [],
                    sizes: [],
                    stock: {}
                });
            }
        }
    }, [open, product, reset]);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const res = await productService.uploadImage(file);
            setValue("image", res.mediaUrl);
            toast.success("Tải ảnh lên thành công");
        } catch (error) {
            toast.error("Tải ảnh thất bại");
        } finally {
            setIsUploading(false);
        }
    };

    const addColor = (c?: string) => {
        const raw = c || colorInput.trim();
        if (raw) {
            const formattedColor = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
            
            if (!watchColors.includes(formattedColor)) {
                setValue("colors", [...watchColors, formattedColor]);
            }

            if (!c) setColorInput("");
        }
    };

    const removeColor = (c: string) => {
        setValue("colors", watchColors.filter(color => color !== c));
    };

    const toggleSize = (s: string) => {
        if (watchSizes.includes(s)) {
            setValue("sizes", watchSizes.filter(size => size !== s));
        } else {
            setValue("sizes", [...watchSizes, s]);
        }
    };

    const addMaterial = (m?: string) => {
        const raw = m || materialInput.trim();
        if (raw) {
            const formattedMaterial = raw.charAt(0).toUpperCase() + raw.slice(1);
            setValue("material", formattedMaterial);
            
            if (!savedMaterials.includes(formattedMaterial)) {
                const newSaved = [...savedMaterials, formattedMaterial];
                setSavedMaterials(newSaved);
                localStorage.setItem("saved_materials", JSON.stringify(newSaved));
            }
            if (!m) setMaterialInput("");
        }
    };

    const updateStock = (variant: string, qty: number) => {
        setValue("stock", { ...watchStock, [variant]: qty });
    };

    const onSubmit = async (data: CreateProductDto) => {
        setIsSubmitting(true);
        try {
            if (isEdit) {
                await productService.updateProduct(product.id, data);
                toast.success("Cập nhật sản phẩm thành công");
            } else {
                await productService.createProduct(data);
                toast.success("Thêm sản phẩm thành công");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(isEdit ? "Cập nhật thất bại" : "Thêm thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 shrink-0 border-b">
                    <DialogTitle>{isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                    <DialogDescription>
                        Điền đầy đủ thông tin sản phẩm. Thêm phân loại màu, size và số lượng tồn kho.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <Label>Tên sản phẩm *</Label>
                            <Input {...register("name", { required: true })} placeholder="Ví dụ: Áo Polo Classic" />
                        </div>
                        <div className="space-y-2">
                            <Label>Giá (VNĐ) *</Label>
                            <Input type="number" {...register("price", { required: true, valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Input {...register("category")} placeholder="Ví dụ: Áo Polo" />
                        </div>
                        
                        {/* Chất liệu (Material) section */}
                        <div className="space-y-2">
                            <Label>Chất liệu</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={materialInput} 
                                    onChange={e => setMaterialInput(e.target.value)} 
                                    placeholder="Nhập chất liệu..." 
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }} 
                                />
                                <Button type="button" onClick={() => addMaterial()} variant="secondary">Lưu</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {savedMaterials.map(m => (
                                    <Button
                                        key={m}
                                        type="button"
                                        variant={watchMaterial === m ? "default" : "outline"}
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => addMaterial(m)}
                                    >
                                        {m}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nhãn nổi bật (Badge)</Label>
                            <Input {...register("badge")} placeholder="Ví dụ: Best Seller, Mới" />
                        </div>
                        <div className="space-y-2">
                            <Label>Ảnh sản phẩm</Label>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" className="relative shrink-0">
                                    {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Upload Ảnh
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadImage} />
                                </Button>
                                <Input {...register("image")} placeholder="Hoặc nhập URL ảnh" className="flex-1" />
                            </div>
                            {watch("image") && <img src={watch("image")} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-md border" />}
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-sm">Phân loại & Tồn kho</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Màu sắc</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {displayColors.map(color => (
                                        <Button
                                            key={color}
                                            type="button"
                                            variant={watchColors.includes(color) ? "default" : "outline"}
                                            size="sm"
                                            className="h-8"
                                            onClick={() => {
                                                if (watchColors.includes(color)) removeColor(color);
                                                else addColor(color);
                                            }}
                                        >
                                            {color}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Nhập màu khác..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }} />
                                    <Button type="button" onClick={() => addColor()} variant="secondary">Thêm</Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Kích cỡ</Label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_SIZES.map(size => (
                                        <Button
                                            key={size}
                                            type="button"
                                            variant={watchSizes.includes(size) ? "default" : "outline"}
                                            size="sm"
                                            className="h-8"
                                            onClick={() => toggleSize(size)}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {watchColors.length > 0 && watchSizes.length > 0 && (
                            <div className="mt-4 p-4 border rounded-lg bg-card">
                                <h4 className="text-sm font-medium mb-3">Nhập số lượng tồn kho theo Phân loại</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {watchSizes.map(s => (
                                        watchColors.map(c => {
                                            const variant = `${s}-${c}`;
                                            return (
                                                <div key={variant} className="flex items-center gap-2 justify-between border-b pb-2">
                                                    <span className="text-sm font-medium">{variant}</span>
                                                    <Input 
                                                        type="number" 
                                                        className="w-20 text-right h-8" 
                                                        value={watchStock[variant] || 0}
                                                        onChange={e => updateStock(variant, parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            )
                                        })
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t shrink-0 bg-background">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
