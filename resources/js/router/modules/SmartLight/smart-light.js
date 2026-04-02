// resources/js/router/modules/SmartLight/smart-light.js
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
                path: 'dashboard', // Вероятно, здесь должна быть часть пути, например 'dashboard'
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
                component: () => import('@components/SmartLight/components/settings/GlobalSettingsPanel.vue'),
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
                component: () => import('@components/SmartLight/components/settings/DeviceSettings.vue'),
                meta: { // Добавляем пустой объект meta или с нужными свойствами
                    title: 'Настройки устройства', // Если нужно отображать в меню (хотя hidden=true)
                    permissions: ['manage_own_smart_light'] // Если нужно для проверки
                },
                hidden: true,
                props: true
            }
        ]
    }
];
