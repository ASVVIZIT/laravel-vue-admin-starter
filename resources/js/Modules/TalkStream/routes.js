
export default [
    {
        path: '/talkstream',
        name: 'talkstream',
        component: () => import('@/modules/TalkStream/Talks/TalkStream.vue'),
        meta: {
            title: 'Общий Чат',
            bootstrapIcon: 'chat-dots',
            permissions: ['manage entity']
        }
    },
/*    {
        path: '/talkstream/chat',
        name: 'chat',
        component: () => import('@/modules/TalkStream/Talks/Chat.vue'),
        meta: {
            title: 'Чат',
            bootstrapIcon: 'chat-dots',
            permissions: ['manage entity']
        }
    },
    {
        path: '/talkstream/call',
        name: 'call',
        component: () => import('@/modules/TalkStream/Talks/Call.vue'),
        meta: {
            title: 'Звонок',
            bootstrapIcon: 'telephone',
            permissions: ['manage entity']
        }
    }*/
]
