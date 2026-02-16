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
import smartLightRoutes from './modules/SmartLight/smart-light.js';
import socialMediaLinks from './modules/SocialMediaLinks/social-media-links.js';

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
    requiresAuth: true
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
          noCache: false,
          requiresAuth: true
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
  ...smartLightRoutes,
  ...socialMediaLinks,
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

// ...
router.beforeEach(async (to, from, next) => {
  console.log('[Router Guard] Checking route:', to.path, 'meta:', to.meta); // Добавьте это
  const authStore = useAuthStore();

  if (to.meta.loginType) {
    authStore.setLoginType(to.meta.loginType);
    console.log(`[Router] Setting login type to ${to.meta.loginType}`);
  }

  if (to.meta.testOnly && import.meta.env.PROD) {
    return next('/login');
  }

  // Проверка аутентификации
  console.log('[Router Guard] requiresAuth is:', to.meta.requiresAuth); // Добавьте это
  if (to.meta.requiresAuth) { // <-- Это условие
    console.log('[Router Guard] Route requires auth, checking...');
    const isAuthenticated = await authStore.checkAuth();
    console.log('[Router Guard] User authenticated?', isAuthenticated); // Добавьте это

    if (!isAuthenticated) {
      console.log('[Router Guard] Not authenticated, redirecting to login.');
      const loginPath = authStore.loginType === 'admin'
          ? '/admin/login'
          : '/login';

      return next({
        path: loginPath,
        query: { redirect: to.fullPath }
      });
    }

    if (to.meta.role && !authStore.user?.roles?.includes(to.meta.role)) {
      return next('/401');
    }
  } else {
    console.log('[Router Guard] Route does not require auth, proceeding.'); // Добавьте это
  }

  next();
});
// ...

export function resetRouter() {
  const asyncRouterNameArr = asyncRoutes.map((mItem) => mItem.name);
  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}

export default router;
