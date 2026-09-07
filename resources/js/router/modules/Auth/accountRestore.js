/**
 * ============================================================================
 * ВОССТАНОВЛЕНИЕ УДАЛЁННОГО АККАУНТА (standalone, без Layout)
 * Маршрут: /auth/restore/:id/:hash
 * Вызывает AuthController::restoreAccount (GET)
 * ============================================================================
 */
const accountRestoreRoutes = [
    {
        path: '/auth/restore/:id/:hash',
        name: 'AccountRestore',
        component: () => import('@/views/auth/AccountRestoreView.vue'),
        meta: {
            title: 'Восстановление аккаунта',
            requiresAuth: false,
            hideModeSwitcher: true,
            hideFooter: true,
        },
        hidden: true,
    },
]

export default accountRestoreRoutes
