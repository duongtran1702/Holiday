import React from 'react';
import { Navigate } from 'react-router-dom';
import { atminSelector } from '../store/reduxHook';
import { AuthRole } from '../types/index';

interface PrivateRouterProps {
    children: React.ReactNode;
    allowedRoles?: AuthRole[];
}

export const PrivateRouter: React.FC<PrivateRouterProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole } = atminSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; // Handle unauthorized
    }

    return <>{children}</>;
};
