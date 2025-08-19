// resources/js/router/modules/dynamicTable.js
import Layout from "@/layout/Layout.vue";

export default [
    {
        path: '/dynamic-table',
        component: Layout,
        meta: {
            title: 'Динамические таблицы',
            bootstrapIcon: 'table',
            showInMenu: true,
            order: 10
        },
        children: [
            {
                path: '',
                redirect: 'tables'
            },
            {
                path: 'tables',
                name: 'DynamicTable',
                component: () => import('@/views/DynamicTable/FenixTable.vue'),
                meta: {
                    title: 'Таблицы',
                    bootstrapIcon: 'table',
                    showInMenu: true
                }
            },
            {
                path: 'tables/:templateId',
                name: 'DynamicTableWithTemplate',
                component: () => import('@/views/DynamicTable/FenixTable.vue'),
                meta: {
                    title: 'Таблица',
                    bootstrapIcon: 'table',
                    showInMenu: false
                },
                hidden: true,
                props: true
            },
            {
                path: 'templates',
                name: 'TemplateList',
                component: () => import('@/components/DynamicTable/TemplateList.vue'),
                meta: {
                    title: 'Шаблоны таблиц',
                    bootstrapIcon: 'file-earmark-text',
                    showInMenu: true
                }
            },
            {
                path: 'templates/create',
                name: 'TemplateCreate',
                component: () => import('@/components/DynamicTable/TemplateBuilder.vue'),
                meta: {
                    title: 'Создать шаблон',
                    bootstrapIcon: 'file-earmark-plus',
                    showInMenu: false
                }
            },
            {
                path: 'templates/:id/edit',
                name: 'TemplateEdit',
                component: () => import('@/components/DynamicTable/TemplateBuilder.vue'),
                meta: {
                    title: 'Редактировать шаблон',
                    bootstrapIcon: 'pencil-square',
                    showInMenu: false
                },
                props: true
            }
        ]
    }
];
