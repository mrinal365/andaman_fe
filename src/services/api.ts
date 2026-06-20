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
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - could be session expired or wrong credentials.
                    // Specific services will handle their own toasts if needed.
                    break;
                case 429:
                    // Rate limited — show a clear message with retry info
                    {
                        const retryAfter = data?.retryAfter;
                        const minutes = retryAfter ? Math.ceil(retryAfter / 60) : null;
                        const timeMsg = minutes ? ` Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` : '';
                        toast.error(`Too many requests.${timeMsg}`, {
                            toastId: 'rate-limit-toast', // Prevent duplicate toasts
                            autoClose: 8000,
                        });
                    }
                    break;
                case 400:
                    // Bad request — validation error; let individual handlers show specific messages
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
