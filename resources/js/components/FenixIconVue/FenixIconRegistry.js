// resources/js/components/FenixIconVue/FenixIconRegistry.js

// ============================================================================
// АВТО-ИМПОРТ ВСЕХ ИКОНОК ИЗ ПАПКИ icons/ (РЕКУРСИВНО)
// ============================================================================
const iconsModules = import.meta.glob('./icons/**/*.vue', { eager: true });

// Создаём объект реестра
export const FenixIcons = {};

// 🔥 Кэш категорий для быстрого доступа
const categoriesCache = {
    main: {},      // { social: [...], maps: [...], i18n: [...] }
    sub: {},       // { 'i18n/core': [...], 'i18n/status': [...] }
    all: {},       // Объединённый: { social: [...], 'i18n/core': [...] }
};

// Заполняем реестр и кэш категорий
Object.entries(iconsModules).forEach(([path, module]) => {
    // Нормализуем путь: ./icons/CATEGORY/.../FileName.vue
    const normalizedPath = path.replace(/^\.\//, '');
    const parts = normalizedPath.split('/');

    // parts[0] = 'icons'
    // parts[1] = CATEGORY (social, maps, ui, i18n)
    // parts[last] = FileName.vue

    if (parts[0] !== 'icons' || parts.length < 3) return;

    // Извлекаем ТОЛЬКО имя файла
    const iconName = parts[parts.length - 1].replace('.vue', '');
    const category = parts[1];

    // Регистрируем иконку
    FenixIcons[iconName] = module.default;

    // Добавляем в основную категорию
    if (!categoriesCache.main[category]) {
        categoriesCache.main[category] = [];
    }
    if (!categoriesCache.main[category].includes(iconName)) {
        categoriesCache.main[category].push(iconName);
    }

    // Если есть подкатегория (i18n/core, i18n/status)
    if (parts.length >= 4) {
        const subCategory = parts[2];
        const subKey = `${category}/${subCategory}`;

        if (!categoriesCache.sub[subKey]) {
            categoriesCache.sub[subKey] = [];
        }
        if (!categoriesCache.sub[subKey].includes(iconName)) {
            categoriesCache.sub[subKey].push(iconName);
        }
    }
});

// 🔥 СОРТИРОВКА для предсказуемого порядка
[categoriesCache.main, categoriesCache.sub].forEach(cache => {
    Object.keys(cache).forEach(key => cache[key].sort());
});

// Объединённый кэш
categoriesCache.all = { ...categoriesCache.main, ...categoriesCache.sub };

// ============================================================================
// ЭКСПОРТ ВСЕХ ИКОНОК
// ============================================================================
export default FenixIcons;

// ============================================================================
// БАЗОВЫЕ ФУНКЦИИ
// ============================================================================

/**
 * Получить иконку по имени
 * @param {String} name
 * @returns {Component|null}
 */
export const getIcon = (name) => FenixIcons[name] || null;

/**
 * Получить все имена иконок (отсортированные)
 * @returns {Array<String>}
 */
export const getIconNames = () => Object.keys(FenixIcons).sort();

/**
 * Проверить существование иконки
 * @param {String} name
 * @returns {Boolean}
 */
export const hasIcon = (name) => !!FenixIcons[name];

/**
 * Получить количество зарегистрированных иконок
 * @returns {Number}
 */
export const getIconsCount = () => Object.keys(FenixIcons).length;

// ============================================================================
// ФУНКЦИИ КАТЕГОРИЙ
// ============================================================================

/**
 * Получить иконки по категории
 * Поддерживает как основные (social), так и подкатегории (i18n/core)
 *
 * @param {String} category - 'social' или 'i18n/core'
 * @returns {Array<String>} - Отсортированный массив имён иконок
 *
 * @example
 * getIconsByCategory('social')      // → ['FenixFacebook', 'FenixInstagram', ...]
 * getIconsByCategory('i18n/core')   // → ['FenixLanguage', 'FenixTranslate']
 */
export const getIconsByCategory = (category) => {
    return [...(categoriesCache.all[category] || [])];
};

/**
 * Получить все основные категории (без подкатегорий)
 * @returns {Array<String>}
 *
 * @example
 * getMainCategories() // → ['i18n', 'maps', 'social', 'ui']
 */
export const getMainCategories = () => {
    return Object.keys(categoriesCache.main).sort();
};

/**
 * Получить подкатегории для основной категории
 * @param {String} mainCategory - 'i18n', 'social' и т.д.
 * @returns {Array<String>}
 *
 * @example
 * getSubCategories('i18n')
 * // → ['actions', 'analysis', 'core', 'editing', 'extras', 'files', 'status']
 */
export const getSubCategories = (mainCategory) => {
    const prefix = `${mainCategory}/`;
    return Object.keys(categoriesCache.sub)
        .filter(key => key.startsWith(prefix))
        .map(key => key.replace(prefix, ''))
        .sort();
};

/**
 * Получить все категории (основные + подкатегории)
 * @returns {Array<String>}
 */
export const getCategories = () => {
    return Object.keys(categoriesCache.all).sort();
};

/**
 * Получить древовидную структуру категорий
 * Удобно для UI с вложенными меню
 *
 * @returns {Object}
 *
 * @example
 * getCategoryTree()
 * // → {
 * //   social: { icons: [...], subCategories: {} },
 * //   i18n: { icons: [...], subCategories: { core: [...], status: [...] } }
 * // }
 */
export const getCategoryTree = () => {
    const tree = {};

    Object.keys(categoriesCache.main).sort().forEach(mainCat => {
        tree[mainCat] = {
            icons: [...categoriesCache.main[mainCat]],
            subCategories: {}
        };

        // Добавляем подкатегории
        const prefix = `${mainCat}/`;
        Object.keys(categoriesCache.sub)
            .filter(key => key.startsWith(prefix))
            .sort()
            .forEach(subKey => {
                const subName = subKey.replace(prefix, '');
                tree[mainCat].subCategories[subName] = [...categoriesCache.sub[subKey]];
            });
    });

    return tree;
};

/**
 * Получить категорию иконки
 * @param {String} iconName
 * @returns {String|null} - Основная категория или null
 */
export const getIconCategory = (iconName) => {
    for (const [category, icons] of Object.entries(categoriesCache.main)) {
        if (icons.includes(iconName)) return category;
    }
    return null;
};

/**
 * Получить полный путь категории иконки (с подкатегорией если есть)
 * @param {String} iconName
 * @returns {String|null} - 'i18n/core' или 'social'
 */
export const getIconCategoryPath = (iconName) => {
    // Сначала ищем в подкатегориях (более специфично)
    for (const [subKey, icons] of Object.entries(categoriesCache.sub)) {
        if (icons.includes(iconName)) return subKey;
    }
    // Потом в основных
    for (const [category, icons] of Object.entries(categoriesCache.main)) {
        if (icons.includes(iconName)) return category;
    }
    return null;
};

// ============================================================================
// ГЛОБАЛЬНАЯ РЕГИСТРАЦИЯ
// ============================================================================

/**
 * Зарегистрировать все иконки глобально (опционально)
 * @param {App} app - Vue приложение
 */
export const registerIcons = (app) => {
    Object.entries(FenixIcons).forEach(([name, component]) => {
        app.component(name, component);
    });
};
