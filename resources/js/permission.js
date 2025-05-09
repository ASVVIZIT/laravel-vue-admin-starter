import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar / индикатор загрузки
import 'nprogress/nprogress.css' // progress bar style / стили индикатора
import { isLogged } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'
import { useUserStore } from "@/store/user" // Pinia store import / импорт хранилища Pinia
import { usePermissionStore } from "@/store/permission" // Pinia store import / импорт хранилища Pinia

NProgress.configure({ showSpinner: false }) // NProgress Configuration / Настройка NProgress

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist / белый список маршрутов

router.beforeEach(async (to, from, next) => {
    // start progress bar / запуск индикатора загрузки
    NProgress.start()
    // set page title / установка заголовка страницы
    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in / проверка авторизации пользователя
    const isUserLogged = isLogged()
    // Get Pinia store instances / Получаем экземпляры хранилищ Pinia
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    if (isUserLogged) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page / если авторизован, перенаправляем на главную
            next({ path: '/' })
            NProgress.done()
        } else {
            // determine whether the user has obtained his permission roles / проверка наличия ролей
            // Modern optional chaining check / Современная проверка с optional chaining
            const hasRoles = userStore.roles?.length > 0

            if (hasRoles) {
                next()
            } else {
                try {
                    // get user info / получаем информацию о пользователе
                    // Using Pinia store method / Используем метод хранилища Pinia
                    await userStore.getInfo()

                    // generate accessible routes map / генерируем доступные маршруты
                    // Using roles and permissions from store / Используем данные из хранилища
                    const accessRoutes = await permissionStore.generateRoutes(
                        userStore.roles,
                        userStore.permissions
                    )

                    // add dynamic routes / добавляем динамические маршруты
                    // Vue Router 4 syntax / Синтаксис Vue Router 4
                    accessRoutes.forEach(route => {
                        router.addRoute(route)
                    })

                    // retry navigation with new routes / повторяем навигацию
                    next({ ...to, replace: true })
                } catch (error) {
                    // remove token and redirect / удаляем токен и перенаправляем
                    await userStore.resetToken()
                    ElMessage.error(error.message || 'Has Error / Произошла ошибка')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    } else {
        /* has no token / не авторизован */

        // Improved white list check / Улучшенная проверка белого списка
        const isRouteInWhiteList = whiteList.some(path =>
            to.path.startsWith(path)
        )

        if (isRouteInWhiteList) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar / завершение индикатора загрузки
    NProgress.done()
})

/*
Основные изменения (Key changes):
1. Переход на Pinia stores вместо Vuex
2. Использование Composition API подходов
3. Оптимизированная проверка белого списка
4. Современный синтаксис (optional chaining)
5. Явное разделение ответственности хранилищ

Рекомендации (Recommendations):
- Добавить TypeScript типы
- Реализовать cancel token для запросов
- Вынести конфигурацию роутера в отдельный файл
- Добавить обработку 404 ошибок
*/
