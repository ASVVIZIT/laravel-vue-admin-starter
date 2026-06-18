import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
    setToken,
    getToken,
    removeToken,
    setLoginType as utilsSetLoginType,
    getLoginType,
    removeLoginType,
    VALID_LOGIN_TYPES
} from '@/utils/auth';
import { getBaseForType, resetBasePathCache } from '@/utils/detectBasePath';
import { useTalkStreamStore } from "@/modules/TalkStream/Stores/talkStreamStore";
import {
    csrf,
    login as apiLogin,
    testerLogin as apiTesterLogin,
    logout as apiLogout,
    getInfo as apiGetInfo
} from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(getToken());
    const loginType = ref(getLoginType());
    const isLoading = ref(false);
    const error = ref(null);

    // Getters
    const isAdmin = computed(() => loginType.value === 'admin');
    const isTester = computed(() => loginType.value === 'tester');
    const isUser = computed(() => loginType.value === 'user');
    const isAuthenticated = computed(() => !!token.value && !!user.value);

    const userRoles = computed(() => Array.isArray(user.value?.roles) ? user.value.roles : []);
    const userPermissions = computed(() => Array.isArray(user.value?.permissions) ? user.value.permissions : []);

    const currentModeConfig = computed(() => {
        const configs = {
            user: { label: 'Пользователь', icon: '👤', color: '#1890ff', dashboardPath: '/dashboard', loginPath: '/login' },
            admin: { label: 'Администратор', icon: '🔐', color: '#ff4d4f', dashboardPath: '/dashboard', loginPath: '/admin' },
            tester: { label: 'Тестировщик', icon: '🧪', color: '#faad14', dashboardPath: '/dashboard', loginPath: '/tester' }
        };
        const type = VALID_LOGIN_TYPES.includes(loginType.value) ? loginType.value : 'user';
        return configs[type];
    });

    // 🔥 УСТАНОВКА ТИПА
    const setLoginType = (type, force = false) => {
        if (!VALID_LOGIN_TYPES.includes(type)) {
            console.warn(`[AuthStore] Неверный тип: ${type}`);
            type = 'user';
        }
        if (user.value && !force) {
            console.log(`[AuthStore] Пользователь уже авторизован как ${loginType.value}`);
            return;
        }
        loginType.value = type;
        utilsSetLoginType(type);
        console.log(`[AuthStore] Login type: ${type}`);
    };

    // 🔥 ВХОД — принимает тип как параметр!
    const login = async (credentials, typeOverride = null) => {
        // P0: Валидация
        if (!credentials || typeof credentials !== 'object') {
            throw new Error('Неверные учётные данные');
        }

        // 🔥 Используем переданный тип или текущий
        const typeToUse = VALID_LOGIN_TYPES.includes(typeOverride) ? typeOverride : loginType.value;

        isLoading.value = true;
        error.value = null;

        try {
            console.log(`[AuthStore] 🔐 Login as ${typeToUse}`);

            // 🔥 P0-3: csrf с обработкой ошибок
            try {
                await csrf();
                console.log('[AuthStore] ✅ CSRF получен');
            } catch (csrfErr) {
                console.warn('[AuthStore] CSRF failed, продолжаем:', csrfErr?.message);
                // Не прерываем — попробуем войти без CSRF
            }

            // 🔥 P0-1: Передаём тип в API
            const response = await apiLogin(credentials, typeToUse);

            if (!response || !response.token) {
                throw new Error('Login failed: No token in response');
            }

            user.value = response.user || null;
            token.value = response.token;

            // 🔥 P1-3: Сохраняем токен с проверкой
            try {
                setToken(response.token);
                console.log('[AuthStore] ✅ Токен сохранён');
            } catch (tokenErr) {
                console.error('[AuthStore] Ошибка сохранения токена:', tokenErr?.message);
                throw new Error('Не удалось сохранить токен');
            }

            // 🔥 P0-4: TalkStream с обработкой ошибок
            try {
                const talkStream = useTalkStreamStore();
                if (talkStream && typeof talkStream.initWebSockets === 'function') {
                    await talkStream.initWebSockets();
                    console.log('[AuthStore] ✅ TalkStream инициализирован');
                }
            } catch (talkErr) {
                console.warn('[AuthStore] TalkStream init failed (не критично):', talkErr?.message);
                // НЕ прерываем вход!
            }

            console.log('[AuthStore] ✅ Login successful');
            return response;
        } catch (err) {
            console.error('[AuthStore] ❌ Login error:', err);
            error.value = err?.response?.data?.error
                || err?.response?.data?.message
                || err?.message
                || 'Не удалось войти в систему';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // Тестовый вход
    const testerLogin = async (role) => {
        if (!role || typeof role !== 'string') {
            throw new Error('Неверная роль тестера');
        }

        isLoading.value = true;
        error.value = null;

        try {
            console.log(`[AuthStore] 🔐 Tester login as ${role}`);

            try {
                await csrf();
            } catch (csrfErr) {
                console.warn('[AuthStore] CSRF failed:', csrfErr?.message);
            }

            const response = await apiTesterLogin(role);

            if (!response || !response.token) {
                throw new Error('Tester login failed: No token');
            }

            user.value = response.user || null;
            token.value = response.token;
            setToken(response.token);

            if (user.value) {
                user.value.is_test = true;
            }

            try {
                const talkStream = useTalkStreamStore();
                if (talkStream?.initWebSockets) {
                    await talkStream.initWebSockets();
                }
            } catch (talkErr) {
                console.warn('[AuthStore] TalkStream init failed:', talkErr?.message);
            }

            console.log('[AuthStore] ✅ Tester login successful');
            return response;
        } catch (err) {
            console.error('[AuthStore] ❌ Tester login error:', err);
            error.value = err?.response?.data?.error || err?.message || 'Tester login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // 🔥 ВЫХОД
    const logout = async () => {
        isLoading.value = true;
        error.value = null;

        const currentLoginType = VALID_LOGIN_TYPES.includes(loginType.value)
            ? loginType.value
            : 'user';

        try {
            console.log(`[AuthStore] 🚪 Logout from ${currentLoginType}`);
            await apiLogout();

            try {
                const talkStream = useTalkStreamStore();
                if (talkStream?.isConnected) {
                    talkStream.disconnect();
                }
            } catch (e) {
                console.warn('[AuthStore] TalkStream disconnect failed:', e?.message);
            }
        } catch (err) {
            console.error('[AuthStore] Logout API error:', err);
            error.value = err?.response?.data?.error || err?.message || 'Logout failed';
        } finally {
            user.value = null;
            token.value = null;
            removeToken();
            removeLoginType();
            resetBasePathCache();

            const basePath = getBaseForType(currentLoginType);

            try {
                window.location.href = basePath + 'login';
            } catch (e) {
                console.error('[AuthStore] Redirect failed:', e?.message);
                window.location.href = '/admin/login';
            }

            isLoading.value = false;
        }
    };

    // Проверка аутентификации
    const checkAuth = async (force = false) => {
        if (user.value && !force) return true;

        isLoading.value = true;
        error.value = null;

        try {
            if (!token.value) {
                console.log('[AuthStore] No token');
                return false;
            }

            const response = await apiGetInfo();

            if (!response || !response.data) {
                throw new Error('Invalid user info response');
            }

            user.value = response.data;
            return true;
        } catch (err) {
            console.error('[AuthStore] Auth check failed:', err);
            error.value = err?.response?.data?.error || err?.message || 'Auth check failed';

            user.value = null;
            token.value = null;
            removeToken();
            removeLoginType();

            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const clearError = () => { error.value = null; };

    return {
        user, token, loginType, isLoading, error,
        isAdmin, isTester, isUser, isAuthenticated,
        userRoles, userPermissions, currentModeConfig,
        setLoginType, login, testerLogin, logout, checkAuth, clearError
    };
});
