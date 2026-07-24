import axios, { AxiosRequestConfig, Method } from 'axios';
import { store } from '../store/store';
import { logout, setCredentials } from '../../features/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const isAuthEndpoint = originalRequest.url === '/auth/login' || originalRequest.url === '/auth/google' || originalRequest.url === '/auth/refresh';
        
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response: any = await api.post('/auth/refresh');
                const authResponse = response.data;
                const newAccess = authResponse.accessToken;

                store.dispatch(setCredentials({ 
                    user: authResponse.user, 
                    accessToken: newAccess, 
                    role: authResponse.user.role?.toLowerCase() 
                }));

                processQueue(null, newAccess);

                originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
                return api(originalRequest);
            } catch (err: any) {
                processQueue(err, null);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    const role = store.getState().auth.userRole;
                    store.dispatch(logout());
                    if (role === 'admin' || role === 'staff') {
                        window.location.href = '/admin-login';
                    } else {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export const callApi = async <T = any>(endpoint: string, method: Method = 'GET', data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api({
        url: endpoint,
        method,
        data,
        ...config
    });
};