import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthRole, UserInfo } from '../../types/index';

interface AuthState {
    userRole: AuthRole | null;
    user: UserInfo | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    userRole: null,
    user: null,
    accessToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: UserInfo; accessToken: string; role: AuthRole }>) => {
            state.userRole = action.payload.role;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.userRole = null;
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
