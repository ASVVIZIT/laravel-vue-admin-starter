/**
 * ============================================================================
 * TRAINING ROUTES — МАРШРУТЫ МОДУЛЯ ТРЕНИРОВОК
 * ============================================================================
 * 📁 Путь: @/router/modules/Training/training.js
 * ✅ Подключение: в @/router/index.js добавить ...trainingRoutes
 * ✅ Иконка: Element Plus 'Fitness' или 'Trophy'
 * ============================================================================
 */

export default [
    {
        path: '/training',
        name: 'Training',
        alwaysShow: true,
        showInMenu: true,
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'Тренировки',
            elSvgIcon: 'Trophy', // 'Fitness' или 'Trophy'
            permissions: ['view_training'],
            order: 5 // порядок в меню
        },
        children: [
            {
                path: 'dashboard',
                name: 'TrainingDashboard',
                component: () => import('@/views/Training/Dashboard.vue'),
                meta: {
                    title: 'Мои тренировки',
                    elSvgIcon: 'DataLine',
                    affix: false,
                    permissions: ['view_training'],
                    noCache: true
                }
            },
            {
                path: 'log',
                name: 'TrainingLog',
                component: () => import('@/views/Training/LogView.vue'),
                meta: {
                    title: 'Добавить запись',
                    elSvgIcon: 'EditPen',
                    permissions: ['create_training_log'],
                    noCache: true
                }
            },
            {
                path: 'exercises',
                name: 'TrainingExercises',
                component: () => import('@/views/Training/ExercisesView.vue'),
                meta: {
                    title: 'Справочник упражнений',
                    elSvgIcon: 'List',
                    permissions: ['view_training'],
                    hidden: true // скрыто из меню, доступно по прямой ссылке
                }
            },
            {
                path: 'stats',
                name: 'TrainingStats',
                component: () => import('@/views/Training/StatsView.vue'),
                meta: {
                    title: 'Статистика',
                    elSvgIcon: 'TrendCharts',
                    permissions: ['view_training_stats'],
                    noCache: true
                }
            },
            {
                path: 'shared/:user',
                name: 'TrainingShared',
                component: () => import('@/views/Training/SharedView.vue'),
                meta: {
                    title: 'Тренировки пользователя',
                    elSvgIcon: 'Share',
                    permissions: ['view_training'],
                    hidden: true
                },
                props: true
            }
        ]
    }
];
