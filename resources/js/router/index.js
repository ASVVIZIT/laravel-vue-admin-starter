import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { getLoginType, VALID_LOGIN_TYPES } from '@/utils/auth';
import { detectBasePath, getTypeFromBase } from '@/utils/detectBasePath';
import { getDefaultLoginType } from '@/utils/authConfig';

import Layout from '@/layout/Layout.vue';
import AuthLayout from '@/views/auth/Layout/AuthLayout.vue';

import chartsRoutes from './modules/charts';
import adminRoutes from './modules/admin';
import nestedRoutes from './modules/nested';
import errorRoutes from './modules/error';
import entityRoutes from './modules/entity';
import servicesRoutes from './modules/services.js';
import dynamicTableRoutes from './modules/dynamicTable.js';
import smartLightRoutes from './modules/SmartLight/smart-light.js';
import trainingRoutes from './modules/Training/training.js';
import landingRoutes from './modules/Landing/landingRouter.js';
import contactManagementRoutes from './modules/ContactManagement/contact-management.js';

// 🔥 ДИНАМИЧЕСКИЙ BASE PATH
const basePath = detectBasePath();
const initialType = getTypeFromBase(basePath);

console.log(`[Router] Base path: ${basePath}, type: ${initialType}`);

export const constantRoutes = [
  // 🔐 СТРАНИЦЫ ВХОДА — обёрнуты в AuthLayout
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      // ====================================================================
      // 🔐 СТРАНИЦЫ ВХОДА (с ModeSwitcher)
      // ====================================================================
      {
        path: '/login',
        name: 'Login',
        component: () => import('@views/auth/admin/login.vue'),
        meta: { loginType: 'user', requiresAuth: false, hideModeSwitcher: false },
        hidden: true,
      },
      {
        path: '/admin',
        name: 'AdminLogin',
        component: () => import('@views/auth/admin/AdminLogin.vue'),
        meta: { loginType: 'admin', requiresAuth: false, hideModeSwitcher: false },
        hidden: true,
      },
      {
        path: '/tester',
        name: 'TesterLogin',
        component: () => import('@/views/auth/tester/TesterLogin.vue'),
        meta: { loginType: 'tester', requiresAuth: false, hideModeSwitcher: false },
        hidden: true,
      },

      // ====================================================================
      // 🔑 ВОССТАНОВЛЕНИЕ ПАРОЛЯ (без ModeSwitcher)
      // ====================================================================
      {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/auth/ForgotPassword.vue'),
        meta: { requiresAuth: false, hideModeSwitcher: true, hideFooter: true },
        hidden: true,
      },
      {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/auth/ResetPassword.vue'),
        meta: { requiresAuth: false, hideModeSwitcher: true, hideFooter: true },
        hidden: true,
      },

      // ====================================================================
      // 📝 РЕГИСТРАЦИЯ (без ModeSwitcher)
      // ====================================================================
      {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue'),
        meta: { requiresAuth: false, hideModeSwitcher: true, hideFooter: true },
        hidden: true,
      },

      // ====================================================================
      // ✉️ ПОДТВЕРЖДЕНИЕ EMAIL (без ModeSwitcher)
      // ====================================================================
      {
        path: '/email-verify',
        name: 'EmailVerification',
        component: () => import('@/views/auth/EmailVerification.vue'),
        meta: { requiresAuth: false, hideModeSwitcher: true, hideFooter: true },
        hidden: true,
      },

      // ====================================================================
      // 🔀 OAUTH REDIRECT
      // ====================================================================
      {
        path: '/auth-redirect',
        name: 'AuthRedirect',
        component: () => import('@/views/auth/AuthRedirect.vue'),
        meta: { requiresAuth: false, hideModeSwitcher: true, hideFooter: true },
        hidden: true,
      },
    ]
  },

  {
    path: '/auth-redirect',
    component: () => import('@views/auth/AuthRedirect.vue'),
    hidden: true,
  },

  {
    path: '/404',
    name: 'Page404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true,
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true,
  },

  // 🔥 ГЛАВНАЯ — редирект на ОТНОСИТЕЛЬНЫЙ путь
  {
    path: '/',
    redirect: () => {
      try {
        const authStore = useAuthStore();

        if (authStore?.isAuthenticated) {
          const currentType = authStore.loginType || getLoginType();
          const safeType = VALID_LOGIN_TYPES.includes(currentType) ? currentType : getDefaultLoginType();
          // ✅ ОТНОСИТЕЛЬНЫЙ путь (без base)
          return '/dashboard';
        }

        // ✅ ОТНОСИТЕЛЬНЫЙ путь (без base)
        return '/login';

      } catch (e) {
        console.warn('[Router] Redirect error:', e?.message);
        return '/login';
      }
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
        component: () => import('@/views/users/SelfProfile.vue'),
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
        component: () => import('@/views/guide/guide.vue'),
        name: 'Guide',
        meta: { title: 'Guide', bootstrapIcon: 'bi bi-megaphone-fill', noCache: true },
      },
    ],
  },

  ...dynamicTableRoutes,
  ...smartLightRoutes,
  ...trainingRoutes,
  ...landingRoutes,
  contactManagementRoutes,
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
  history: createWebHistory(basePath),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 🔥 При прямом заходе по URL — синхронизируем тип из URL
  if (to.meta?.loginType && VALID_LOGIN_TYPES.includes(to.meta.loginType)) {
    // Только если пользователь НЕ авторизован
    if (!authStore.isAuthenticated) {
      authStore.setLoginType(to.meta.loginType, true)
    }
  }

  next()
})

export { basePath, initialType }

export function resetRouter() {
  const asyncRouterNameArr = asyncRoutes
      .map((mItem) => mItem?.name)
      .filter(Boolean);

  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}

export default router;
