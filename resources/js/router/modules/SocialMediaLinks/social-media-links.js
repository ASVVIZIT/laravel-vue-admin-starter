// Экспортируем массив маршрутов для модуля
export default [
    {
        path: '/social-admin',
        component: () => import('@/layout/Layout.vue'), // Основной layout для админки
        meta: {
            title: 'Соцсети для отзывов', // Название для меню
            description: 'Управление соцсети для отзывов',
            permissions: ['manage_social_media_links'], // Необходимые права
            bootstrapIcon: 'person-workspace',
            sidebar: true, // Показывать в боковом меню
            hidden: false
        },
        children: [
            {
                path: 'social-media-links',
                name: 'SocialMediaLinksAdmin',
                component: () => import('@/views/SocialMediaLinks/Admin/SocialMediaLinksAdmin.vue'),
                meta: {
                    title: 'Управление соц ссылками', // Название для подменю
                    permissions: ['manage_social_media_links'],
                    sidebar: true,
                    hidden: false
                }
            }
        ]
    },
    {
        path: '/reviews', // Публичная страница
        name: 'ReviewsPage',
        component: () => import('@/views/SocialMediaLinks/Public/ReviewsPage.vue'),
        meta: {
            title: 'Оставить отзыв',
            hidden: true, // Не показывать в меню
            requiresAuth: false // Не требует аутентификации
        }
    }
];
