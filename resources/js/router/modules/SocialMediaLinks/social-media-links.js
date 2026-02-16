// resources/js/router/modules/SocialMediaLinks/social-media-links.js
export default [
    {
        path: '/social-admin',
        name: 'SocialAdmin',
        alwaysShow: true,
        showInMenu: true,
        sidebar: true,
        hidden: false,
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'Соцсети для отзывов',
            description: 'Управление соцсети для отзывов',
            permissions: ['manage_social_media_links'],
            elSvgIcon: 'Connection',
        },
        children: [
            {
                path: 'social-media-links',
                name: 'SocialMediaLinksAdmin',
                component: () => import('@/views/SocialMediaLinks/Admin/SocialMediaLinksAdmin.vue'),
                meta: {
                    title: 'Управление qr-code (ссылки)',
                    description: 'Управление соцсети для отзывов',
                    elSvgIcon: 'Operation',
                    permissions: ['manage_social_media_links'],
                }
            },
            {
                path: 'reviews',
                name: 'ReviewsPageAdmin',
                component: () => import('@/views/SocialMediaLinks/Public/ReviewsPage.vue'),
                hidden: false,
                requiresAuth: true,
                meta: {
                    title: 'Отзывы (Админ)',
                    elSvgIcon: 'Comment'
                }
            }
        ]
    },
    {
        path: '/reviews',
        name: 'ReviewsPagePublic',
        component: () => import('@/views/SocialMediaLinks/Public/ReviewsPage.vue'),
        hidden: true,
        requiresAuth: false,
        meta: {
            title: 'Оставить отзыв',
        }
    }
];
