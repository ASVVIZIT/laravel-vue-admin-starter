import { useUserStore } from '@/store/user';

/**
 * Checks if user has any of the required roles
 * Проверяет, есть ли у пользователя хотя бы одна из требуемых ролей
 * @param {Array<string>} value - Array of required roles / Массив требуемых ролей
 * @returns {boolean}
 * @example See @/views/permission/Directive.vue
 */
export default function checkRole(value) {
    // Validate input format
    // Проверка формата входных данных
    if (!value || !Array.isArray(value) || value.length === 0) {
        console.error('Roles must be a non-empty array. Example: v-role="[\'admin\',\'editor\']"');
        console.error('Роли должны быть переданы в виде непустого массива. Пример: v-role="[\'admin\',\'editor\']"');
        return false;
    }

    try {
        // Get user roles from Pinia store
        // Получаем роли пользователя из Pinia хранилища
        const userStore = useUserStore();

        // Throw error if store has no roles
        // Генерируем ошибку если хранилище не содержит ролей
        if (!userStore.roles || userStore.roles.length === 0) {
            throw new Error('User roles are not defined in store');
        }

        // Check role intersection
        // Проверяем пересечение ролей
        return userStore.roles.some(role => value.includes(role));
    } catch (error) {
        console.error('Role check error:', error);
        console.error('Ошибка проверки ролей:', error);
        return false;
    }
}
