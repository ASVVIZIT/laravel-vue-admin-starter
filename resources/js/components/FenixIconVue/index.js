/**
 * Экспорт всех компонентов и утилит FenixIconVue
 */

// Компоненты
export { default as FenixIcon } from './FenixIcon.vue';

// Store
export { useFenixIconsStore } from './store/fenixIconsStore.js';

// Registry
export {
    FenixIcons,
    getIcon,
    getIconNames,
    hasIcon,
    registerIcons
} from './FenixIconRegistry.js';
