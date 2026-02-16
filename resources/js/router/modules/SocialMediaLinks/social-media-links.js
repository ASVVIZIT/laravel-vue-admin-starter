// Экспортируем массив маршрутов для модуля
export default [
    {
        path: '/admin',
        component: () => import('@/layout/Layout.vue'), // Основной layout для админки
        meta: {
            title: 'Соцсети для отзывов', // Название для меню
            permissions: ['manage_social_media_links'], // Необходимые права
            sidebar: true, // Показывать в боковом меню
            hidden: false
        },
        children: [
            {
                path: 'social-media-links',
                name: 'SocialMediaLinksAdmin',
                component: () => import('@/views/SocialMediaLinks/Admin/SocialMediaLinksAdmin.vue'),
                meta: {
                    title: 'Управление', // Название для подменю
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
