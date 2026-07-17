import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { atminDispatch } from '../../../core/store/reduxHook';
import { setCredentials } from '../../../core/store/slice/authSlice';
import { authApi } from '../services/auth.api';
import { AuthRole } from '../../../core/types/index';
import { useGoogleLogin } from '@react-oauth/google';

export const useUserLogin = () => {
    const navigate = useNavigate();
    const dispatch = atminDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userError, setUserError] = useState("");
    const [userLoading, setUserLoading] = useState(false);

    const handleUserLogin = async () => {
        setUserError("");
        if (!email.trim() || !password.trim()) {
            setUserError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
        if (!emailRegex.test(email.trim())) {
            setUserError("Định dạng email không hợp lệ.");
            return;
        }

        setUserLoading(true);
        try {
            const response = await authApi.login({ email: email.trim(), password, portal: 'customer' });
            const { user, accessToken } = response.data;
            
            let roleStr = user.role?.toLowerCase() as AuthRole;
            if (!roleStr) roleStr = "customer";

            dispatch(setCredentials({ user, accessToken, role: roleStr }));
            
            if (roleStr === "agent") { navigate("/b2b"); }
            else if (roleStr === "admin" || roleStr === "staff") { navigate("/admin"); }
            else { navigate("/b2c"); }
        } catch (error: any) {
            const { message } = error.response?.data || {};
            if (message) {
                setUserError(message);
            } else {
                setUserError("Email hoặc mật khẩu không chính xác.");
            }
        } finally {
            setUserLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setUserError("");
            setUserLoading(true);
            try {
                const response = await authApi.loginWithGoogle({ accessToken: tokenResponse.access_token });
                const { user, accessToken } = response.data;
                
                let roleStr = user.role?.toLowerCase() as AuthRole;
                if (!roleStr) roleStr = "customer";

                dispatch(setCredentials({ user, accessToken, role: roleStr }));
                
                if (roleStr === "agent") { navigate("/b2b"); }
                else if (roleStr === "admin" || roleStr === "staff") { navigate("/admin"); }
                else { navigate("/b2c"); }
            } catch (error: any) {
                const { message } = error.response?.data || {};
                if (message) {
                    setUserError(message);
                } else {
                    setUserError("Đăng nhập bằng Google thất bại.");
                }
            } finally {
                setUserLoading(false);
            }
        },
        onError: () => setUserError('Đăng nhập Google thất bại.')
    });

    return {
        email, setEmail,
        password, setPassword,
        userError,
        userLoading,
        handleUserLogin,
        googleLogin
    };
};
