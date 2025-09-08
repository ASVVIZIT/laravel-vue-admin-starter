/**
 * resources/js/components/DynamicTable/utils/referenceUtils.js
 * @utils referenceUtils
 *
 * Вспомогательные функции для работы со справочниками.
 *
 * Основные функции:
 * - Форматирование отображения справочника
 * - Получение примера формата
 * - Получение доступных ключей
 * - Получение вложенного значения
 */

/**
 * Форматирование отображения справочника
 * @param {Object} item - Объект данных справочника
 * @param {Object} column - Объект колонки
 * @returns {string} Отформатированная строка
 */
export function formatReferenceDisplay(item, column) {
    // Убедимся, что column и column.reference существуют
    if (!item || !column || !column.reference) {
        return '';
    }

    // Если reference - это строка, парсим её
    let reference = column.reference;
    if (typeof reference === 'string') {
        try {
            reference = JSON.parse(reference);
        } catch (e) {
            reference = { entityType: 'accessory', displayFormat: '{name}' };
        }
    }

    const format = reference.displayFormat || '{name}';

    // Заменяем все {ключ} на соответствующие значения
    return format.replace(/\{([^}]+)\}/g, (match, key) => {
        // === ИСПРАВЛЕНИЕ: Используем getNestedValue из этого же файла ===
        const value = getNestedValue(item, key);
        // === КОНЕЦ ИСПРАВЛЕНИЯ ===
        return value !== undefined && value !== null ? value : match;
    });
}

/**
 * Получение примера формата для типа сущности
 * @param {string} entityType - Тип сущности
 * @returns {string} Пример формата
 */
export function getExampleFormat(entityType) {
    switch (entityType) {
        case 'accessory': return '{id} {brand.name} {type.name} - ({brand.country}) {model} {series}';
        case 'brand': return '{name} ({country})';
        case 'device_type': return '{name} ({code})';
        case 'measurement_category': return '{name} ({description})';
        default: return '{id} - {name}';
    }
}

/**
 * Получение доступных ключей для формата
 * @param {string} entityType - Тип сущности
 * @returns {Array} Массив доступных ключей
 */
export function getAvailableKeys(entityType) {
    switch (entityType) {
        case 'accessory': return ['id', 'name', 'model', 'series', 'brand.name', 'brand.country', 'type.name', 'type.code'];
        case 'brand': return ['id', 'name', 'country', 'website'];
        case 'device_type': return ['id', 'name', 'code'];
        case 'measurement_category': return ['id', 'name', 'description'];
        default: return ['id', 'name'];
    }
}

/**
 * Получение вложенного значения по ключу
 * @param {Object} obj - Объект
 * @param {string} path - Путь к значению (например, 'brand.name')
 * @returns {*} Значение
 */
export function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;

    return path.split('.').reduce((value, key) => {
        return value && value[key] !== undefined ? value[key] : undefined;
    }, obj);
}
