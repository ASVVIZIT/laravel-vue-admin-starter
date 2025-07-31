import Cookies from "js-cookie";
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(Cookies.getItem('fenix-token') || null);
    const loginType = ref('user'); // 'user', 'admin', 'tester'
    const router = useRouter();

    const setLoginType = (type) => {
        loginType.value = type;
        Cookies.setItem('loginType', type);
    };

    const login = async (credentials) => {
        const url = loginType.value === 'admin'
            ? '/admin/auth/login'
            : '/auth/login';

        const response = await api.post(url, credentials);
        user.value = response.data.user;
        token.value = response.data.token;
        Cookies.setItem('fenix-token', response.data.token);
        return response;
    };

    const testerLogin = async (role) => {
        const response = await api.post(`/tester/login/${role}`);
        user.value = response.data.user;
        token.value = response.data.token;
        Cookies.setItem('fenix-token', response.data.token);
        user.value.is_test = true;
        return response;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        user.value = null;
        token.value = null;
        Cookies.removeItem('fenix-token');
        router.push('/login');
    };

    const checkAuth = async () => {
        try {
            const response = await api.get('/user');
            user.value = response.data;
            return true;
        } catch {
            return false;
        }
    };

    // Инициализация типа входа
    const storedType = Cookies.getItem('loginType');
    if (storedType) setLoginType(storedType);

    return {
        user,
        token,
        loginType,
        setLoginType,
        login,
        testerLogin,
        logout,
        checkAuth
    };
});
