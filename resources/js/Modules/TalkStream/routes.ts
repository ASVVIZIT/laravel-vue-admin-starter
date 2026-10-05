import type { RouteRecordRaw } from 'vue-router'

const talkStreamRoutes: RouteRecordRaw[] = [
    {
        path: 'talkstream',
        name: 'TalkStream',
        // ✅ Абсолютный путь к компоненту
        component: () => import('@/modules/TalkStream/Talks/TalkStream.vue'),
        meta: {
            title: 'Общий Чат',
            description: 'Real-time messaging & presence',
            bootstrapIcon: 'chat-dots',
            permissions: ['view menu talkstream'],
            breadcrumb: true,
        }
    }
]

export default talkStreamRoutes
