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
            elSvgIcon: 'Trophy',
            permissions: ['view menu training'],
            order: 5
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
                    permissions: ['view training'],
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
                    permissions: ['create training log'],
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
                    permissions: ['view training'],
                    hidden: true
                }
            },
            {
                path: 'stats',
                name: 'TrainingStats',
                component: () => import('@/views/Training/StatsView.vue'),
                meta: {
                    title: 'Статистика',
                    elSvgIcon: 'TrendCharts',
                    permissions: ['view training stats'],
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
                    permissions: ['view training'],
                    hidden: true
                },
                props: true
            }
        ]
    }
];
