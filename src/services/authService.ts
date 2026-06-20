import api from './api';
import { LoginCredentials, SignupData, AuthResponse } from '../../types/auth';
import { User } from '../../types/user';
import { getDeviceFingerprint } from '@/utils/rateLimiter';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

/**
 * Signup goes through our local Next.js API proxy (/api/auth/register)
 * which handles rate limiting, validation, and honeypot detection
 * before forwarding to the real backend.
 */
export const signup = async (userData: SignupData & { website?: string }): Promise<AuthResponse> => {
    const fingerprint = typeof window !== 'undefined' ? getDeviceFingerprint() : '';

    // Call our local proxy, not the backend directly
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': fingerprint,
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        // Construct an error that matches what axios errors look like
        // so the signup page's catch block works consistently
        const error: any = new Error(data.message || 'Signup failed');
        error.response = { data, status: response.status };
        throw error;
    }

    return data;
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
