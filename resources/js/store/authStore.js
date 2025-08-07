import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    setToken,
    getToken,
    removeToken,
    setLoginType as utilsSetLoginType,
    getLoginType,
    removeLoginType
} from '@/utils/auth';
import { useTalkStreamStore } from "@/modules/TalkStream/Stores/talkStreamStore";
import {
    csrf,
    login as apiLogin,
    testerLogin as apiTesterLogin,
    logout as apiLogout,
    getInfo as apiGetInfo
} from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();
    const user = ref(null);
    const token = ref(getToken());
    const loginType = ref(getLoginType() || 'user');
    const isLoading = ref(false);
    const error = ref(null);

    // Установка типа входа
    const setLoginType = (type) => {
        loginType.value = type;
        utilsSetLoginType(type);
        console.log(`[AuthStore] Login type set to: ${type}`);
    };

    // Авторизация
    const login = async (credentials) => {
        isLoading.value = true;
        error.value = null;

        try {
            console.log(`[AuthStore] Attempting login as ${loginType.value}`);

            // Получаем CSRF токен
            await csrf();

            // Выполняем вход
            const response = await apiLogin(credentials, loginType.value);

            if (!response || !response.token) {
                throw new Error('Login failed: No token in response');
            }

            // Обновляем состояние
            user.value = response.user;
            token.value = response.token;
            setToken(response.token);

            // Инициализируем TalkStream
            const talkStream = useTalkStreamStore();
            talkStream.initWebSockets();

            console.log('[AuthStore] Login successful');
            return response;
        } catch (err) {
            console.error('[AuthStore] Login error:', err);

            // Обработка ошибок
            if (err?.response?.data) {
                error.value = err.response.data.error ||
                    err.response.data.message ||
                    'Server error';
            } else {
                error.value = err.message || 'Login failed';
            }

            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // Тестовый вход (ИСПРАВЛЕНО)
    const testerLogin = async (role) => {
        isLoading.value = true;
        error.value = null;

        try {
            console.log(`[AuthStore] Attempting tester login as ${role}`);

            // Используем API-функцию с псевдонимом
            const response = await apiTesterLogin(role);

            if (!response || !response.token) {
                throw new Error('Tester login failed: No token in response');
            }

            user.value = response.user;
            token.value = response.token;
            setToken(response.token);

            // Безопасное обновление свойства
            if (user.value) {
                user.value.is_test = true;
            }

            const talkStream = useTalkStreamStore();
            talkStream.initWebSockets();

            console.log('[AuthStore] Tester login successful');
            return response;
        } catch (err) {
            console.error('[AuthStore] Tester login error:', err);
            error.value = err?.response?.data?.error ||
                err.message ||
                'Tester login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // Выход
    const logout = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            console.log(`[AuthStore] Logging out from ${loginType.value}`);
            await apiLogout();

            const talkStream = useTalkStreamStore();
            if (talkStream.isConnected) {
                talkStream.disconnect();
            }
        } catch (err) {
            console.error('[AuthStore] Logout API error:', err);
            error.value = err?.response?.data?.error ||
                err.message ||
                'Logout failed';
        } finally {
            user.value = null;
            token.value = null;
            removeToken();
            removeLoginType();

            const path = loginType.value === 'admin'
                ? '/admin/login'
                : loginType.value === 'tester'
                    ? '/tester/login'
                    : '/login';

            router.push(path);
            isLoading.value = false;
        }
    };

    // Проверка аутентификации (ИСПРАВЛЕНО)
    const checkAuth = async () => {
        isLoading.value = true;
        error.value = null;

        try {
            if (!token.value) {
                console.log('[AuthStore] No token, user is not authenticated');
                return false;
            }

            console.log('[AuthStore] Checking authentication status');

            // Используем API-функцию с псевдонимом
            const response = await apiGetInfo();

            if (!response || !response.data) {
                throw new Error('Invalid user info response');
            }

            user.value = response.data;
            console.log('[AuthStore] User authenticated:', response.data);
            return true;
        } catch (err) {
            console.error('[AuthStore] Auth check failed:', err);
            error.value = err?.response?.data?.error ||
                err.message ||
                'Auth check failed';

            user.value = null;
            token.value = null;
            removeToken();
            removeLoginType();

            return false;
        } finally {
            isLoading.value = false;
        }
    };

    // Сброс ошибки
    const clearError = () => {
        error.value = null;
    };

    return {
        user,
        token,
        loginType,
        isLoading,
        error,
        setLoginType,
        login,
        testerLogin,
        logout,
        checkAuth,
        clearError
    };
});
