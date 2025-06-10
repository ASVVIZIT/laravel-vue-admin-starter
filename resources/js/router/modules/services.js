//resources/js/views/Services/GlobalChat/GlobalChat.vue


/** When your routing table is too long, you can split it into small modules**/
import Layout from '@/layout/Layout.vue'

const servicesRoutes = {
    path: '/services',
    component: Layout,
    redirect: '/services/globalchat',
    name: 'Services',
    alwaysShow: true,
    meta: {
        title: 'Services',
        description: 'Services description',
        bootstrapIcon: 'person',
        permissions: ['view menu entity'],
    },
    children: [
        {
            path: '/services/globalchat',
            component: () => import('@/views/Services/GlobalChat/GlobalChat.vue'),
            name: 'GlobalChat',
            meta: {title: 'GlobalChat', bootstrapIcon: 'chat', permissions: ['manage entity']},
        },
/*        {
            path: '/accessories',
            redirect: '/accessories/list',
            name: 'Accessories',
            meta: {
                title: 'Accessories',
                bootstrapIcon: 'tools',
                permissions: ['manage entity'],
                requiresAuth: true
            },
        },*/
    ],
}

export default servicesRoutes
