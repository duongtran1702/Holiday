import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../../App';
import { LayoutAtmin } from '../layout/LayoutAtmin';
import { LayoutB2B } from '../layout/LayoutB2B';
import { PrivateRouter } from './PrivateRouter';
import { NotFoundPage } from '../../pages/NotFoundPage';

// --- Features ---
import { authRoutes } from '../../features/auth';
import { orderAdminRoutes, orderB2BRoutes, orderCustomerRoutes } from '../../features/orders';
import { productAdminRoutes, B2CPortal } from '../../features/products';
import { userAdminRoutes } from '../../features/users';
import { promotionAdminRoutes, promotionUserRoutes } from '../../features/promotions';
import { inboxAdminRoutes } from '../../features/inbox';
import { dashboardAdminRoutes } from '../../features/dashboard';
import { paymentRoutes } from '../../features/payment';
import { TierProgress } from '../../features/orders/components/TierProgress';
import { AdminProfile } from '../../features/profile/pages/AdminProfile';

export const routers = createBrowserRouter([
    {
        path: '/',
        element: <App />, 
    },
    ...authRoutes, // Import từ Feature Auth
    {
        path: '/admin',
        element: (
            <PrivateRouter allowedRoles={['admin', 'staff']}>
                <LayoutAtmin />
            </PrivateRouter>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            ...dashboardAdminRoutes,
            ...orderAdminRoutes,
            ...productAdminRoutes,
            ...userAdminRoutes,
            ...promotionAdminRoutes,
            ...inboxAdminRoutes,
            { path: 'settings', element: <AdminProfile /> },
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
            ...orderB2BRoutes,
            ...promotionUserRoutes,
            { path: 'tier', element: <TierProgress totalQty={150} /> }
        ]
    },
    {
        path: '/b2c',
        children: [
            {
                index: true,
                element: (
                    <PrivateRouter allowedRoles={['customer']}>
                        <B2CPortal />
                    </PrivateRouter>
                )
            },
            ...orderCustomerRoutes.map(r => ({
                path: r.path,
                element: (
                    <PrivateRouter allowedRoles={['customer']}>
                        {r.element}
                    </PrivateRouter>
                )
            })),
            ...promotionUserRoutes.map(r => ({
                path: r.path,
                element: (
                    <PrivateRouter allowedRoles={['customer']}>
                        {r.element}
                    </PrivateRouter>
                )
            }))
        ]
    },
    ...paymentRoutes,
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
