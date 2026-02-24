// resources/js/components/FenixIconVue/store/fenixIconsStore.js
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ ИКОНОК ИЗ ПАПКИ icons/
// ============================================================================
const iconsModules = import.meta.glob('../icons/*.vue', { eager: true });

// Преобразуем в объект { Fenix2gis: Component, FenixTikTok: Component, ... }
const availableIcons = {};

Object.entries(iconsModules).forEach(([path, module]) => {
    // Извлекаем имя файла без расширения
    const iconName = path
        .replace('../icons/', '')
        .replace('.vue', '');

    // ✅ markRaw() ЗДЕСЬ — один раз для всех иконок!
    availableIcons[iconName] = markRaw(module.default);
});

// ============================================================================
// STORE
// ============================================================================
export const useFenixIconsStore = defineStore('fenixIcons', {
    state: () => ({
        // Все доступные иконки (уже не реактивные благодаря markRaw)
        availableIcons,

        // Категории иконок
        iconCategories: {
            // Maps
            maps: [
                'Fenix2gis',
                'FenixGoogleMaps',
                'FenixYandexMaps'
            ],

            // Social
            social: [
                'FenixVk',
                'FenixTelegram',
                'FenixWhatsApp',
                'FenixYouTube',
                'FenixPinterest',
                'FenixTikTok',
                'FenixInstagram',
                'FenixTwitter',
                'FenixFacebook',
                'FenixLinkedIn'
            ],

            // Default
            default: [
                'FenixDefault'
            ]
        }
    }),

    getters: {
        // Получить иконку по имени (уже markRaw, ничего делать не нужно)
        getIconByName: (state) => (name) => {
            return state.availableIcons[name] || null;
        },

        // Получить все имена иконок
        getIconNames: (state) => {
            return Object.keys(state.availableIcons);
        },

        // Получить иконки по категории
        getIconsByCategory: (state) => (category) => {
            const iconNames = state.iconCategories[category] || [];
            return iconNames
                .filter(name => state.availableIcons[name])
                .map(name => ({ name, component: state.availableIcons[name] }));
        },

        // Получить все иконки как массив
        getAllIcons: (state) => {
            return Object.entries(state.availableIcons).map(([name, component]) => ({
                name,
                component
            }));
        },

        // Проверить существует ли иконка
        hasIcon: (state) => (name) => {
            return !!state.availableIcons[name];
        }
    },

    actions: {
        // Добавить иконку в категорию
        addIconToCategory(category, iconName) {
            if (!this.iconCategories[category]) {
                this.iconCategories[category] = [];
            }
            if (!this.iconCategories[category].includes(iconName)) {
                this.iconCategories[category].push(iconName);
            }
        },

        // Проверить существует ли иконка
        iconExists(iconName) {
            return !!this.availableIcons[iconName];
        },

        // Получить количество иконок
        getIconsCount() {
            return Object.keys(this.availableIcons).length;
        }
    }
});
