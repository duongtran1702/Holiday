import { useState, useEffect } from 'react';
import { PRODUCTS } from "../../../core/utils/mockData";

export const useAdminProducts = () => {
    // In the future, this will fetch from API
    const [products, setProducts] = useState(PRODUCTS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Simulated API call
            setProducts(PRODUCTS);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts
    };
};
