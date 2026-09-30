import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { atminDispatch } from '../../../core/store/reduxHook';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../services/auth.api';

export const useRegister = () => {
    const navigate = useNavigate();
    const dispatch = atminDispatch();
    const [tab, setTab] = useState<"b2c" | "b2b">("b2c");
    const [b2cStep, setB2cStep] = useState<"form" | "done">("form");
    const [b2bStep, setB2bStep] = useState<"form" | "pending">("form");
    const [isRegistering, setIsRegistering] = useState(false);

    const [b2c, setB2c] = useState({ name: "", phone: "", email: "", pw: "", confirm: "" });
    const [b2cError, setB2cError] = useState("");

    const [b2b, setB2b] = useState({ name: "", phone: "", email: "", pw: "", confirm: "", business: "", tax: "", address: "" });
    const [b2bError, setB2bError] = useState("");

    const validateB2C = () => {
        if (!b2c.name.trim() || !b2c.phone.trim() || !b2c.email.trim() || !b2c.pw.trim()) return "Vui lòng điền đầy đủ các trường bắt buộc.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(b2c.email.trim())) return "Định dạng email không hợp lệ.";
        if (b2c.pw !== b2c.confirm) return "Mật khẩu xác nhận không khớp.";
        if (b2c.pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
        return "";
    };

    const validateB2B = () => {
        if (!b2b.name.trim() || !b2b.phone.trim() || !b2b.email.trim() || !b2b.pw.trim() || !b2b.business.trim() || !b2b.address.trim()) return "Vui lòng điền đầy đủ các trường bắt buộc.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(b2b.email.trim())) return "Định dạng email không hợp lệ.";
        if (b2b.pw !== b2b.confirm) return "Mật khẩu xác nhận không khớp.";
        if (b2b.pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
        return "";
    };

    const handleB2CSubmit = async () => {
        const e = validateB2C(); 
        if (e) { setB2cError(e); return; } 
        
        setIsRegistering(true);
        try {
            const response = await authApi.register({ email: b2c.email, password: b2c.pw, fullName: b2c.name, phone: b2c.phone });
            const { user, accessToken } = response.data;
            let roleStr = user.role?.toLowerCase() as any || "customer";
            dispatch(setCredentials({ user, accessToken, role: roleStr }));
            setB2cStep("done");
        } catch (err: any) {
            setB2cError(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleB2BSubmit = async () => {
        const e = validateB2B(); 
        if (e) { setB2bError(e); return; } 

        setIsRegistering(true);
        try {
            await authApi.registerAgent({
                email: b2b.email,
                password: b2b.pw,
                name: b2b.name,
                phone: b2b.phone,
                business: b2b.business,
                tax: b2b.tax,
                address: b2b.address
            });
            setB2bStep("pending");
        } catch (err: any) {
            setB2bError(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setIsRegistering(false);
        }
    };

    return {
        tab, setTab,
        b2cStep, setB2cStep,
        b2bStep, setB2bStep,
        isRegistering,
        b2c, setB2c,
        b2cError, setB2cError,
        b2b, setB2b,
        b2bError, setB2bError,
        handleB2CSubmit,
        handleB2BSubmit,
        navigate
    };
};
