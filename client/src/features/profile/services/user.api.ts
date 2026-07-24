import { callApi } from '../../../core/utils/callApi';
import { AuthResponse, ApiResponse } from '../../../core/types';

export const userApi = {
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return callApi<ApiResponse<AuthResponse['user']>>('/users/me/avatar', 'POST', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateProfile: (data: { fullName?: string; phone?: string; address?: string }) => {
        return callApi<ApiResponse<AuthResponse['user']>>('/users/me', 'PUT', data);
    }
};
