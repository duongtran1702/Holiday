import { callApi } from '../util/callApi';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const authApi = {
    login: (data: LoginRequest) => {
        return callApi<ApiResponse<AuthResponse>>('/auth/login', 'POST', data);
    },
    verify2fa: (data: { email: string; otpCode: string }) => {
        return callApi<ApiResponse<AuthResponse>>('/auth/verify-2fa', 'POST', data);
    },
    register: (data: RegisterRequest) => {
        return callApi<ApiResponse<AuthResponse>>('/auth/register', 'POST', data);
    },
    logout: () => {
        return callApi<ApiResponse<void>>('/auth/logout', 'POST');
    }
};
