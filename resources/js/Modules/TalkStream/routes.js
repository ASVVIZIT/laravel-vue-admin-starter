import Contacts from '@/modules/TalkStream/Views/Contacts.vue'
import Chat from '@/modules/TalkStream/Views/Chat.vue'
import Call from '@/modules/TalkStream/Views/Call.vue'

const chatRoutes = [
    {
        path: '/talkstream/:mode(chat|call)',
        name: 'talkstream',
        component: Contacts,
        meta: {
            title: 'TalkStream',
            bootstrapIcon: 'person-lines-fill',
            permissions: ['manage entity']
        },
        children: [
            { path: '', redirect: 'contacts' },
            {
                path: 'contacts',
                name: 'contacts.list',
                component: Contacts,
                meta: {
                    title: 'Список контактов',
                    bootstrapIcon: 'list',
                    permissions: ['manage entity']
                }
            },
            {
                path: 'chat',
                name: 'chat',
                component: Chat,
                meta: {
                    title: 'Чат',
                    bootstrapIcon: 'chat-dots',
                    permissions: ['manage entity']
                }
            },
            {
                path: 'call',
                name: 'call',
                component: Call,
                meta: {
                    title: 'Звонок',
                    bootstrapIcon: 'telephone',
                    permissions: ['manage entity']
                }
            }
        ]
    }
]

export default chatRoutes
