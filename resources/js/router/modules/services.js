import Layout from '@/layout/Layout.vue'
import chatRoutes from '@/modules/TalkStream/Routes/talkStreamRoutes.ts'
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
        elSvgIcon: 'Service',
        permissions: ['view menu talkstream'],
    },
    children: [
        ...chatRoutes,
        ...videoRoutes
    ]
}

export default servicesRoutes
