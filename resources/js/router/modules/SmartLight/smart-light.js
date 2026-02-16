export default [
    {
        path: '/smart-light',
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'SmartLight',
            icon: 'Opportunity', // lightning
            permission: 'view_smart_light'
        },
        children: [
            {
                path: 'dashboard',
                name: 'SmartLightDashboard',
                component: () => import('@/views/SmartLight/Dashboard.vue'),
                meta: {
                    title: 'Управление освещением',
                    noCache: true,
                    permission: 'view_smart_light'
                }
            },
            {
                path: 'settings',
                name: 'SmartLightSettings',
                component: () => import('@/views/SmartLight/GlobalSettingsPanel.vue'),
                meta: {
                    title: 'Настройки SmartLight',
                    noCache: true,
                    permission: 'manage_smart_light'
                }
            },
            {
                path: 'device/:id/settings',
                name: 'SmartLightDeviceSettings',
                component: () => import('@/views/SmartLight/DeviceSettings.vue'),
                meta: {
                    title: 'Настройки устройства',
                    noCache: true,
                    permission: 'manage_own_smart_light'
                },
                hidden: true,
                props: true
            }
        ]
    }
];
