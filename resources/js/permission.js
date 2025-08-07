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
    // Unauthorized users
    if (whiteList.includes(to.path)) {
      // Set login type for login pages
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

      next()
    } else {
      // Determine correct login page type
      let loginPath = '/login'
      if (to.meta.loginType === 'admin') loginPath = '/admin/login'
      if (to.meta.loginType === 'tester') loginPath = '/tester/login'

      console.log(`[Permission] Unauthorized, redirecting to login: ${loginPath}`)
      next(`${loginPath}?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
