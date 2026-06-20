import Layout from '@/layout/Layout.vue';

export default [
    {
        path: '/i18n-checker-view',
        component: Layout,
        redirect: '/i18n-checker-view/main',
        children: [
            {
                path: 'main',
                component: () => import('@/views/i18n-checker/I18nCheckerView.vue'),
                name: 'I18nCheckerView',
                meta: {
                    title: 'i18nChecker',
                    bootstrapIcon: 'translate',
                    requiresAuth: true,
                    roles: ['admin']
                }
            }
        ]
    }
];
