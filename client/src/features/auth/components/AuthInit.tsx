import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '../../../core/utils/callApi';
import { setCredentials } from '../store/authSlice';

import { Loader2 } from 'lucide-react';

let refreshPromise: Promise<any> | null = null;

export function AuthInit({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Try to refresh token silently using HTTP-Only cookie
                if (!refreshPromise) {
                    refreshPromise = api.post<any>('/auth/refresh');
                }
                const response = await refreshPromise;
                // Since interceptor returns response.data, response is the ApiResponse object
                // If it's the ApiResponse object, it has a 'data' field.
                const authResponse = response.data; // or response if the server directly returns the object
                
                if (authResponse?.accessToken) {
                    const newAccess = authResponse.accessToken;
                    const user = authResponse.user;
                    
                    dispatch(setCredentials({
                        user,
                        accessToken: newAccess,
                        role: user.role?.toLowerCase() as any
                    }));
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccess;
                }
            } catch (err) {
                // Ignore error, user is simply not logged in
            } finally {
                setIsLoading(false);
                refreshPromise = null;
            }
        };

        verifyToken();
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
