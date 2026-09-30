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

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
}

export const productService = {
    getProducts: (params?: { page?: number; size?: number; search?: string; category?: string; sort?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.sort) queryParams.append('sort', params.sort);
        return callApi<ApiResponse<PageResponse<ProductDto>>>(`/products?${queryParams.toString()}`, 'GET');
    },
    getAllProducts: () => {
        return callApi<ApiResponse<ProductDto[]>>('/products/all', 'GET');
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
