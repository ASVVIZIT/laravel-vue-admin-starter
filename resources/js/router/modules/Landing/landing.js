import Layout from '@/layout/Layout.vue'

export default {
    path: '/landing',
    component: Layout,
    redirect: '/landing/pages',
    name: 'Landing',
    meta: { title: 'Landing Builder', bootstrapIcon: 'bi bi-brush' },
    children: [
        {
            path: 'pages',
            name: 'LandingList',
            component: () => import('@/views/Landing/LandingListView.vue'),
            meta: { title: 'Список лендингов', bootstrapIcon: 'bi bi-file-earmark-text' }
        },
        {
            path: 'pages/create',
            name: 'LandingCreate',
            component: () => import('@/views/Landing/LandingEditorView.vue'),
            meta: { title: 'Создать лендинг' },
            hidden: true
        },
        {
            path: 'pages/:id/edit',
            name: 'LandingEdit',
            component: () => import('@/views/Landing/LandingEditorView.vue'),
            meta: { title: 'Редактировать лендинг' },
            hidden: true
        },
        {
            path: 'pages/:id/preview',
            name: 'LandingPreview',
            component: () => import('@/views/Landing/LandingPreviewView.vue'),
            meta: { title: 'Превью' },
            hidden: true
        },
        {
            path: 'settings',
            name: 'SiteModeSettings',
            component: () => import('@/views/Landing/SiteModeSwitcher.vue'),
            meta: { title: 'Режим сайта', bootstrapIcon: 'bi bi-gear' }
        }
    ]
}
