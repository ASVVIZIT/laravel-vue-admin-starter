<template>
    <div class="app-container">
        <el-form v-if="user" :model="user">
            <el-row :gutter="16">
                <el-col :span="10">
                    <UserCard :user="user" />
                </el-col>
                <el-col :span="14">
                    <UserActivity :user="user" />
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup>
// Импорты Vue и сторонних библиотек
// Imports from Vue and third-party libraries
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Импорт хранилища Pinia
// Pinia store import
import { useUserStore } from "../../store/user"

// Импорт API ресурсов и компонентов
// API resources and components imports
import Resource from '@/api/resource'
import UserCard from './components/UserCard.vue'
import UserActivity from './components/UserActivity.vue'

// Инициализация API ресурса для работы с пользователями
// Initialize API resource for users
const userResource = new Resource('users')

// Получение экземпляров маршрутизатора и хранилища
// Get router instance and user store
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Реактивное состояние компонента
// Reactive component state
const state = reactive({
    user: null
})

/**
 * Загружает данные пользователя по ID
 * Loads user data by ID
 * @param {string} id - Идентификатор пользователя / User ID
 */
const fetchUser = async (id) => {
    try {
        const { data } = await userResource.get(id)
        state.user = data
    } catch (error) {
        console.error('Ошибка загрузки пользователя:', error)
    }
}

// Хук жизненного цикла при монтировании компонента
// Component lifecycle hook when mounted
onMounted(() => {
    const userId = route.params?.id
    const currentUserId = userStore.id

    // Перенаправление если редактируется текущий пользователь
    // Redirect if editing current user
    if (userId === currentUserId) {
        router.push('/profile/edit')
        return
    }

    if (userId) {
        fetchUser(userId)
    }
})
</script>
