import { AdminUsers } from './pages/AdminUsers';
import { AdminAgents } from './pages/AdminAgents';
import { AdminCustomers } from './pages/AdminCustomers';

export const userAdminRoutes = [
    { path: 'users', element: <AdminUsers /> },
    { path: 'agents', element: <AdminAgents /> },
    { path: 'customers', element: <AdminCustomers /> }
];
