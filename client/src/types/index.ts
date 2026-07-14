export type AppScreen = "auth-login-user" | "auth-login-admin" | "auth-register" | "app";

export type AuthRole = "customer" | "agent" | "admin" | "staff" | null;

export type PermSet = Record<string, Record<string, boolean>>;

export type StaffMember = {
  id: string; name: string; email: string; phone: string;
  jobTitle: string; status: "Hoạt động" | "Tạm khóa";
  lastLogin: string; permissions: PermSet;
};

export interface LoginRequest {
    email: string;
    password?: string;
    portal?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}

export interface UserInfo {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    role: string;
    status: string;
    authProvider?: string;
    permissions?: string[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserInfo;
    require2fa?: boolean;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}