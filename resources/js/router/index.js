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
import trainingRoutes from './modules/Training/training.js';
import landingRoutes from './modules/Landing/landingRouter.js';
import contactManagementRoutes from './modules/ContactManagement/contact-management.js';

// ============================================================================
// 📌 CONSTANT ROUTES (публичные + базовые)
// ============================================================================
export const constantRoutes = [
  // ========================================================================
  // 🔐 СТРАНИЦЫ ВХОДА (разные для разных типов пользователей)
  // ========================================================================

  // 👤 Обычный пользователь
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import('@views/auth/admin/login.vue'),
    meta: {
      loginType: 'user',
      title: 'User Login',
      requiresAuth: false  // ← Явно указываем что НЕ требует авторизации
    },
    hidden: true,
  },

  // 🔀 OAuth редирект
  {
    path: '/auth-redirect',
    name: 'AuthRedirect',
    component: () => import('@views/auth/admin/AuthRedirect.vue'),
    hidden: true,
  },

  // 👨‍💼 Администратор — своя логика, своя валидация
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@views/auth/admin/AdminLogin.vue'),
    meta: {
      loginType: 'admin',
      title: 'Admin Login',
      requiresAuth: false  // ← Явно указываем что НЕ требует авторизации
    },
    hidden: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      authStore.setLoginType('admin')
      console.log('[Router] Admin login - setting loginType to admin')

      // Обработка hash-навигации
      if (to.hash) {
        const pathFromHash = to.hash.replace('#', '')
        next(pathFromHash)
      } else {
        next()
      }
    }
  },

  // 🧪 Тестер — отдельная система (2-факторка, ограничения и т.д.)
  {
    path: '/tester/login',
    name: 'TesterLogin',
    component: () => import('@/views/auth/tester/TesterLogin.vue'),
    meta: {
      loginType: 'tester',
      title: 'Tester Login',
      requiresAuth: false  // ← Явно указываем что НЕ требует авторизации
    },
    hidden: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      authStore.setLoginType('tester')
      console.log('[Router] Tester login - setting loginType to tester')
      next()
    }
  },

  // ========================================================================
  // ❌ СТРАНИЦЫ ОШИБОК
  // ========================================================================
  {
    path: '/404',
    name: 'Page404',
    component: () => import('@/views/error-page/404.vue'),
    meta: { title: '404', requiresAuth: false },
    hidden: true,
  },
  {
    path: '/401',
    name: 'Page401',
    component: () => import('@/views/error-page/401.vue'),
    meta: { title: '401', requiresAuth: false },
    hidden: true,
  },

  // ========================================================================
  // 🏠 ГЛАВНАЯ СТРАНИЦА (редирект по типу пользователя)
  // ========================================================================
  {
    path: '/',
    name: 'Home',
    redirect: (to) => {
      const authStore = useAuthStore();
      const loginType = authStore.loginType || getLoginType() || 'user'
      console.log(`[Router] Home redirect for loginType: ${loginType}`)

      // Редирект на соответствующий dashboard
      if (loginType === 'admin') return '/admin/dashboard';
      if (loginType === 'tester') return '/tester/dashboard';
      return '/dashboard';  // Обычный пользователь
    },
    hidden: true,
    // ❌ УБРАЛИ requiresAuth: true — это вызывало проблемы!
    // Проверка авторизации происходит в permission.js
  },

  // ========================================================================
  // 📊 DASHBOARD (основной, для обычных пользователей)
  // ========================================================================
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
          requiresAuth: true  // ← Требует авторизации
        }
      }
    ]
  },

  // ========================================================================
  // 👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
  // ========================================================================
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/edit',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'edit',
        component: () => import('@/views/users/SelfProfile.vue'),
        name: 'SelfProfile',
        meta: {
          title: 'UserProfile',
          bootstrapIcon: 'person-circle',
          noCache: true,
          requiresAuth: true
        },
      },
    ],
  },

  // ========================================================================
  // 📖 GUIDE (руководство)
  // ========================================================================
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/guide.vue'),
        name: 'Guide',
        meta: {
          title: 'Guide',
          bootstrapIcon: 'bi bi-megaphone-fill',
          noCache: true
        },
      },
    ],
  },

  // ========================================================================
  // 📦 МОДУЛИ (публичные для всех авторизованных)
  // ========================================================================
  ...dynamicTableRoutes,
  ...smartLightRoutes,
  ...trainingRoutes,
  ...landingRoutes,
  contactManagementRoutes,
];

// ============================================================================
// 📌 ASYNC ROUTES (загружаются динамически по ролям)
// ============================================================================
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

// ============================================================================
// 🚀 СОЗДАНИЕ РОУТЕРА
// ============================================================================
const router = createRouter({
  history: createWebHashHistory(),  // ✅ БЕЗ '/admin/' base path
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior: () => ({ top: 0 }),
});

// ============================================================================
// 🔄 СБРОС РОУТЕРА (для динамических маршрутов)
// ============================================================================
export function resetRouter() {
  const asyncRouterNameArr = asyncRoutes.map((mItem) => mItem.name).filter(Boolean);
  asyncRouterNameArr.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
}

export default router;
