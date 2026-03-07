// ============================================================================
// CONTACT MANAGEMENT ROUTES
// ============================================================================
// 📁 Путь: resources/js/router/modules/ContactManagement/contact-management.js
// ✅ Маршруты для управления контактами и каналами связи
// ============================================================================

import Layout from '@/layout/Layout.vue';

import SocialMediaLinksRoutes from './SocialMediaLinks/social-media-links.js';

// ============================================================================
// COMPANY CONTACT CHANNELS ROUTES
// ============================================================================

const CompanyContactChannelsRoutes = [
    // ✅ СПИСОК КОМПАНИЙ
    {
        path: 'companies',
        name: 'CompanyList',
        component: () => import('@/views/ContactManagement/CompanyContactChannels/Admin/CompanyListAdmin.vue').catch(() => ({ default: () => import('@/views/error-page/404.vue') })),
        meta: {
            title: 'Компании',
            description: 'Список компаний',
            elSvgIcon: 'OfficeBuilding',
        }
    },

    // ✅ КАНАЛЫ КОНКРЕТНОЙ КОМПАНИИ (контекст компании)
    {
        path: 'companies/:id/channels',
        name: 'CompanyChannelsList',
        component: () => import('@/views/ContactManagement/CompanyContactChannels/Admin/CompanyChannelsList.vue').catch(() => ({ default: () => import('@/views/error-page/404.vue') })),
        meta: {
            title: 'Каналы Связи',
            description: 'Каналы компании',
            elSvgIcon: 'Connection',
        },
        props: true
    },

    // ✅ ВСЕ КАНАЛЫ (ОТДЕЛЬНЫЙ РАЗДЕЛ — НЕЗАВИСИМО)
    {
        path: 'channels',
        name: 'ChannelList',
        component: () => import('@/views/ContactManagement/CompanyContactChannels/Admin/ChannelListAdmin.vue').catch(() => ({ default: () => import('@/views/error-page/404.vue') })),
        meta: {
            title: 'Все Каналы',
            description: 'Все каналы связи всех компаний',
            elSvgIcon: 'Connection',
        },
        props: true
    },
];

// ============================================================================
// MAIN CONTACT MANAGEMENT ROUTE
// ============================================================================

const contactManagementRoutes = {
    path: '/contact-management',
    component: Layout,
    redirect: '/contact-management/channels',
    name: 'ContactManagement',
    alwaysShow: true,
    meta: {
        title: 'Управление Контактами',
        description: 'Управление каналами связи компании',
        elSvgIcon: 'Management',
    },
    children: [
        ...CompanyContactChannelsRoutes,
        ...SocialMediaLinksRoutes,
    ]
};

export default contactManagementRoutes;
