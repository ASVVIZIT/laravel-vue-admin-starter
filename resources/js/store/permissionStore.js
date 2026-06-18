import { asyncRoutes, constantRoutes } from '@/router';
import { defineStore } from "pinia";

/**
 * Check if it matches the current user right by meta.role
 * @param {String[]} roles
 * @param {String[]} permissions
 * @param route
 */
function canAccess(roles, permissions, route) {
  // P0: Защита от undefined route
  if (!route) return false;

  // P0: Защита от undefined ролей/прав
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  if (route.meta) {
    let hasRole = true;
    let hasPermission = true;

    if (route.meta.roles || route.meta.permissions) {
      hasRole = false;
      hasPermission = false;

      // P0: Проверка что meta.roles — массив
      if (Array.isArray(route.meta.roles) && route.meta.roles.length > 0) {
        hasRole = safeRoles.some(role => route.meta.roles.includes(role));
      }

      // P0: Проверка что meta.permissions — массив
      if (Array.isArray(route.meta.permissions) && route.meta.permissions.length > 0) {
        hasPermission = safePermissions.some(permission => route.meta.permissions.includes(permission));
      }
    }

    return hasRole || hasPermission;
  }

  // If no meta.roles/meta.permissions inputted - the route should be accessible
  return true;
}

/**
 * Find all routes of this role
 * @param routes asyncRoutes
 * @param roles
 * @param permissions
 */
function filterAsyncRoutes(routes, roles, permissions) {
  const res = [];

  // P0: Проверка что routes — массив
  if (!Array.isArray(routes)) {
    console.warn('[permissionStore] filterAsyncRoutes: routes не массив');
    return res;
  }

  routes.forEach(route => {
    // P0: Пропускаем невалидные маршруты
    if (!route || typeof route !== 'object') return;

    const tmp = { ...route };

    if (canAccess(roles, permissions, tmp)) {
      // P0: Проверка что children — массив
      if (Array.isArray(tmp.children) && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions);
      }
      res.push(tmp);
    }
  });

  return res;
}

export const permissionStore = defineStore('permission', {
  state: () => {
    return {
      routes: [],
      addRoutes: [],
    };
  },

  actions: {
    generateRoutes(roles, permissions) {
      return new Promise(resolve => {
        // P0: Защита от undefined
        const safeRoles = Array.isArray(roles) ? roles : [];
        const safePermissions = Array.isArray(permissions) ? permissions : [];

        let accessedRoutes;

        // 🔥 Проверка на роль 'admin' (Spatie Permission)
        if (safeRoles.includes('admin') || safeRoles.includes('super_admin')) {
          accessedRoutes = Array.isArray(asyncRoutes) ? asyncRoutes : [];
        } else {
          accessedRoutes = filterAsyncRoutes(asyncRoutes, safeRoles, safePermissions);
        }

        this.$patch((state) => {
          state.addRoutes = accessedRoutes;
          state.routes = (Array.isArray(constantRoutes) ? constantRoutes : []).concat(accessedRoutes);
        });

        resolve(accessedRoutes);
      });
    },

    // 🔥 НОВЫЙ МЕТОД — сброс динамических маршрутов
    resetRoutes() {
      this.$patch((state) => {
        state.addRoutes = [];
        state.routes = Array.isArray(constantRoutes) ? [...constantRoutes] : [];
      });
      console.log('[permissionStore] Маршруты сброшены');
    },

    // 🔥 НОВЫЙ МЕТОД — проверка доступа к маршруту
    canAccessRoute(route) {
      if (!route) return false;

      const state = this.$state;
      // Получаем роли и права из userStore
      try {
        const { userStore } = require('@/store/userStore');
        const user = userStore();
        return canAccess(user.roles, user.permissions, route);
      } catch (e) {
        console.warn('[permissionStore] Ошибка canAccessRoute:', e?.message);
        return false;
      }
    }
  },

  getters: {
    // 🔥 НОВЫЙ ГЕТТЕР — все маршруты включая динамические
    allRoutes: (state) => state.routes,

    // 🔥 НОВЫЙ ГЕТТЕР — только динамические маршруты
    dynamicRoutes: (state) => state.addRoutes,

    // 🔥 НОВЫЙ ГЕТТЕР — количество маршрутов
    routesCount: (state) => state.routes.length
  }
});
