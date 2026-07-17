import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { atminDispatch } from '../../../core/store/reduxHook';
import { setCredentials } from '../../../core/store/slice/authSlice';
import { authApi } from '../services/auth.api';
import { AuthRole } from '../../../core/types/index';

export const useAdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = atminDispatch();
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPw, setAdminPw] = useState("");
    const [adminStep, setAdminStep] = useState<"creds" | "otp" | "locked">("creds");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [adminError, setAdminError] = useState("");
    const [failCount, setFailCount] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleAdminCreds = async () => {
        setAdminError("");
        if (!adminEmail.trim() || !adminPw.trim()) { setAdminError("Vui lòng nhập đầy đủ thông tin."); return; }
        const emailRegex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
        if (!emailRegex.test(adminEmail.trim())) { setAdminError("Định dạng email không hợp lệ."); return; }
        if (failCount >= 5) { setAdminStep("locked"); setCountdown(1800); return; }

        try {
            const response = await authApi.login({ email: adminEmail, password: adminPw, portal: 'admin' });
            const { user, require2fa, accessToken } = response.data;
            
            const roleStr = user.role?.toLowerCase() as AuthRole;
            if (roleStr !== "admin" && roleStr !== "staff") {
                setAdminError("Tài khoản không có quyền truy cập hệ thống quản trị.");
                return;
            }
            
            if (require2fa) {
                setAdminStep("otp");
                setCountdown(60);
            } else {
                dispatch(setCredentials({ user, accessToken, role: roleStr }));
                navigate("/admin");
            }
        } catch (err: any) {
            const next = failCount + 1;
            setFailCount(next);
            if (next >= 5) { setAdminStep("locked"); setCountdown(1800); return; }
            setAdminError(err.response?.data?.message || `Sai thông tin đăng nhập. Còn ${5 - next} lần thử.`);
        }
    };

    const handleResendOtp = async () => {
        setAdminError("");
        try {
            await authApi.login({ email: adminEmail, password: adminPw });
            setCountdown(60);
            setOtp(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        } catch (err: any) {
            setAdminError(err.response?.data?.message || "Không thể gửi lại mã OTP.");
        }
    };

    const handleOtpInput = (idx: number, val: string) => {
        const v = val.replace(/\D/, "").slice(-1);
        const next = [...otp]; next[idx] = v;
        setOtp(next);
        if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) return;
        
        try {
            const response = await authApi.verify2fa({ email: adminEmail, otpCode: code });
            const { user, accessToken } = response.data;
            
            const roleStr = user.role?.toLowerCase() as AuthRole;
            dispatch(setCredentials({ user, accessToken, role: roleStr }));
            
            navigate("/admin");
        } catch (err: any) {
            setAdminError(err.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
            setOtp(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        }
    };

    return {
        adminEmail, setAdminEmail,
        adminPw, setAdminPw,
        adminStep, setAdminStep,
        otp, setOtp,
        adminError, setAdminError,
        failCount, setFailCount,
        countdown, setCountdown,
        otpRefs,
        handleAdminCreds,
        handleResendOtp,
        handleOtpInput,
        handleOtpVerify
    };
};
