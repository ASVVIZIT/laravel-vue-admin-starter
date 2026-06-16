/**
 * Дефолтные настройки блоков
 */
export const blockDefaults = {
    hero: {
        logoIcon: '🔥',
        logoText: 'FENIX',
        title: 'FenixPortal',
        subtitle: 'Публичная часть сайта',
        stageBadge: 'Стадия 1 из 3',
        stageBadgeEnabled: true,
        textAlign: 'center'
    },
    countdown: {
        targetDate: '2026-11-25T23:59:59',
        title: 'До запуска осталось',
        subtitle: 'Мы готовим что-то невероятное',
        showProgressBar: true
    },
    progress: {
        title: 'Прогресс разработки',
        showPercentage: true,
        stages: [
            { name: 'Архитектура', active: true, completed: false },
            { name: 'Функционал', active: false, completed: false },
            { name: 'Релиз', active: false, completed: false }
        ]
    },
    techstack: {
        title: 'Технологический стек',
        showCount: true,
        categories: []
    },
    features: {
        title: 'Что уже работает',
        columns: 3,
        items: []
    },
    footer: {
        text: 'Разработано с ❤️ на Laravel + Vue 3',
        copyright: '© 2026 FenixPortal',
        showSocialLinks: false,
        socialLinks: []
    }
}

export function getBlockDefaults(type) {
    return blockDefaults[type] || {}
}
