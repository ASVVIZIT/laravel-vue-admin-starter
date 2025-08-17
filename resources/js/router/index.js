// resources/js/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { getLoginType } from '@/utils/auth';

/* Layout */
import Layout from '@/layout/Layout.vue';

/* Router for modules */
import chartsRoutes from './modules/charts';
import adminRoutes from './modules/admin';
import nestedRoutes from './modules/nested';
import errorRoutes from './modules/error';
import entityRoutes from './modules/entity';
import servicesRoutes from './modules/services.js';
import dynamicTableRoutes from './modules/dynamicTable.js';

// Функции для работы с куками
function getCookie(name) {
  const value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value ? value[2] : null;
}

export const constantRoutes = [
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('@views/auth/admin/login.vue'), // Используем правильный путь к компоненту
    meta: { loginType: 'user' },
    hidden: true,
  },
  {
    path: '/auth-redirect',
    component: () => import('@views/auth/admin/AuthRedirect.vue'), // Используем правильный путь к компоненту
    hidden: true,
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    meta: { loginType: 'admin' },
    component: () => import('@views/auth/admin/AdminLogin.vue'),
    hidden: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      authStore.setLoginType('admin')
      console.log('[Router] Setting login type to admin')

      // Handle hash navigation
      if (to.hash) {
        console.log(`[Router] Admin login with hash: ${to.hash}`)
        const pathFromHash = to.hash.replace('#', '')
        next(pathFromHash)
      } else {
        next()
      }
    }
  },
  {
    path: '/tester/login',
    name: 'TesterLogin',
    meta: { loginType: 'tester' },
    component: () => import('@/views/auth/tester/TesterLogin.vue'),
    hidden: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      authStore.setLoginType('tester')
      console.log('[Router] Setting login type to tester')
      next()
    }
  },
  {
    path: '/404',
    redirect: { name: 'Page404' },
    component: () => import('@/views/error-page/404.vue'),
    hidden: true,
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true,
  },
  {
    path: '/',
    redirect: (to) => {
      // Используем куки или хранилище
      const authStore = useAuthStore();
      const loginType = authStore.loginType || getLoginType() || 'user'
      console.log(`[Router] Home redirect for: ${loginType}`)

      if (loginType === 'admin') return '/admin/dashboard';
      if (loginType === 'tester') return '/tester/dashboard';
      return '/dashboard';
    },
    hidden: true,
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/dashboard.vue'),
        name: 'Dashboard',
        meta: {
          title: 'Dashboard',
          bootstrapIcon: 'house-fill',
          showInGuide: true,
          affix: true,
          noCache: false
        }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/edit',
    children: [
      {
        path: 'edit',
        component: () => import('@/views/users/SelfProfile.vue'), // Используем правильный путь к компоненту
        name: 'SelfProfile',
        meta: { title: 'UserProfile', bootstrapIcon: 'person-circle', noCache: true },
      },
    ],
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/guide.vue'), // Используем правильный путь к компоненту
        name: 'Guide',
        meta: { title: 'Guide', bootstrapIcon: 'bi bi-megaphone-fill', noCache: true },
      },
    ],
  },
  ...dynamicTableRoutes,
];

export const asyncRoutes = [
  {
    path: '/redirect/:path*',
    redirect: to => ({ path: `/${to.params.path || ''}` }),
    hidden: true,
  },
  servicesRoutes,
  entityRoutes,
  chartsRoutes,
  adminRoutes,
  nestedRoutes,
  errorRoutes,
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/404', hidden: true },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to, from, next) => {
  // Создаем экземпляр хранилища внутри хука
  const authStore = useAuthStore();

  // Установка типа логина
  if (to.meta.loginType) {
    authStore.setLoginType(to.meta.loginType);
    console.log(`[Router] Setting login type to ${to.meta.loginType}`);
  }

  // Проверка тестового окружения
  if (to.meta.testOnly && import.meta.env.PROD) {
    return next('/login');
  }

  // Проверка аутентификации
  if (to.meta.requiresAuth) {
    const isAuthenticated = await authStore.checkAuth();

    if (!isAuthenticated) {
      const loginPath = authStore.loginType === 'admin'
          ? '/admin/login'
          : '/login';

      return next({
        path: loginPath,
        query: { redirect: to.fullPath }
      });
    }

    // Проверка роли
    if (to.meta.role && !authStore.user?.roles?.includes(to.meta.role)) {
      return next('/401');
    }
  }

  next();
});

export function resetRouter() {
  const asyncRouterNameArr = asyncRoutes.map((mItem) => mItem.name);
  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}

export default router;
