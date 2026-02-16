// resources/js/permission.js
import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isLogged } from '@/utils/auth' // Проверяет наличие токена
import getPageTitle from '@/utils/get-page-title'
import { userStore } from "@/store/userStore"
import { permissionStore } from "@/store/permissionStore"
import { useAuthStore } from '@/store/authStore'

NProgress.configure({ showSpinner: false })

// Белый список теперь主要用于 входных страниц, а не для всех публичных маршрутов
const whiteList = [
  '/login',
  '/admin/login',
  '/tester/login',
  '/auth-redirect'
]

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)

  const authStore = useAuthStore()
  const user = userStore()
  const permission = permissionStore()

  const isUserLogged = isLogged()
  const loginType = authStore.loginType

  // Debug logging
  console.group(`[Permission] Navigation to: ${to.path}`)
  console.log('Full path:', to.fullPath)
  console.log('Hash:', to.hash)
  console.log('Query:', to.query)
  console.log('Login type:', loginType)
  console.log('Authenticated:', isUserLogged)
  console.groupEnd()

  // Handle admin login with hash navigation
  if (to.path === '/' && to.hash.startsWith('#/dashboard') && to.fullPath.includes('/admin/login')) {
    console.log('[Permission] Handling admin login hash navigation')
    authStore.setLoginType('admin')
    next({ path: '/admin/dashboard', replace: true })
    return
  }

  if (isUserLogged) {
    // Redirect to home if already logged in
    if (to.path === '/login' || to.path === '/admin/login' || to.path === '/tester/login') {
      let redirectPath = '/dashboard'
      if (loginType === 'admin') redirectPath = '/admin/dashboard'
      if (loginType === 'tester') redirectPath = '/tester/dashboard'

      console.log(`[Permission] Already logged in, redirecting to: ${redirectPath}`)
      next({ path: redirectPath })
      NProgress.done()
    } else {
      try {
        // Check if user roles are loaded
        const hasRoles = user.roles && user.roles.length > 0
        if (hasRoles) {
          next()
        } else {
          // Fetch user info and generate routes
          await user.fetchInfo()
          const accessRoutes = await permission.generateRoutes(user.roles, user.permissions)
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })
          next({ ...to, replace: true })
        }
      } catch (error) {
        console.error('[Permission] Auth check failed:', error)
        await user.reset()
        ElMessage.error(error.message || 'Authentication error')

        // Redirect to correct login page
        const loginPath = loginType === 'admin'
            ? '/admin/login'
            : loginType === 'tester'
                ? '/tester/login'
                : '/login'

        next(`${loginPath}?redirect=${to.path}`)
        NProgress.done()
      }
    }
  } else {
    // --- ИЗМЕНЁННАЯ ЛОГИКА ---
    // Проверяем, требует ли маршрут ЯВНО аутентификации
    // Это означает, что если у любого маршрута в цепочке (сам или родитель) meta.requiresAuth === true,
    // то пользователь должен быть аутентифицирован.
    const routeRequiresAuth = to.matched.some(record => record.meta.requiresAuth === true);

    // Если маршрут требует аутентификации, но пользователь не аутентифицирован
    if (routeRequiresAuth) {
      // Проверяем, является ли маршрут страницей входа (во избежание цикла)
      const isLoginRoute = whiteList.includes(to.path);

      if (isLoginRoute) {
        // Если пользователь на странице входа, но маршрут требует аутентификации, перенаправить на главную или другую страницу по умолчанию
        console.log('[Permission] User on login page but route requires auth, redirecting away.');
        next('/'); // или другая страница, например, next('/dashboard') если это разрешено неавторизованным
        NProgress.done();
        return;
      }

      // Редирект на страницу входа
      let loginPath = '/login'
      if (to.meta.loginType === 'admin') loginPath = '/admin/login'
      if (to.meta.loginType === 'tester') loginPath = '/tester/login'

      console.log(`[Permission] Route requires auth, redirecting to login: ${loginPath}`)
      next(`${loginPath}?redirect=${to.path}`)
      NProgress.done()
      return; // ВАЖНО: используем return, чтобы прервать выполнение
    }

    // Если маршрут НЕ требует аутентификации (requiresAuth !== true), пускаем
    // Это включает маршруты с requiresAuth: false, requiresAuth: undefined, и любые другие значения, кроме true
    console.log(`[Permission] Route does not require explicit auth, proceeding.`);

    // Устанавливаем тип логина для страниц входа (если применимо)
    // Это нужно только если мы действительно переходим на страницу входа
    if (whiteList.includes(to.path)) {
      if (to.path === '/admin/login' || to.fullPath.includes('/admin/login')) {
        authStore.setLoginType('admin')
        console.log('[Permission] Setting login type to admin')
      }
      else if (to.path === '/tester/login') {
        authStore.setLoginType('tester')
        console.log('[Permission] Setting login type to tester')
      }
      else {
        authStore.setLoginType('user')
        console.log('[Permission] Setting login type to user')
      }
    }
    next(); // Пропускаем маршрут, который не требует аутентификации
  }
})

router.afterEach(() => {
  NProgress.done()
})
