// resources/js/components/FenixIconVue/FenixIconRegistry.js

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ ИКОНОК ИЗ ПАПКИ icons/
// ============================================================================
const iconsModules = import.meta.glob('./icons/*.vue', { eager: true });

// Создаём объект реестра
export const FenixIcons = {};

// Заполняем реестр
Object.entries(iconsModules).forEach(([path, module]) => {
    const iconName = path
        .replace('./icons/', '')
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

// Зарегистрировать все иконки глобально (опционально)
export const registerIcons = (app) => {
    Object.entries(FenixIcons).forEach(([name, component]) => {
        app.component(name, component);
    });
};
