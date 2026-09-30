import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { toast } from 'sonner';

export const useAdminProducts = () => {
    const queryClient = useQueryClient();

    const { data: products = [], isLoading: loading, error, refetch } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const res = await productService.getAllProducts();
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            toast.success('Đã xóa sản phẩm');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: () => {
            toast.error('Xóa sản phẩm thất bại');
        }
    });

    return {
        products,
        loading,
        error: error as Error | null,
        refetch,
        deleteProduct: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending
    };
};
