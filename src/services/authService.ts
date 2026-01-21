import api from './api';
import { LoginCredentials, SignupData, AuthResponse, User } from '@/interfaces/auth';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const signup = async (userData: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
};

export const googleLogin = async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', { token });
    return response.data;
};

export const logout = async (): Promise<void> => {
    // Invalidate token or call logout endpoint
    // localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
};
