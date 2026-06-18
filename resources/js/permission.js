import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isLogged, VALID_LOGIN_TYPES } from '@/utils/auth'
import { getSavedBasePath } from '@/utils/detectBasePath'
import getPageTitle from '@/utils/get-page-title'
import { userStore } from "@/store/userStore"
import { permissionStore } from "@/store/permissionStore"
import { useAuthStore } from '@/store/authStore'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/admin', '/tester', '/auth-redirect']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta?.title) || 'Fenix Portal'

  const authStore = useAuthStore()
  const user = userStore()
  const permission = permissionStore()

  const isUserLogged = isLogged()
  const loginType = authStore.loginType || 'user'

  if (to.meta?.loginType && VALID_LOGIN_TYPES.includes(to.meta.loginType) && !isUserLogged) {
    authStore.setLoginType(to.meta.loginType)
  }

  if (isUserLogged) {
    if (whiteList.includes(to.path)) {
      // ✅ ОТНОСИТЕЛЬНЫЙ путь
      next({ path: '/dashboard' })
      NProgress.done()
      return
    }

    try {
      const hasRoles = Array.isArray(user.roles) && user.roles.length > 0

      if (hasRoles) {
        if (to.meta?.role && !user.roles.includes(to.meta.role)) {
          next('/401')
          NProgress.done()
          return
        }
        next()
      } else {
        await user.fetchInfo()
        const accessRoutes = await permission.generateRoutes(user.roles, user.permissions)

        if (Array.isArray(accessRoutes)) {
          accessRoutes.forEach(route => {
            if (route && route.path) {
              router.addRoute(route)
            }
          })
        }

        next({ ...to, replace: true })
      }
    } catch (error) {
      console.error('[Permission] Auth check failed:', error)

      try {
        await user.reset()
      } catch (e) {
        console.warn('[Permission] User reset failed:', e?.message)
      }

      ElMessage.error(error?.message || 'Authentication error')

      // ✅ Используем window.location.href для смены base path
      const basePath = getSavedBasePath()
      window.location.href = basePath + 'login?redirect=' + encodeURIComponent(to.path)
      NProgress.done()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
      return
    }

    const routeRequiresAuth = Array.isArray(to.matched) &&
        to.matched.some(record => record?.meta?.requiresAuth === true)

    if (routeRequiresAuth) {
      // ✅ Используем window.location.href для смены base path
      const basePath = getSavedBasePath()
      window.location.href = basePath + 'login?redirect=' + encodeURIComponent(to.path)
      NProgress.done()
      return
    }

    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})
