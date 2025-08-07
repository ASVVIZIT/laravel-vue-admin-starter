import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { permissionStore } from '@/store/permissionStore';
import { useTalkStreamStore } from "@/modules/TalkStream/Stores/talkStreamStore";
import { updateEchoToken } from "@/modules/TalkStream/plugins/echoTalkStream";
import * as userApi from '@/api/auth';

export const userStore = defineStore('user', () => {
    const router = useRouter();
    const id = ref(null);
    const name = ref('');
    const email = ref('');
    const avatar = ref('');
    const roles = ref([]);
    const permissions = ref([]);
    const isTestUser = ref(false);

    // Обновление токена и переподключение к TalkStream
    const refreshToken = async (newToken) => {
        updateEchoToken(newToken);
        const talkStreamStore = useTalkStreamStore();

        if (talkStreamStore.isConnected) {
            await talkStreamStore.disconnect();
            await talkStreamStore.initWebSockets();
        }
    };

    // Получение информации о пользователе
    const fetchInfo = async () => {
        try {
            const response = await userApi.getInfo();

            if (!response || !response.data) {
                throw new Error('Invalid user info response');
            }

            const data = response.data;
            id.value = data.id;
            name.value = data.name;
            avatar.value = data.avatar || 'images/avatar-male.png';
            email.value = data.email;
            roles.value = data.roles || [];
            permissions.value = data.permissions || [];
            isTestUser.value = data.is_test || false;

            return data;
        } catch (error) {
            console.error('User info error:', error);
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

    // Выход пользователя
    const logout = async () => {
        try {
            await userApi.logout();

            // Отключение от TalkStream
            const talkStreamStore = useTalkStreamStore();
            if (talkStreamStore.isConnected) {
                await talkStreamStore.disconnect();
            }

            // Сброс данных
            reset();

            // Сброс маршрутов
            const permStore = permissionStore();
            permStore.resetRoutes();

            // Перенаправление на страницу входа
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    // Смена ролей (для тестовых целей)
    const changeRoles = async (role) => {
        if (!isTestUser.value) {
            console.warn('Role change only allowed for test users');
            return;
        }

        const newRoles = [role.name];
        const newPermissions = role.permissions.map(p => p.name);

        roles.value = newRoles;
        permissions.value = newPermissions;

        // Сброс и перегенерация маршрутов
        const permStore = permissionStore();
        permStore.resetRoutes();

        const accessRoutes = await permStore.generateRoutes(newRoles, newPermissions);
        accessRoutes.forEach(route => {
            router.addRoute(route);
        });

        // Перенаправление на домашнюю страницу
        router.push('/');
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

        // Действия
        refreshToken,
        fetchInfo,
        reset,
        logout,
        changeRoles
    };
});
