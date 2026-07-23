import { UserLoginPage } from './pages/UserLogin';
import { AdminLoginPage } from './pages/AdminLogin';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';

export const authRoutes = [
    { path: '/login', element: <UserLoginPage /> },
    { path: '/admin-login', element: <AdminLoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> }
];
