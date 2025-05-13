// Импорт функции создания хранилища Pinia
// Import Pinia store creation function
import { defineStore } from 'pinia';

// Создание и экспорт хранилища для работы с иконками
// Create and export icon store
export const useIconStore = defineStore('icon', {
    state: () => ({
        // История использованных классов
        // History of used classes
        classHistory: [],

        // Последний использованный класс
        // Last used class
        lastUsedClass: null,
    }),
    actions: {
        // Обновление последнего использованного класса
        // Update last used class
        updateLastUsedClass(className) {
            this.lastUsedClass = className;
            this.classHistory.push(className);
        },

        // Очистка истории классов
        // Clear class history
        clearHistory() {
            this.classHistory = [];
            this.lastUsedClass = null;
        },
    },
    getters: {
        // Получение количества использованных классов
        // Get total used classes count
        totalUsed: (state) => state.classHistory.length,
    },
});
