import Layout from '@/layout/Layout.vue';

export default [
    {
        path: '/i18n-checker',
        component: Layout,
        redirect: '/i18n-checker/index',
        children: [
            {
                path: 'index',
                component: () => import('@/views/i18n-checker/I18nChecker.vue'),
                name: 'I18nChecker',
                meta: {
                    title: 'I18n Checker',
                    bootstrapIcon: 'translate',
                    requiresAuth: true,
                    roles: ['admin']
                }
            }
        ]
    }
];
