/**
 * Список реализованных фич проекта
 * Используется в FeaturesSection.vue
 */
export const featuresList = [
    {
        icon: '🔐',
        title: 'Авторизация',
        description: '3 типа входа: User, Admin, Tester. Sanctum токены, CSRF защита.',
        status: 'done',
        statusText: '✅ Работает'
    },
    {
        icon: '🏋️',
        title: 'Модуль Training',
        description: 'Журнал тренировок, упражнения, статистика, экспорт CSV.',
        status: 'done',
        statusText: '✅ Работает'
    },
    {
        icon: '💡',
        title: 'SmartLight',
        description: 'Управление устройствами, телеметрия, команды V0/V1.',
        status: 'done',
        statusText: '✅ Работает'
    },
    {
        icon: '💬',
        title: 'TalkStream',
        description: 'Чат, звонки, друзья. WebSocket через Reverb.',
        status: 'progress',
        statusText: '🔧 В процессе'
    },
    {
        icon: '🏢',
        title: 'Companies',
        description: 'Управление компаниями и каналами связи.',
        status: 'done',
        statusText: '✅ Работает'
    },
    {
        icon: '🌐',
        title: 'Публичная часть',
        description: 'Новый entry point, разделение с админкой.',
        status: 'progress',
        statusText: '🔧 В процессе'
    }
]
