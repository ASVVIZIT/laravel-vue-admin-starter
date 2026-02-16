// resources/js/components/FenixIconVue/store/fenixIconsStore.js
import { defineStore } from 'pinia';
// Импортируем иконку
import Fenix2gis from '../icons/Fenix2gis.vue';
// Импортируйте другие иконки по мере добавления
// import FenixSomeOtherIcon from '../icons/FenixSomeOtherIcon.vue';

export const useFenixIconsStore = defineStore('fenixIcons', {
    state: () => ({
        // Храним все иконки в объекте
        availableIcons: {
            Fenix2gis, // Ключ - имя, значение - компонент
            // FenixSomeOtherIcon,
            // ... другие иконки
        },
        // Пример категоризации (опционально)
        iconCategories: {
            maps: ['Fenix2gis'],
            // social: ['FenixTikTok'], // Пример
            // ... другие категории
        }
    }),
    getters: {
        // Геттер для получения иконки по имени
        getIconByName: (state) => (name) => {
            return state.availableIcons[name] || null;
        },
        // Геттер для получения иконок по категории (опционально)
        getIconsByCategory: (state) => (category) => {
            const iconNames = state.iconCategories[category] || [];
            return iconNames.map(name => ({ name, component: state.availableIcons[name] }));
        }
    },
    actions: {
        // Действие для добавления новой иконки (опционально, но полезно)
        addIcon(name, component) {
            if (!this.availableIcons[name]) {
                this.availableIcons[name] = component;
                console.log(`Иконка ${name} добавлена.`);
            } else {
                console.warn(`Иконка ${name} уже существует.`);
            }
        },
        // Действие для добавления иконки в категорию (опционально)
        addIconToCategory(category, iconName) {
            if (!this.iconCategories[category]) {
                this.iconCategories[category] = [];
            }
            if (!this.iconCategories[category].includes(iconName)) {
                this.iconCategories[category].push(iconName);
            }
        }
    }
});
