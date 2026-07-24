import { useState, useEffect } from 'react';
import { callApi } from '../../../core/utils/callApi';

export const useAdminAgents = () => {
    // In the future, this will fetch from API
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const response = await callApi<any>('/admin/agents', 'GET');
            setAgents(response.data || []);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const approveAgent = async (id: string) => {
        try {
            await callApi(`/admin/agents/${id}/approve`, 'PATCH');
            fetchAgents();
        } catch (err) {
            console.error(err);
        }
    };

    const updateCredit = async (id: string, creditLimit: number) => {
        try {
            await callApi(`/admin/agents/${id}/credit`, 'PATCH', { creditLimit });
            fetchAgents();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const summary = {
        totalDebt: 39500000,
        inTermDebt: 19500000,
        overdueDebt: 20000000
    };

    return {
        agents,
        loading,
        error,
        summary,
        approveAgent,
        updateCredit,
        refetch: fetchAgents
    };
};
