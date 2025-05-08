<template>
    <div class="app-container scroll-y">
        <!-- Формa отображается только при наличии данных пользователя -->
        <!-- Form shows only when user data exists -->
        <el-form v-if="user" :model="user">
            <el-row :gutter="16">
                <el-col :span="10">
                    <!-- Карточка пользователя с передачей пропсов -->
                    <!-- User card with props passing -->
                    <UserCard :user="user" />

                    <!-- Биография пользователя -->
                    <!-- User biography -->
                    <UserBio />
                </el-col>

                <el-col :span="14">
                    <!-- Активность пользователя с передачей пропсов -->
                    <!-- User activity with props passing -->
                    <UserActivity :user="user" />
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<!-- Используем синтаксис script setup для Composition API -->
<!-- Use script setup syntax for Composition API -->
<script setup>
// Импорт функций жизненного цикла и реактивности
// Import lifecycle and reactivity functions
import { onMounted, ref } from 'vue'

// Импорт хранилища Pinia
// Import Pinia store
import { useUserStore } from '@/store/user'

// Импорт компонентов
// Import components
import UserBio from './components/UserBio.vue'
import UserCard from './components/UserCard.vue'
import UserActivity from './components/UserActivity.vue'

// Реактивная ссылка для хранения данных пользователя
// Reactive reference for user data
const user = ref(null)

// Получаем экземпляр хранилища пользователя
// Get user store instance
const userStore = useUserStore()

// Асинхронная функция получения данных пользователя
// Async function to fetch user data
const getUser = async () => {
    try {
        // Вызываем действие хранилища и сохраняем результат
        // Call store action and save result
        user.value = await userStore.getInfo()
    } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error)
        // Можно добавить обработку ошибки (например, уведомление пользователя)
        // Add error handling here (e.g. user notification)
    }
}

// Хук жизненного цикла: выполняем при монтировании компонента
// Lifecycle hook: execute when component is mounted
onMounted(() => {
    getUser()
})
</script>

<style scoped>
/* Стили контейнера с вертикальным скроллом */
/* Scroll container styles */
.scroll-y {
    overflow-y: auto;
    height: 100vh;
}
</style>
