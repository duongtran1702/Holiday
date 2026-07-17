import { AdminOrders } from './pages/AdminOrders';
import { B2BOrderTab } from './pages/B2BOrderTab';
import { B2BHistoryTab } from './pages/B2BHistoryTab';
import { OrderHistoryPage } from './pages/OrderHistoryPage';

export const orderAdminRoutes = [
    { path: 'orders', element: <AdminOrders /> }
];

export const orderB2BRoutes = [
    { path: 'portal', element: <B2BOrderTab /> },
    { path: 'history', element: <B2BHistoryTab /> }
];

export const orderCustomerRoutes = [
    { path: 'orders', element: <OrderHistoryPage /> }
];
