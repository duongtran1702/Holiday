import { useState, useEffect } from 'react';
import { callApi } from '../../../core/utils/callApi';
import { toast } from 'sonner';

export interface AdminAgent {
    id: string;
    name: string;
    contact: string;
    credit: number;
    used: number;
    orders: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const useAdminAgents = () => {
    const [agents, setAgents] = useState<AdminAgent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const response = await callApi<any>('/admin/agents', 'GET');
            const pageData = response.data;
            setAgents(Array.isArray(pageData) ? pageData : pageData?.content || []);
            setError(null);
        } catch (err: any) {
            setError(err);
            toast.error(err.response?.data?.message || 'Không thể tải danh sách đại lý');
        } finally {
            setLoading(false);
        }
    };

    const approveAgent = async (id: string) => {
        try {
            await callApi(`/admin/agents/${id}/approve`, 'PATCH');
            toast.success('Đã duyệt hồ sơ đại lý');
            await fetchAgents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Duyệt đại lý thất bại');
            throw err;
        }
    };

    const rejectAgent = async (id: string) => {
        try {
            await callApi(`/admin/agents/${id}/reject`, 'PATCH');
            toast.success('Đã từ chối hồ sơ đại lý');
            await fetchAgents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Từ chối đại lý thất bại');
            throw err;
        }
    };

    const updateCredit = async (id: string, creditLimit: number) => {
        try {
            await callApi(`/admin/agents/${id}/credit`, 'PATCH', { creditLimit });
            toast.success('Đã cập nhật hạn mức công nợ');
            await fetchAgents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Cập nhật hạn mức thất bại');
            throw err;
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const totalCredit = agents.reduce((sum, agent) => sum + Number(agent.credit || 0), 0);
    const usedCredit = agents.reduce((sum, agent) => sum + Number(agent.used || 0), 0);
    const summary = { totalCredit, usedCredit, remainingCredit: Math.max(0, totalCredit - usedCredit) };

    return {
        agents,
        loading,
        error,
        summary,
        approveAgent,
        rejectAgent,
        updateCredit,
        refetch: fetchAgents
    };
};
