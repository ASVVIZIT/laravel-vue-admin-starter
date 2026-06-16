export default [
    {
        path: '/landing',
        name: 'Landing',
        alwaysShow: true,
        showInMenu: true,
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'Landing Builder',
            description: 'Управление лендингами и страницами ожидания',
            bootstrapIcon: 'bi bi-brush',
            permissions: ['view menu landing'],
        },
        children: [
            {
                path: 'pages',
                name: 'LandingList',
                component: () => import('@/views/Landing/LandingListView.vue'),
                meta: {
                    title: 'Список лендингов',
                    bootstrapIcon: 'bi bi-file-earmark-text',
                    permissions: ['view landing'],
                },
            },
            {
                path: 'pages/create',
                name: 'LandingCreate',
                component: () => import('@/views/Landing/LandingEditorView.vue'),
                meta: {
                    title: 'Создать лендинг',
                    permissions: ['manage landing'],
                },
                hidden: true,
            },
            {
                path: 'pages/:id/edit',
                name: 'LandingEdit',
                component: () => import('@/views/Landing/LandingEditorView.vue'),
                meta: {
                    title: 'Редактировать лендинг',
                    permissions: ['manage landing'],
                },
                hidden: true,
            },
            {
                path: 'pages/:id/preview',
                name: 'LandingPreview',
                component: () => import('@/views/Landing/LandingPreviewView.vue'),
                meta: {
                    title: 'Превью лендинга',
                    permissions: ['view landing'],
                },
                hidden: true,
            },
            {
                path: 'settings',
                name: 'SiteModeSettings',
                component: () => import('@/views/Landing/SiteModeSwitcher.vue'),
                meta: {
                    title: 'Режим сайта',
                    bootstrapIcon: 'bi bi-gear',
                    permissions: ['manage landing'],
                },
            }
        ]
    }
]
