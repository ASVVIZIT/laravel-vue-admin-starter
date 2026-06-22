// resources/js/components/FenixIconVue/store/fenixIconsStore.js
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

// ============================================================================
// 🔥 РЕКУРСИВНЫЙ АВТО-ИМПОРТ ВСЕХ ИКОНОК ИЗ ПАПКИ icons/ И ВСЕХ ПОДПАПОК
// ============================================================================
const iconsModules = import.meta.glob('../icons/**/*.vue', { eager: true });

// Преобразуем в объект { Fenix2gis: Component, FenixTikTok: Component, ... }
const availableIcons = {};

Object.entries(iconsModules).forEach(([path, module]) => {
    // 🔥 Извлекаем ТОЛЬКО имя файла (игнорируем путь к подпапке)
    const iconName = path
        .split('/')
        .pop()
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

        // 🔥 ОБНОВЛЁННЫЕ КАТЕГОРИИ ИКОНОК
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

            // UI (универсальные иконки)
            ui: [
                'FenixDefault',
                'FenixSearch',
                'FenixWarning'
            ],

            // i18n (для модуля переводов)
            i18n: [
                // core
                'FenixTranslate',
                'FenixLanguage',
                // status
                'FenixCheck',
                'FenixMissing',
                'FenixSuccess',
                'FenixError',
                'FenixPending',
                // files
                'FenixFile',
                'FenixFolder',
                'FenixCode',
                'FenixJson',
                // actions
                'FenixUpload',
                'FenixDownload',
                'FenixImport',
                'FenixExport',
                'FenixRefresh',
                'FenixScan',
                'FenixCopy',
                // editing
                'FenixEdit',
                'FenixSave',
                'FenixDelete',
                'FenixAdd',
                'FenixClose',
                // analysis
                'FenixCompare',
                'FenixDiff',
                'FenixFilter',
                'FenixSort',
                'FenixMerge',
                // extras (P2)
                'FenixKey',
                'FenixTag',
                'FenixBell',
                'FenixHelp',
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

        // 🔥 НОВОЕ: Получить все категории
        getCategories: (state) => {
            return Object.keys(state.iconCategories);
        },

        // Получить все иконки как массив
        getAllIcons: (state) => {
            return Object.entries(state.availableIcons).map(([name, component]) => ({
                name,
                component
            }));
        },

        // 🔥 НОВОЕ: Получить иконку с информацией о категории
        getIconWithCategory: (state) => (name) => {
            const component = state.availableIcons[name];
            if (!component) return null;

            for (const [category, icons] of Object.entries(state.iconCategories)) {
                if (icons.includes(name)) {
                    return { name, component, category };
                }
            }
            return { name, component, category: 'unknown' };
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

        // 🔥 НОВОЕ: Создать новую категорию
        createCategory(category) {
            if (!this.iconCategories[category]) {
                this.iconCategories[category] = [];
            }
        },

        // 🔥 НОВОЕ: Удалить иконку из категории
        removeIconFromCategory(category, iconName) {
            if (this.iconCategories[category]) {
                const index = this.iconCategories[category].indexOf(iconName);
                if (index !== -1) {
                    this.iconCategories[category].splice(index, 1);
                }
            }
        },

        // 🔥 НОВОЕ: Переместить иконку между категориями
        moveIconToCategory(iconName, fromCategory, toCategory) {
            this.removeIconFromCategory(fromCategory, iconName);
            this.addIconToCategory(toCategory, iconName);
        },

        // Проверить существует ли иконка
        iconExists(iconName) {
            return !!this.availableIcons[iconName];
        },

        // Получить количество иконок
        getIconsCount() {
            return Object.keys(this.availableIcons).length;
        },

        // 🔥 НОВОЕ: Получить количество иконок в категории
        getIconsCountByCategory(category) {
            return (this.iconCategories[category] || []).length;
        }
    }
});
