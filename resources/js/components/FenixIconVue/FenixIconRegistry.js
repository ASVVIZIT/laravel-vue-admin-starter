// resources/js/components/FenixIconVue/FenixIconRegistry.js

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ ИКОНОК ИЗ ПАПКИ icons/ (РЕКУРСИВНО ИЗ ВСЕХ ПОДПАПОК)
// ============================================================================
const iconsModules = import.meta.glob('./icons/**/*.vue', { eager: true });

// Создаём объект реестра
export const FenixIcons = {};

// Заполняем реестр
Object.entries(iconsModules).forEach(([path, module]) => {
    // Извлекаем ТОЛЬКО имя файла (игнорируем путь к подпапке)
    const iconName = path
        .split('/')
        .pop()
        .replace('.vue', '');

    FenixIcons[iconName] = module.default;
});

// ============================================================================
// ЭКСПОРТ ВСЕХ ИКОНОК
// ============================================================================
export default FenixIcons;

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

// Получить иконку по имени
export const getIcon = (name) => FenixIcons[name] || null;

// Получить все имена иконок
export const getIconNames = () => Object.keys(FenixIcons);

// Проверить существование иконки
export const hasIcon = (name) => !!FenixIcons[name];

// Получить количество зарегистрированных иконок
export const getIconsCount = () => Object.keys(FenixIcons).length;

// Получить имена иконок по категории (по имени подпапки)
export const getIconsByCategory = (category) => {
    return Object.entries(iconsModules)
        .filter(([path]) => path.includes(`/icons/${category}/`))
        .map(([path]) => path.split('/').pop().replace('.vue', ''));
};

// Получить все категории
export const getCategories = () => {
    const categories = new Set();
    Object.keys(iconsModules).forEach(path => {
        const parts = path.split('/');
        if (parts.length > 3) {
            categories.add(parts[2]); // ./icons/CATEGORY/file.vue
        }
    });
    return Array.from(categories);
};

// Зарегистрировать все иконки глобально (опционально)
export const registerIcons = (app) => {
    Object.entries(FenixIcons).forEach(([name, component]) => {
        app.component(name, component);
    });
};
