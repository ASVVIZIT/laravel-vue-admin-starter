export default [
    {
        path: '/admin',
        component: () => import('@/layout/Layout.vue'),
        meta: {
            title: 'Соцсети для отзывов',
            permissions: ['manage_social_media_links'],
            sidebar: true,
            hidden: false
        },
        children: [
            {
                path: 'social-media-links',
                name: 'SocialMediaLinksAdmin',
                component: () => import('@/views/SocialMediaLinks/Admin/SocialMediaLinksAdmin.vue'),
                meta: {
                    title: 'Управление',
                    permissions: ['manage_social_media_links'],
                    sidebar: true,
                    hidden: false
                }
            }
        ]
    },
    {
        path: '/reviews',
        name: 'ReviewsPage',
        component: () => import('@/views/SocialMediaLinks/Public/ReviewsPage.vue'),
        meta: {
            title: 'Оставить отзыв',
            hidden: true,
            requiresAuth: false
        }
    }
];
