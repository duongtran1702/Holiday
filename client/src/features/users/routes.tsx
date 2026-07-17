import { AdminUsers } from './pages/AdminUsers';
import { AdminAgents } from './pages/AdminAgents';

export const userAdminRoutes = [
    { path: 'users', element: <AdminUsers /> },
    { path: 'agents', element: <AdminAgents /> }
];
