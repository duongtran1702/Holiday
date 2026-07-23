import { callApi } from '../../../core/utils/callApi';
import { ApiResponse } from '../../../core/types';

export interface ProductDto {
    id: string;
    name: string;
    category: string;
    price: number;
    material: string;
    rating: number;
    reviews: number;
    image: string;
    badge: string;
    colors: string[];
    sizes: string[];
    stock: Record<string, number>;
}

export type CreateProductDto = Omit<ProductDto, 'id'>;

export const productService = {
    getAllProducts: () => {
        return callApi<ApiResponse<ProductDto[]>>('/products', 'GET');
    },
    createProduct: (data: CreateProductDto) => {
        return callApi<ApiResponse<ProductDto>>('/products', 'POST', data);
    },
    updateProduct: (id: string, data: CreateProductDto) => {
        return callApi<ApiResponse<ProductDto>>(`/products/${id}`, 'PUT', data);
    },
    deleteProduct: (id: string) => {
        return callApi<ApiResponse<void>>(`/products/${id}`, 'DELETE');
    },
    getAvailableColors: (): Promise<string[]> => {
        return callApi<string[]>('/products/colors', 'GET');
    },
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return callApi<{ mediaUrl: string }>('/media/upload', 'POST', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
