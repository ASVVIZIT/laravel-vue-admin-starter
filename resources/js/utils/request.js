import '@/bootstrap';
import Cookies from 'js-cookie';
import { ElMessage } from 'element-plus';
import { isLogged, getToken, setToken, getLoginType } from '@/utils/auth';

const service = window.axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
});

service.interceptors.request.use(
    config => {
        const token = getToken();
        const loginType = getLoginType();
        const csrfToken = Cookies.get('XSRF-TOKEN');

        console.log(`[Request] ${config.method.toUpperCase()} ${config.url} [${loginType}]`);

        if (token && isLogged()) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        if (loginType === 'admin' && !config.url.startsWith('/admin')) {
            config.url = `/admin${config.url}`;
            console.log(`[Request] Rewriting URL to: ${config.url}`);
        }

        return config;
    },
    error => {
        console.error('[AXIOS] Request error:', error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    response => {
        const newToken = response.headers['authorization'] || response.headers['Authorization'];

/*        if (newToken) {
            const tokenValue = newToken.startsWith('Bearer ') ? newToken.slice(7) : newToken;
            setToken(tokenValue);
            response.data = { ...response.data, token: tokenValue };
        }*/

        const authToken = response.data?.token || response.headers['authorization'];
        if (authToken) {
            const tokenValue = authToken.replace('Bearer ', '');
            setToken(tokenValue);
        }

        return response.data;
    },
    error => {
        if (error.response?.status === 401) {
            const loginType = getLoginType();
            window.location.href = loginType === 'admin' ? '/admin/login' : '/login';
        }

        const message = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Network error';

        ElMessage.error(message);
        return Promise.reject(error);
    }
);

export default service;
