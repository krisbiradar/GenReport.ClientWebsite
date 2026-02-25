import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@/utils/models/auth-models";

export interface AuthState {
    isAuthenticated: boolean;
    role: UserRole | null;
    email: string;
    firstName: string;
    lastName: string;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    role: null,
    email: "",
    firstName: "",
    lastName: "",
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(
            state,
            action: PayloadAction<{
                role: UserRole;
                email: string;
                firstName: string;
                lastName: string;
            }>
        ) {
            state.isAuthenticated = true;
            state.role = action.payload.role;
            state.email = action.payload.email;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.error = null;
        },
        clearAuth(state) {
            state.isAuthenticated = false;
            state.role = null;
            state.email = "";
            state.firstName = "";
            state.lastName = "";
            state.error = null;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

export const { setAuth, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
