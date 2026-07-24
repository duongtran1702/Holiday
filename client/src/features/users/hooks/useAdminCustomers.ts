import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi } from '../../../core/utils/callApi';

export interface Customer {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status: string;
}

export function useAdminCustomers() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("Tất cả");

    const { data: customers = [], isLoading: isCustomersLoading } = useQuery({
        queryKey: ['admin-customers'],
        queryFn: async () => {
            const res = await callApi<any>("/admin/users/customers", "GET");
            if (res.success && res.data) {
                return res.data as Customer[];
            }
            return [];
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (id: string) => callApi<any>(`/admin/users/${id}/status`, "PATCH"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
            toast.success("Cập nhật trạng thái thành công");
        },
        onError: () => {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    });

    const handleToggleStatus = async (id: string) => {
        toggleStatusMutation.mutate(id);
    };

    const filteredCustomers = customers.filter((c: Customer) => {
        if (statusFilter === "Hoạt động") return c.status === "active";
        if (statusFilter === "Tạm khóa") return c.status === "inactive";
        return true;
    });

    return {
        customers,
        statusFilter,
        setStatusFilter,
        handleToggleStatus,
        filteredCustomers,
        isCustomersLoading
    };
}
