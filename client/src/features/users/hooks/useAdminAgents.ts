import { useState, useEffect } from 'react';
import { AGENTS_DATA } from "../../../core/utils/mockData";

export const useAdminAgents = () => {
    // In the future, this will fetch from API
    const [agents, setAgents] = useState(AGENTS_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            // Simulated API call
            setAgents(AGENTS_DATA);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
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
        refetch: fetchAgents
    };
};
