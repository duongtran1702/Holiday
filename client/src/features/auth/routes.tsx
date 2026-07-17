import { UserLoginPage } from './pages/UserLogin';
import { AdminLoginPage } from './pages/AdminLogin';
import { RegisterPage } from './pages/Register';

export const authRoutes = [
    { path: '/login', element: <UserLoginPage /> },
    { path: '/admin-login', element: <AdminLoginPage /> },
    { path: '/register', element: <RegisterPage /> }
];
