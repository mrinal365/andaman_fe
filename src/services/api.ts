import axios from 'axios';
import { config } from '@/config';
import { toast, ToastContainer } from 'react-toastify';
import { TOKEN_KEY } from '@/constants';
import { getCookie } from '@/utils';

const api = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = getCookie(TOKEN_KEY);
        
        // If no token and not an auth request, reject early to avoid 401s
        if (!token && config.url && !config.url.includes('/auth/')) {
            return Promise.reject({
                message: 'No auth token available',
                config
            });
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // Unauthorized - could be session expired or wrong credentials.
            // Specific services will handle their own toasts if needed.
        }
        return Promise.reject(error);
    }
);

export default api;
