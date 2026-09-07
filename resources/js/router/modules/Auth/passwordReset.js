/**
 * ============================================================================
 * СБРОС ПАРОЛЯ ПО ТОКЕНУ ИЗ ПИСЬМА (standalone, без Layout)
 * Маршрут: /reset-password/:token
 * Форма ввода нового пароля + POST /auth/reset-password
 * ============================================================================
 */
const passwordResetRoutes = [
    {
        path: '/reset-password/:token',
        name: 'PasswordResetByToken',
        component: () => import('@/views/auth/PasswordResetView.vue'),
        meta: {
            title: 'Сброс пароля',
            requiresAuth: false,
            hideModeSwitcher: true,
            hideFooter: true,
        },
        hidden: true,
    },
]

export default passwordResetRoutes
