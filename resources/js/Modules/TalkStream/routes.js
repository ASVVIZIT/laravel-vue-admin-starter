
export default [
    {
        path: '/talkstream/contacts',
        name: 'talkstream',
        component: () => import('@/modules/TalkStream/Views/Contacts.vue'),
        meta: {
            title: 'Контакты',
            bootstrapIcon: 'person-lines-fill',
            permissions: ['manage entity']
        }
    },
    {
        path: '/talkstream/chat',
        name: 'chat',
        component: () => import('@/modules/TalkStream/Views/Chat.vue'),
        meta: {
            title: 'Чат',
            bootstrapIcon: 'chat-dots',
            permissions: ['manage entity']
        }
    },
    {
        path: '/talkstream/call',
        name: 'call',
        component: () => import('@/modules/TalkStream/Views/Call.vue'),
        meta: {
            title: 'Звонок',
            bootstrapIcon: 'telephone',
            permissions: ['manage entity']
        }
    }
]
