/**
 * ============================================================================
 * SMART LIGHT ROUTES — МАРШРУТЫ МОДУЛЯ
 * ============================================================================
 */

export default [
    {
        path: '/smart-light',
        name: 'SmartLight',
        alwaysShow: true,
        showInMenu: true,
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'Умное освещение SmartLight',
            elSvgIcon: 'Lightning',
            permissions: ['view_smart_light'],
        },
        children: [
            {
                path: 'dashboard',
                name: 'SmartLightDashboard',
                component: () => import('@/views/SmartLight/Dashboard.vue'),
                meta: {
                    title: 'Управление освещением',
                    elSvgIcon: 'ReadingLamp',
                    permissions: ['view_smart_light'],
                    noCache: true
                }
            },
            {
                path: 'global-settings',
                name: 'SmartLightGlobalSettings',
                component: () => import('@/views/SmartLight/GlobalSettingsView.vue'),
                meta: {
                    title: 'Глобальные настройки',
                    elSvgIcon: 'SetUp',
                    affix: false,
                    permissions: ['manage_smart_light'],
                    noCache: true
                }
            },
            {
                path: 'settings',
                name: 'SmartLightSettings',
                component: () => import('@components/SmartLight/components/layout/panels/GlobalSettingsPanel.vue'),
                meta: {
                    title: 'Настройки SmartLight',
                    elSvgIcon: 'SetUp',
                    permissions: ['manage_smart_light'],
                    noCache: true
                }
            },
            {
                path: 'device/:id/settings',
                name: 'SmartLightDeviceSettings',
                component: () => import('@components/SmartLight/components/settings/modals/DeviceSettingsModal.vue'),
                meta: {
                    title: 'Настройки устройства',
                    elSvgIcon: 'SetUp',
                    permissions: ['manage_own_smart_light']
                },
                hidden: true,
                props: true
            }
        ]
    }
];
