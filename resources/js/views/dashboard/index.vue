<template>
    <div class="dashboard-container scroll-y">
        <!-- Conditionally render Admin/Editor components based on user role -->
        <!-- Условный рендеринг компонентов Admin/Editor в зависимости от роли пользователя -->
        <Admin v-if="hasAdminRole" />
        <Editor v-else />
    </div>
</template>

<script setup>
// Component imports
// Импорт компонентов
import Admin from './Admin'
import Editor from './Editor'

// Vue reactivity utilities
// Импорт реактивных утилит Vue
import { computed } from 'vue'

// Pinia store for user management
// Импорт хранилища Pinia для управления пользователем
import { userStore } from '@/store/user'

// Initialize user store
// Инициализация хранилища пользователя
const useUserStore = userStore()

// Reactive computed property to check admin role
// Реактивное вычисляемое свойство для проверки роли администратора
const hasAdminRole = computed(() => {
    // Convert roles object values to array and check inclusion
    // Преобразование значений объекта ролей в массив и проверка наличия
    return Object.values(useUserStore.roles).includes('admin')
})
</script>

<style scoped lang="scss"></style>
