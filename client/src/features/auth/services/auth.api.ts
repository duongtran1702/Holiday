import { callApi } from '../../../core/utils/callApi';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../../../core/types';

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
    loginWithGoogle: (data: { accessToken: string }) => {
        return callApi<ApiResponse<AuthResponse>>('/auth/google', 'POST', data);
    },
    logout: () => {
        return callApi<ApiResponse<void>>('/auth/logout', 'POST');
    }
};
