import { defineStore } from "pinia";
import { ref } from "vue";
import { permissionStore } from '@/store/permissionStore';
import { useTalkStreamStore } from "@/modules/TalkStream/Stores/talkStreamStore";
import { updateEchoToken } from "@/modules/TalkStream/plugins/echoTalkStream";
import * as userApi from '@/api/auth';

export const userStore = defineStore('user', () => {
    // ============================
    // STATE
    // ============================
    const id = ref(null);
    const name = ref('');
    const email = ref('');
    const avatar = ref('');
    const roles = ref([]);
    const permissions = ref([]);
    const isTestUser = ref(false);

    // ============================
    // GETTERS (P0 защита)
    // ============================
    const isAuthenticated = () => !!id.value;
    const hasRole = (roleName) => Array.isArray(roles.value) && roles.value.includes(roleName);
    const hasPermission = (permissionName) => Array.isArray(permissions.value) && permissions.value.includes(permissionName);

    // ============================
    // ACTIONS
    // ============================

    // Обновление токена и переподключение к TalkStream
    const refreshToken = async (newToken) => {
        if (!newToken) {
            console.warn('[userStore] refreshToken вызван без токена');
            return;
        }

        try {
            updateEchoToken(newToken);
            const talkStreamStore = useTalkStreamStore();

            if (talkStreamStore?.isConnected) {
                await talkStreamStore.disconnect();
                await talkStreamStore.initWebSockets();
            }
        } catch (e) {
            console.error('[userStore] Ошибка refreshToken:', e?.message);
        }
    };

    // Получение информации о пользователе
    const fetchInfo = async () => {
        try {
            const response = await userApi.getInfo();

            // P0: Проверка ответа
            if (!response || !response.data) {
                throw new Error('Invalid user info response');
            }

            const data = response.data;
            id.value = data?.id ?? null;
            name.value = data?.name ?? '';
            avatar.value = data?.avatar || 'images/avatar-male.png';
            email.value = data?.email ?? '';
            roles.value = Array.isArray(data?.roles) ? data.roles : [];
            permissions.value = Array.isArray(data?.permissions) ? data.permissions : [];
            isTestUser.value = !!data?.is_test;

            return data;
        } catch (error) {
            console.error('[userStore] User info error:', error?.message);
            reset();
            throw error;
        }
    };

    // Сброс данных пользователя
    const reset = () => {
        id.value = null;
        name.value = '';
        email.value = '';
        avatar.value = '';
        roles.value = [];
        permissions.value = [];
        isTestUser.value = false;
    };

    // 🔥 УДАЛЁН logout() — теперь используется authStore.logout()!

    // Смена ролей (для тестовых целей)
    const changeRoles = async (role) => {
        // P0: Проверки
        if (!isTestUser.value) {
            console.warn('[userStore] Role change only allowed for test users');
            return;
        }

        if (!role || typeof role !== 'object') {
            console.error('[userStore] changeRoles: неверный role');
            return;
        }

        try {
            const newRoles = role.name ? [role.name] : [];
            // 🔥 Безопасная обработка permissions
            const newPermissions = Array.isArray(role.permissions)
                ? role.permissions.map(p => p?.name).filter(Boolean)
                : [];

            roles.value = newRoles;
            permissions.value = newPermissions;

            // Сброс и перегенерация маршрутов
            const permStore = permissionStore();

            if (typeof permStore.resetRoutes === 'function') {
                permStore.resetRoutes();
            }

            if (typeof permStore.generateRoutes === 'function') {
                const accessRoutes = await permStore.generateRoutes(newRoles, newPermissions);

                if (Array.isArray(accessRoutes)) {
                    accessRoutes.forEach(route => {
                        if (route?.path) {
                            // Используем router из импорта, не из store
                            import('vue-router').then(({ useRouter }) => {
                                const router = useRouter();
                                router.addRoute(route);
                            });
                        }
                    });
                }
            }

            // Редирект через window.location (учитывает base path)
            window.location.href = './';
        } catch (error) {
            console.error('[userStore] changeRoles error:', error?.message);
        }
    };

    return {
        // Состояние
        id,
        name,
        email,
        avatar,
        roles,
        permissions,
        isTestUser,

        // Геттеры
        isAuthenticated,
        hasRole,
        hasPermission,

        // Действия
        refreshToken,
        fetchInfo,
        reset,
        // 🔥 logout удалён — используйте authStore.logout()
        changeRoles
    };
});
