import { asyncRoutes, constantRoutes } from '@router/index';
import {defineStore} from "pinia";

/**
 * Check if it matches the current user right by meta.role
 * @param {String[]} roles
 * @param {String[]} permissions
 * @param route
 */
function canAccess(roles, permissions, route) {
  if (route.meta) {
    let hasRole = true;
    let hasPermission = true;
    if (route.meta.roles || route.meta.permissions) {
      // If it has meta.roles or meta.permissions, accessible = hasRole || permission
      hasRole = false;
      hasPermission = false;
      if (route.meta.roles) {
        hasRole = roles.some(role => route.meta.roles.includes(role));
      }

      if (route.meta.permissions) {
        hasPermission = permissions.some(permission => route.meta.permissions.includes(permission));
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
 */
function filterAsyncRoutes(routes, roles, permissions) {
  const res = [];

  routes.forEach(route => {
    const tmp = { ...route };
    if (canAccess(roles, permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(
          tmp.children,
          roles,
          permissions
        );
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
    }
  },
  actions: {
    generateRoutes(roles, permissions) {
      return new Promise(resolve => {
        let accessedRoutes;
        if (roles.includes('admin')) {
          accessedRoutes = asyncRoutes || [];
        } else {
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles, permissions);
        }

        this.$patch((state) => {
          state.addRoutes = accessedRoutes;
          state.routes = constantRoutes.concat(accessedRoutes);
        })
        resolve(accessedRoutes);
      });
    }
  }
})
