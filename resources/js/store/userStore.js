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

            // 🔍 РЕНТГЕН: Смотрим, что реально пришел от Axios
            console.log('🔍 [userStore] RAW Axios Response:', response);

            // Пытаемся достать данные, учитывая возможную двойную вложенность Laravel Resource
            const userData = response?.data?.data || response?.data;

            console.log('🔍 [userStore] EXTRACTED userData:', userData);
            console.log('🔍 [userStore] userData.roles:', userData?.roles);

            if (!userData || !userData.id) {
                console.error('[userStore] Неверный формат ответа:', response);
                throw new Error('Invalid user info response');
            }

            id.value = userData.id ?? null;
            name.value = userData.name ?? '';
            avatar.value = userData.avatar || '/images/avatar-male.png';
            email.value = userData.email ?? '';

            // 🔍 Ключевая строка: сохраняем роли
            roles.value = Array.isArray(userData.roles) ? userData.roles : [];
            permissions.value = Array.isArray(userData.permissions) ? userData.permissions : [];
            isTestUser.value = !!userData.is_test;

            console.log('✅ [userStore] FINAL STORE STATE -> roles:', roles.value, 'permissions:', permissions.value);

            return userData;
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
