// resources/js/router/modules/ContactManagement/contact-management.js

import Layout from '@/layout/Layout.vue';

import SocialMediaLinksRoutes from './SocialMediaLinks/social-media-links.js';

const CompanyContactChannelsRoutes = [
    {
        path: 'companies',
        name: 'CompanyList',
        component: () => import('@/views/ContactManagement/CompanyContactChannels/Admin/CompanyListAdmin.vue').catch(() => ({ default: () => import('@/views/error-page/404.vue') })),
        meta: {
            title: 'Компании',
            description: 'Список компаний',
            elSvgIcon: 'OfficeBuilding', // <-- Используем OfficeBuilding
            // permissions: ['...'],
        }
    },
    /*{
        path: 'companies/:id/channels',
        name: 'CompanyChannelsList',
        component: () => import('@/views/ContactManagement/CompanyContactChannels/Admin/CompanyChannelsList.vue').catch(() => ({ default: () => import('@/views/error-page/404.vue') })),
        meta: {
            title: 'Каналы Связи',
            description: 'Список каналов для компании',
            elSvgIcon: 'Link',
            // permissions: ['...'],
        },
        props: true
    },*/
];

const contactManagementRoutes = {
    path: '/contact-management',
    component: Layout,
    redirect: '/contact-management/social-media-links-parent/admin',
    name: 'ContactManagement',
    alwaysShow: true,
    meta: {
        title: 'Управление Контактами',
        description: 'Управление каналами связи компании',
        elSvgIcon: 'Management',
        // permissions: ['...'],
    },
    children: [
        ...CompanyContactChannelsRoutes,
        ...SocialMediaLinksRoutes,
    ]
};

export default contactManagementRoutes;
