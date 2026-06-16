import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../components/HomePage.vue')
    },
    {
        path: '/l/:slug',
        name: 'PublicLanding',
        component: () => import('../components/Landing/PublicLanding.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../components/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

console.log('[Router] Created successfully')

export default router
