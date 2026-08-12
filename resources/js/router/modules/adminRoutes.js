/** When your routing table is too long, you can split it into small modules**/
import Layout from '@/layout/Layout.vue'

const adminRoutes = {
  path: '/administrator',
  component: Layout,
  redirect: '/administrator/users',
  name: 'Administrator',
  alwaysShow: true,
  meta: {
    title: 'Administrator',
    description: 'Управление пользователями и правами доступа',
    bootstrapIcon: 'person-workspace',
    permissions: ['view menu administrator'],
  },
  children: [
    /** User managements */
    {
      path: 'users/edit/:id(\\d+)',
      component: () => import('@/views/users/UserProfile.vue'),
      name: 'UserProfile',
      meta: { title: 'UserProfile', noCache: true, permissions: ['manage user'] },
      hidden: true,
    },
    // 🔥 НОВЫЙ МАРШРУТ: Просмотр soft-deleted пользователя (read-only)
    {
      path: 'users/view/:id(\\d+)',
      component: () => import('@/views/users/ViewUser.vue'),
      name: 'ViewUser',
      meta: { title: 'ViewUser', noCache: true, permissions: ['manage user'] },
      hidden: true,
    },
    {
      path: 'users',
      component: () => import('@/views/users/List.vue'),
      name: 'UserList',
      meta: { title: 'UserList', bootstrapIcon: 'people', showInGuide: true, permissions: ['manage user'] },
    },
    /** Role and permission */
    {
      path: 'roles',
      component: () => import('@/views/role-permission/List.vue'),
      name: 'RoleList',
      meta: { title: 'RolePermission', bootstrapIcon: 'person-lines-fill', permissions: ['manage permission'] },
    },
  ],
}

export default adminRoutes
