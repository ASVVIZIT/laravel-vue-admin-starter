/**
 * ============================================================================
 * ПОДТВЕРЖДЕНИЕ EMAIL (публичные роуты без авторизации)
 * ============================================================================
 * Роуты для перехода по ссылкам из писем подтверждения email.
 * Без Layout — отдельная полноэкранная страница.
 * ============================================================================
 */

const emailConfirmationRoutes = [
    {
        path: '/confirm-email/:type/:token',
        name: 'ConfirmEmail',
        component: () => import('@/views/auth/ConfirmEmailView.vue'),
        meta: {
            title: 'Подтверждение email',
            requiresAuth: false,
            hideModeSwitcher: true,
            hideFooter: true,
        },
        hidden: true,
    },
]

export default emailConfirmationRoutes
