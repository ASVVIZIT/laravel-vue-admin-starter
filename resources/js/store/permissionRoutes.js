import { defineStore } from 'pinia'

export const usePermissionRoutesStore = defineStore('permissionRoutes', {
    state: () => ({
        permission_routes: [] // Здесь должны быть ваши маршруты
    }),
    getters: {
        // Если нужно добавить вычисляемые свойства
    },
    actions: {
        // Если нужно добавить методы для обновления маршрутов
        async fetchRoutes() {
            // Пример получения маршрутов
            // this.permission_routes = await fetchRoutesFromAPI()
        }
    }
})
