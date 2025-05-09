// store/permission.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { asyncRoutes, constantRoutes } from '@/router';

// Helper function to check route access permissions
// Вспомогательная функция для проверки прав доступа к маршруту
function canAccess(roles, permissions, route) {
    if (route.meta) {
        let hasRole = true;
        let hasPermission = true;

        if (route.meta.roles || route.meta.permissions) {
            hasRole = false;
            hasPermission = false;

            // Check if user has any of the required roles
            // Проверяем наличие необходимых ролей у пользователя
            if (route.meta.roles) {
                hasRole = roles.some(role => route.meta.roles.includes(role));
            }

            // Check if user has any of the required permissions
            // Проверяем наличие необходимых разрешений у пользователя
            if (route.meta.permissions) {
                hasPermission = permissions.some(permission =>
                    route.meta.permissions.includes(permission)
                );
            }
        }

        return hasRole || hasPermission;
    }
    return true;
}

// Recursive function to filter accessible routes
// Рекурсивная функция для фильтрации доступных маршрутов
function filterAsyncRoutes(routes, roles, permissions) {
    const res = [];

    routes.forEach(route => {
        const tmp = { ...route };
        if (canAccess(roles, permissions, tmp)) {
            // Filter child routes recursively
            // Рекурсивно фильтруем дочерние маршруты
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles, permissions);
            }
            res.push(tmp);
        }
    });

    return res;
}

export const usePermissionStore = defineStore('permission', () => {
    // State
    const routes = ref([]);         // All accessible routes / Все доступные маршруты
    const addRoutes = ref([]);      // Dynamically added routes / Динамически добавленные маршруты

    // Actions
    const generateRoutes = async (roles, permissions) => {
        let accessedRoutes;

        // Admin gets all routes
        // Администратор получает все маршруты
        if (roles.includes('admin')) {
            accessedRoutes = asyncRoutes || [];
        } else {
            // Filter routes based on roles and permissions
            // Фильтруем маршруты на основе ролей и разрешений
            accessedRoutes = filterAsyncRoutes(asyncRoutes, roles, permissions);
        }

        // Update state
        // Обновляем состояние
        addRoutes.value = accessedRoutes;
        routes.value = [...constantRoutes, ...accessedRoutes];

        return accessedRoutes;
    };

    return {
        routes,
        addRoutes,
        generateRoutes
    };
});
