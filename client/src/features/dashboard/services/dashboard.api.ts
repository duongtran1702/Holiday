import { callApi } from '../../../core/utils/callApi';
import { ApiResponse } from '../../../core/types';
import { OrderResponse } from '../../orders/services/order.api';

export interface DashboardResponse {
    todayRevenue: number;
    newOrders: number;
    lowStockSkuCount: number;
    activeAgents: number;
    revenueChartData: any;
    orderStatusData: any;
    recentOrders: OrderResponse[];
    totalCustomers?: number;
    newCustomersToday?: number;
    lowStockProducts?: any[];
}

export const dashboardApi = {
    getMetrics: () => {
        return callApi<ApiResponse<DashboardResponse>>('/dashboard/metrics', 'GET');
    }
};
