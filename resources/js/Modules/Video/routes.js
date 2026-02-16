
export default [
    {
        path: '/videos',
        name: 'videos',
        component: () => import('@/modules/video/gallery/VideoGallery.vue'),
        meta: {
            title: 'Видео галерея',
            elSvgIcon: 'VideoCameraFilled',
            permissions: ['manage entity']
        }
    },
    {
        hidden: true,
        path: '/videos/scan-multiple',
        name: 'scan-multiple',
        meta: {
            title: 'Массовое обновление видео',
            permissions: ['manage entity']
        }
    },
    {
        path: 'videos-message-test',
        component: () => import('@/modules/Video/utils/videoMessage/VideoMessageTester.vue'),
        name: 'videosMessageTest',
        meta: {
            title: 'UI Тестер сообщений',
            elSvgIcon: 'Tools',
            permissions:
                ['manage entity']
        },
    },

]
