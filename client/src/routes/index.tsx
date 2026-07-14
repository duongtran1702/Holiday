import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { UserLoginPage } from '../pages/user/UserLogin';
import { AdminLoginPage } from '../pages/admin/AdminLogin';
import { RegisterPage } from '../pages/user/Register';
import { LayoutAtmin } from '../layout/LayoutAtmin';
import { LayoutB2B } from '../layout/LayoutB2B';
import { B2CPortal } from '../pages/user/B2CPortal';
import { PrivateRouter } from './PrivateRouter';
import { NotFoundPage } from '../pages/NotFoundPage';

import { AdminOverview } from '../pages/admin/Overview';
import { AdminOrders } from '../pages/admin/Orders';
import { AdminProducts } from '../pages/admin/Products';
import { AdminAgents } from '../pages/admin/Agents';
import { AdminPromotions } from '../pages/admin/Promotions';
import { AdminUsers } from '../pages/admin/Users';
import { AdminInbox } from '../pages/admin/Inbox';

import { B2BOrderTab } from '../pages/user/OrderTab';
import { B2BHistoryTab } from '../pages/user/HistoryTab';
import { TierProgress } from '../pages/user/TierProgress';

export const routers = createBrowserRouter([
    {
        path: '/',
        element: <App />, // App should redirect or contain public layout
    },
    {
        path: '/login',
        element: <UserLoginPage />,
    },
    {
        path: '/admin-login',
        element: <AdminLoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/admin',
        element: (
            <PrivateRouter allowedRoles={['admin', 'staff']}>
                <LayoutAtmin />
            </PrivateRouter>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <AdminOverview /> },
            { path: 'orders', element: <AdminOrders /> },
            { path: 'products', element: <AdminProducts /> },
            { path: 'agents', element: <AdminAgents /> },
            { path: 'promotions', element: <AdminPromotions /> },
            { path: 'users', element: <AdminUsers /> },
            { path: 'inbox', element: <AdminInbox /> },
        ]
    },
    {
        path: '/b2b',
        element: (
            <PrivateRouter allowedRoles={['agent']}>
                <LayoutB2B />
            </PrivateRouter>
        ),
        children: [
            { index: true, element: <Navigate to="portal" replace /> },
            { path: 'portal', element: <B2BOrderTab /> },
            { path: 'history', element: <B2BHistoryTab /> },
            { path: 'tier', element: <TierProgress totalQty={150} /> }
        ]
    },
    {
        path: '/b2c',
        element: (
            <PrivateRouter allowedRoles={['customer']}>
                <B2CPortal />
            </PrivateRouter>
        )
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
