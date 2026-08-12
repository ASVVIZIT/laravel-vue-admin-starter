// resources/js/router/modules/ContactManagement/SocialMediaLinks/social-media-links.js
export default [
    {
        // Этот маршрут станет ПОДМЕНЮ "Соцсети для отзывов" внутри "Управление Контактами"
        path: 'social-media-links-parent', // Относительный путь от /contact-management
        name: 'SocialMediaLinksParent',
        alwaysShow: true,
        meta: {
            title: 'Соцсети для отзывов',
            description: 'Управление соцсети для отзывов',
            elSvgIcon: 'Connection',
            permissions: ['manage social media links'],
        },
        children: [
            {
                path: 'admin',
                name: 'SocialMediaLinksAdmin',
                component: () => import('@/views/ContactManagement/SocialMediaLinks/Admin/SocialMediaLinksAdmin.vue'),
                meta: {
                    title: 'Управление qr-code (ссылки)',
                    description: 'Управление соцсети для отзывов',
                    elSvgIcon: 'Operation',
                    permissions: ['manage social media links'],
                }
            },
            {
                path: 'reviews',
                name: 'ReviewsPageAdmin',
                component: () => import('@/views/ContactManagement/SocialMediaLinks/Public/ReviewsPage.vue'),
                hidden: false,
                requiresAuth: true,
                meta: {
                    title: 'Отзывы (Админ)',
                    elSvgIcon: 'Comment' // Иконка для конкретного пункта
                }
            }
        ]
    },
    // Этот маршрут - публичный, обычно не отображается в боковом меню
    {
        path: '/reviews',
        name: 'ReviewsPagePublic',
        component: () => import('@/views/ContactManagement/SocialMediaLinks/Public/ReviewsPage.vue'),
        hidden: true,
        requiresAuth: false,
        meta: {
            title: 'Оставить отзыв',
        }
    }
];
