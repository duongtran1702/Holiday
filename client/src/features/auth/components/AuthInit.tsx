import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '../../../core/utils/callApi';
import { setCredentials } from '../../../core/store/slice/authSlice';

import { Loader2 } from 'lucide-react';

export function AuthInit({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Try to refresh token silently using HTTP-Only cookie
                const response = await api.post<any>('/auth/refresh');
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
