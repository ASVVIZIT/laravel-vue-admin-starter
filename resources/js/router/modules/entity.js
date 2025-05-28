/** When your routing table is too long, you can split it into small modules**/
import Layout from '@/layout/Layout.vue'

const entityRoutes = {
    path: '/entity',
    component: Layout,
    redirect: '/entity/brands',
    name: 'entity',
    alwaysShow: true,
    meta: {
        title: 'entity',
        description: 'Управление сущностями',
        bootstrapIcon: 'person-workspace',
        permissions: ['view menu entity'],
    },
    children: [
        {
            path: 'brands',
            component: () => import('@/views/Entities/BrandsView/BrandsView.vue'),
            name: 'brandsEntity',
            meta: {title: 'brandsEntity', bootstrapIcon: 'entity', permissions: ['manage user']},
        },
    ],
}

export default entityRoutes
