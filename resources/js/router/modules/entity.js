/** When your routing table is too long, you can split it into small modules**/
import Layout from '@/layout/Layout.vue'

const entityRoutes = {
    path: '/entity',
    component: Layout,
    redirect: '/entity/brands',
    name: 'entity',
    alwaysShow: true,
    meta: {
        title: 'Справочники и компоненты',
        description: 'Справочники и компоненты (Управление сущностями)',
        bootstrapIcon: 'diagram-3',
        permissions: ['view menu entity'],
    },
    children: [
        {
            path: '/brands',
            component: () => import('@/views/Entities/BrandsView/BrandsView.vue'),
            name: 'brands',
            meta: {title: 'Бренды', bootstrapIcon: 'award', permissions: ['manage entity']},
        },
        {
            path: '/deviceType',
            component: () => import('@/views/Entities/DeviceTypeView/DeviceTypeView.vue'),
            name: 'DeviceType',
            meta: {title: 'Типы устройства', bootstrapIcon: 'cpu', permissions: ['manage entity']},
        },
        {
            path: '/measurementUnit',
            component: () => import('@/views/Entities/MeasurementUnit/MeasurementUnit.vue'),
            name: 'MeasurementUnit',
            meta: {title: 'Единицы измерений', bootstrapIcon: 'speedometer2', permissions: ['manage entity']},
        },

        {
            path: '/accessories',
            redirect: '/accessories/list',
            name: 'Accessories',
            meta: {
                title: 'Аксессуар Электрики',
                bootstrapIcon: 'tools',
                permissions: ['manage entity'],
                requiresAuth: true
            },
            children: [
                {
                    path: '/accessories/list',
                    name: 'AccessoriesList',
                    component: () => import('@/views/Entities/AccessoriesView/AccessoriesView.vue'),
                    meta: {
                        title: 'Список аксессуаров',
                        bootstrapIcon: 'card-list',
                        permissions: ['manage entity'],
                        requiresAuth: true
                    }
                },
                {
                    path: '/accessories/create',
                    name: 'AccessoryCreate',
                    component: () => import('@/views/entities/AccessoriesView/AccessoryForm.vue'),
                    meta: {
                        title: 'Создание Аксессуара Электрики',
                        bootstrapIcon: 'card-text',
                        permissions: ['manage entity'],
                        requiresAuth: true
                    }
                },
                {
                    hidden: true,
                    path: '/accessories/edit/:id',
                    name: 'AccessoryEdit',
                    component: () => import('@/views/entities/AccessoriesView/AccessoryForm.vue'),
                    meta: {
                        title: 'Редактирование Аксессуара Электрики',
                        bootstrapIcon: 'unit',
                        permissions: ['manage entity']
                    }
                }
            ]

        },

    ],
}

export default entityRoutes
