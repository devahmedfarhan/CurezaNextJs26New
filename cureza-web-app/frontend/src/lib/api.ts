import axios from 'axios';

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request Interceptor: Token attached to', config.url);
        } else {
            // console.warn('API Request Interceptor: No token found for', config.url);
        }

        const sessionId = localStorage.getItem('session_id');
        if (sessionId) {
            config.headers['X-Session-ID'] = sessionId;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token is invalid, let the AuthContext handle the cleanup
        }
        return Promise.reject(error);
    }
);

export default api;
