/**
 * ============================================================================
 * CUSTOM ICONS REGISTRY — Автоматический реестр кастомных иконок
 * ============================================================================
 * 📁 Путь: @/components/I18nChecker/components/icons/
 * ✅ Авто-импорт всех Custom*.vue из текущей папки
 * ✅ Единый подход с FenixIconRegistry
 * ============================================================================
 */

import { markRaw } from 'vue';

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ CUSTOM ИКОНОК ИЗ ТЕКУЩЕЙ ПАПКИ
// ============================================================================
const customIconsModules = import.meta.glob('./Custom*.vue', { eager: true });

// Создаём объект реестра
export const CustomIcons = {};

// Заполняем реестр (с markRaw для оптимизации реактивности)
Object.entries(customIconsModules).forEach(([path, module]) => {
    // Извлекаем имя файла без пути и расширения
    const iconName = path
        .replace('./', '')
        .replace('.vue', '');

    CustomIcons[iconName] = markRaw(module.default);
});

// ============================================================================
// ЭКСПОРТ ВСЕХ ИКОНОК
// ============================================================================
export default CustomIcons;

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получить кастомную иконку по имени
 * Автоматически добавляет префикс "Custom" если его нет
 *
 * @param {String} name - Имя иконки
 * @returns {Component|null}
 *
 * @example
 * getCustomIcon('Translate')       → CustomTranslate
 * getCustomIcon('CustomTranslate') → CustomTranslate
 * getCustomIcon('Unknown')          → null
 */
export const getCustomIcon = (name) => {
    if (!name) return null;

    // Если уже с префиксом Custom
    if (name.startsWith('Custom')) {
        return CustomIcons[name] || null;
    }

    // Добавляем префикс Custom
    const fullName = `Custom${name.charAt(0).toUpperCase() + name.slice(1)}`;
    return CustomIcons[fullName] || null;
};

/**
 * Получить все имена кастомных иконок
 * @returns {Array<String>}
 */
export const getCustomIconNames = () => Object.keys(CustomIcons);

/**
 * Получить количество зарегистрированных иконок
 * @returns {Number}
 */
export const getCustomIconsCount = () => Object.keys(CustomIcons).length;

/**
 * Проверить существование кастомной иконки
 * @param {String} name
 * @returns {Boolean}
 */
export const hasCustomIcon = (name) => !!getCustomIcon(name);

/**
 * Зарегистрировать все кастомные иконки глобально
 * @param {App} app - Vue приложение
 */
export const registerCustomIcons = (app) => {
    Object.entries(CustomIcons).forEach(([name, component]) => {
        app.component(name, component);
    });
};
