/**
 * ============================================================================
 * ПЕРВИЧНАЯ ВЕРИФИКАЦИЯ EMAIL (standalone, без Layout)
 * Маршрут: /email-verify/:id/:hash
 * Вызывает AuthController::verify (GET)
 * ============================================================================
 */
const emailVerificationRoutes = [
    {
        path: '/email-verify/:id/:hash',
        name: 'EmailVerify',
        component: () => import('@/views/auth/EmailVerifyView.vue'),
        meta: {
            title: 'Подтверждение email',
            requiresAuth: false,
            hideModeSwitcher: true,
            hideFooter: true,
        },
        hidden: true,
    },
]

export default emailVerificationRoutes
