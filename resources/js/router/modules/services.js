import Layout from '@/layout/Layout.vue'
import chatRoutes from '@/modules/TalkStream/Routes.js'
import videoRoutes from '@/modules/Video/Routes.js'

const servicesRoutes = {
    path: '/services',
    component: Layout,
    redirect: '/services/talkstream',
    name: 'Services',
    alwaysShow: true,
    meta: {
        title: 'Services',
        description: 'Services description',
        bootstrapIcon: 'person',
        permissions: ['view menu entity'],
    },
    children: [
        ...chatRoutes,
        ...videoRoutes
    ]
}

export default servicesRoutes
