/** When your routing table is too long, you can split it into small modules**/
import Layout from '@/layout/layout';

const nestedRoutes = {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
        title: 'nested',
        description: 'Пример большой вложенности страниц',
        icon: 'nested Меню каскадное',
        permissions: ['view menu nested routes'],
        bootstrapIcon: 'list-nested'
    },
    children: [
        {
            path: 'menu1',
            component: () => import('@/views/nested/menu1/index'),
            name: 'Menu1',
            meta: {
                title: 'menu1 Тут очень длинный заголовок очень длинный',
                bootstrapIcon: 'list-nested',
            },
            children: [
                {
                    path: 'menu1-1',
                    component: () => import('@/views/nested/menu1/menu1-1/index'),
                    name: 'Menu1-1',
                    meta: {
                        title: 'menu1-1 Тут очень длинный заголовок очень длинный',
                        bootstrapIcon: 'list-nested',
                    },
                },
                {
                    path: 'menu1-2',
                    component: () => import('@/views/nested/menu1/menu1-2/index'),
                    name: 'Menu1-2',
                    meta: {
                        title: 'menu1-2 Тут очень длинный заголовок очень длинный',
                        bootstrapIcon: 'list-nested',
                    },
                    children: [
                        {
                            path: 'menu1-2-1',
                            component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                            name: 'Menu1-2-1',
                            meta: {
                                title: 'menu1-2-1 Тут очень длинный заголовок очень длинный',
                                bootstrapIcon: 'list-nested',
                            },
                        },
                        {
                            path: 'menu1-2-2',
                            component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                            name: 'Menu1-2-2',
                            meta: {
                                title: 'menu1-2-2 Тут очень длинный заголовок очень длинный',
                                bootstrapIcon: 'list-nested',
                            },
                        },
                    ],
                },
                {
                    path: 'menu1-3',
                    component: () => import('@/views/nested/menu1/menu1-3/index'),
                    name: 'Menu1-3',
                    meta: {
                        title: 'menu1-3 Тут очень длинный заголовок очень длинный',
                        bootstrapIcon: 'list-nested',
                    },
                },
            ],
        },
        {
            path: 'menu2',
            component: () => import('@/views/nested/menu2/index'),
            name: 'Menu2',
            meta: {
                title: 'menu2 Тут очень длинный заголовок очень длинный',
                bootstrapIcon: 'list-nested',
            },
            children: [
                {
                    path: 'menu2-1',
                    component: () => import('@/views/nested/menu2/menu2-1'),
                    name: 'Menu2-1',
                    meta: {
                        title: 'menu2-1 Тут очень длинный заголовок очень длинный',
                        bootstrapIcon: 'list-nested',
                    },
                },
            ]
        },
    ],
};

export default nestedRoutes;
