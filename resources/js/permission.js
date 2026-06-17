import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isLogged } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'
import { userStore } from "@/store/userStore"
import { permissionStore } from "@/store/permissionStore"
import { useAuthStore } from '@/store/authStore'

NProgress.configure({ showSpinner: false })

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

  // ✅ Устанавливаем loginType из meta (если есть)
  if (to.meta.loginType) {
    authStore.setLoginType(to.meta.loginType)
  }

  if (isUserLogged) {
    // Если на странице логина — редирект на dashboard
    if (whiteList.includes(to.path)) {
      let redirectPath = '/dashboard'
      if (loginType === 'admin') redirectPath = '/admin/dashboard'
      if (loginType === 'tester') redirectPath = '/tester/dashboard'

      next({ path: redirectPath })
      NProgress.done()
    } else {
      // Загружаем пользователя
      try {
        const hasRoles = user.roles && user.roles.length > 0
        if (hasRoles) {
          // Проверка ролей
          if (to.meta.role && !user.roles.includes(to.meta.role)) {
            next('/401')
            NProgress.done()
            return
          }
          next()
        } else {
          await user.fetchInfo()
          const accessRoutes = await permission.generateRoutes(user.roles, user.permissions)
          accessRoutes.forEach(route => router.addRoute(route))
          next({ ...to, replace: true })
        }
      } catch (error) {
        console.error('[Permission] Auth check failed:', error)
        await user.reset()
        ElMessage.error(error.message || 'Authentication error')

        // ✅ Редирект на ПРАВИЛЬНУЮ страницу логина
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
    // НЕ авторизован

    // Если на странице логина — пропускаем
    if (whiteList.includes(to.path)) {
      // ✅ Устанавливаем loginType из пути
      if (to.path === '/admin/login' || to.fullPath.includes('/admin/login')) {
        authStore.setLoginType('admin')
      } else if (to.path === '/tester/login') {
        authStore.setLoginType('tester')
      } else {
        authStore.setLoginType('user')
      }
      next()
      return
    }

    // Если маршрут требует авторизации — редирект на логин
    const routeRequiresAuth = to.matched.some(record => record.meta.requiresAuth === true)

    if (routeRequiresAuth) {
      // ✅ Редирект на ПРАВИЛЬНУЮ страницу логина
      let loginPath = '/login'
      if (loginType === 'admin') loginPath = '/admin/login'
      if (loginType === 'tester') loginPath = '/tester/login'

      next(`${loginPath}?redirect=${to.path}`)
      NProgress.done()
      return
    }

    // Маршрут не требует авторизации — пропускаем
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})
