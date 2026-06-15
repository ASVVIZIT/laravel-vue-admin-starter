/**
 * Технологический стек проекта FenixPortal
 * Используется в TechStackSection.vue
 */
export const techStack = [
    {
        title: 'Backend',
        icon: '⚙️',
        items: [
            { name: 'Laravel', version: 'v10.48', icon: '🎯' },
            { name: 'PHP', version: '8.2+', icon: '🐘' },
            { name: 'MySQL', version: '8.0', icon: '🗄️' },
            { name: 'Redis', version: 'Latest', icon: '🔴' },
            { name: 'Sanctum', version: 'v3.3', icon: '🔐' },
            { name: 'Reverb', version: 'v1.5', icon: '📡' }
        ]
    },
    {
        title: 'Frontend',
        icon: '🎨',
        items: [
            { name: 'Vue', version: '3.x', icon: '💚' },
            { name: 'Vite', version: '5.4', icon: '⚡' },
            { name: 'Pinia', version: 'Latest', icon: '🍍' },
            { name: 'Vue Router', version: 'Hash Mode', icon: '🧭' },
            { name: 'Axios', version: 'Latest', icon: '🌐' },
            { name: 'Sass/SCSS', version: 'Modern', icon: '💅' }
        ]
    },
    {
        title: 'UI / UX',
        icon: '✨',
        items: [
            { name: 'Element Plus', version: 'Latest', icon: '🎭' },
            { name: 'ECharts', version: '5.x', icon: '📊' },
            { name: 'Three.js', version: 'Latest', icon: '🎮' },
            { name: 'Bootstrap Icons', version: 'Latest', icon: '🎨' }
        ]
    },
    {
        title: 'Инфраструктура',
        icon: '🚀',
        items: [
            { name: 'Docker', version: 'Compose', icon: '🐳' },
            { name: 'Nginx', version: 'Latest', icon: '🌐' },
            { name: 'Git', version: 'GitHub', icon: '🐙' },
            { name: 'Spatie Permission', version: 'v5.11', icon: '🛡️' }
        ]
    }
]
