/**
 * Моковые данные лендинга
 */
export const mockLanding = {
    id: 1,
    slug: 'public-home',
    title: 'FenixPortal',
    is_published: true,
    settings: {
        theme: {
            primaryColor: '#ff6b35',
            secondaryColor: '#f7931e',
            accentColor: '#ff4757',
            backgroundColor: '#0a0e27',
            textColor: '#ffffff'
        },
        countdown: {
            targetDate: '2026-11-25T23:59:59',
            title: 'До запуска осталось'
        }
    },
    blocks: [
        {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            settings: {
                logoIcon: '🔥',
                logoText: 'FENIX',
                title: 'FenixPortal',
                subtitle: 'Публичная часть сайта находится в активной разработке',
                stageBadge: 'Стадия 1 из 3 — Архитектура',
                stageBadgeEnabled: true,
                textAlign: 'center'
            }
        },
        {
            id: 'countdown-1',
            type: 'countdown',
            enabled: true,
            order: 2,
            settings: {
                targetDate: '2026-11-25T23:59:59',
                title: 'До запуска осталось',
                subtitle: 'Мы готовим что-то невероятное',
                showProgressBar: true
            }
        },
        {
            id: 'progress-1',
            type: 'progress',
            enabled: true,
            order: 3,
            settings: {
                title: 'Прогресс разработки',
                showPercentage: true,
                stages: [
                    { name: 'Архитектура', active: true, completed: false },
                    { name: 'Функционал', active: false, completed: false },
                    { name: 'Релиз', active: false, completed: false }
                ]
            }
        },
        {
            id: 'techstack-1',
            type: 'techstack',
            enabled: true,
            order: 4,
            settings: {
                title: 'Технологический стек',
                showCount: true,
                categories: [
                    {
                        title: 'Backend',
                        icon: '⚙️',
                        color: '#ff6b35',
                        items: [
                            { name: 'Laravel', version: '10.48', icon: '🎯', note: 'Framework' },
                            { name: 'PHP', version: '8.2+', icon: '🐘', note: 'Runtime' },
                            { name: 'MySQL', version: '8.0', icon: '🗄️', note: 'Database' },
                            { name: 'Redis', version: '7.x', icon: '🔴', note: 'Cache' },
                            { name: 'Sanctum', version: '3.3', icon: '🔐', note: 'Auth' },
                            { name: 'Reverb', version: '1.5', icon: '📡', note: 'WebSockets' }
                        ]
                    },
                    {
                        title: 'Frontend',
                        icon: '',
                        color: '#409eff',
                        items: [
                            { name: 'Vue', version: '3.4', icon: '💚', note: 'Framework' },
                            { name: 'Vite', version: '5.4', icon: '⚡', note: 'Bundler' },
                            { name: 'Pinia', version: '2.x', icon: '🍍', note: 'State' },
                            { name: 'Router', version: '4.x', icon: '🧭', note: 'Hash mode' },
                            { name: 'Axios', version: '1.7', icon: '🌐', note: 'HTTP' },
                            { name: 'Sass', version: 'Modern', icon: '💅', note: 'Styles' }
                        ]
                    },
                    {
                        title: 'UI',
                        icon: '✨',
                        color: '#67c23a',
                        items: [
                            { name: 'Element Plus', version: '2.8', icon: '🎭', note: 'Components' },
                            { name: 'ECharts', version: '5.5', icon: '📊', note: 'Charts' },
                            { name: 'Three.js', version: '0.168', icon: '🎮', note: '3D' },
                            { name: 'Bootstrap Icons', version: '1.11', icon: '🎨', note: 'Icons' }
                        ]
                    },
                    {
                        title: 'DevOps',
                        icon: '',
                        color: '#e6a23c',
                        items: [
                            { name: 'Docker', version: 'Compose', icon: '🐳', note: 'Containers' },
                            { name: 'Nginx', version: '1.25', icon: '🌐', note: 'Server' },
                            { name: 'Git', version: 'GitHub', icon: '🌿', note: 'VCS' },
                            { name: 'Spatie', version: '5.11', icon: '🛡️', note: 'Permissions' }
                        ]
                    }
                ]
            }
        },
        {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 5,
            settings: {
                title: 'Что уже работает',
                columns: 3,
                items: [
                    {
                        icon: '🔐',
                        title: 'Авторизация',
                        status: 'stable',
                        description: 'Три типа входа с разными уровнями доступа',
                        done: ['User login', 'Admin login', 'Tester login', 'CSRF + Sanctum'],
                        todo: ['2FA', 'OAuth'],
                        bugs: ['Race condition при logout'],
                        untested: ['Нагрузка 1000+'],
                        stack: 'Sanctum v3.3 · CSRF · IP-ban'
                    },
                    {
                        icon: '🏋️',
                        title: 'Training',
                        status: 'beta',
                        description: 'Журнал тренировок, статистика, экспорт',
                        done: ['CRUD журнала', 'Группировка', 'Экспорт CSV', 'Шаринг'],
                        todo: ['Графики прогресса', 'Достижения'],
                        bugs: ['Группировка по кварталам'],
                        untested: ['10 000+ записей'],
                        stack: 'ECharts 5 · CSV Stream · Soft Deletes'
                    },
                    {
                        icon: '💡',
                        title: 'SmartLight',
                        status: 'beta',
                        description: 'Управление умным освещением',
                        done: ['Регистрация устройств', 'Телеметрия', 'Команды', 'API v0/v1'],
                        todo: ['Расписания', 'Группы устройств'],
                        bugs: ['Дублирование телеметрии'],
                        untested: ['50+ устройств'],
                        stack: 'Device Auth · Telemetry · v0/v1 API'
                    },
                    {
                        icon: '💬',
                        title: 'TalkStream',
                        status: 'alpha',
                        description: 'Мессенджер: чат, звонки, друзья',
                        done: ['Контакты', 'Сообщения', 'История', 'Заявки в друзья'],
                        todo: ['WebRTC звонки', 'Групповые чаты'],
                        bugs: ['Звонок не завершается', 'Дубли сообщений'],
                        untested: ['Групповой чат 100+'],
                        stack: 'Reverb v1.5 · Pusher · Laravel Echo'
                    },
                    {
                        icon: '🏢',
                        title: 'Companies',
                        status: 'stable',
                        description: 'Управление компаниями и каналами',
                        done: ['CRUD', 'Каналы связи', 'Пагинация', 'IndexedDB', 'Reorder'],
                        todo: ['Импорт CSV', 'Дедупликация'],
                        bugs: [],
                        untested: ['100 000+ компаний'],
                        stack: 'IndexedDB · Reorder · Pagination'
                    },
                    {
                        icon: '🌐',
                        title: 'Публичная часть',
                        status: 'alpha',
                        description: 'Лендинги, страницы ожидания',
                        done: ['Entry point', 'Разделение с админкой', 'Vite manifest'],
                        todo: ['Landing Builder', 'Блог', 'SEO'],
                        bugs: ['Таймер без часового пояса'],
                        untested: ['Нагрузка API'],
                        stack: 'Dual entry · Vite 5.4 · Blade + Vue'
                    }
                ]
            }
        },
        {
            id: 'footer-1',
            type: 'footer',
            enabled: true,
            order: 6,
            settings: {
                text: 'Разработано с ❤️ на Laravel + Vue 3',
                copyright: '© 2026 FenixPortal · by ASV',
                showSocialLinks: false,
                socialLinks: []
            }
        }
    ]
}
