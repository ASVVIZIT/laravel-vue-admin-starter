// utils/referenceUtils.js

/**
 * Безопасный доступ к настройкам boolean
 * @param {Object} column - Объект колонки
 * @param {string} setting - Название настройки
 * @returns {*} Значение настройки
 */
export const getBooleanSetting = (column, setting) => {
    // Безопасный доступ к настройкам boolean
    if (!column.booleanSettings) {
        // Инициализируем, если не определен
        column.booleanSettings = {
            displayType: 'toggle',
            trueLabel: 'Да',
            falseLabel: 'Нет'
        };
    }
    return column.booleanSettings[setting];
};

/**
 * Форматирование отображения справочника
 * @param {Object} item - Объект элемента справочника
 * @param {Object} column - Объект колонки
 * @returns {string} Отформатированное значение для отображения
 */
export const formatReferenceDisplay = (item, column) => {
    // Если колонка не содержит конфигурации справочника, возвращаем пустую строку
    if (!column || !column.reference || !column.reference.displayFormat || !column.reference.entityType) {
        return getExampleFormat(column.reference?.entityType || 'accessory');
    }

    let display = column.reference.displayFormat;
    const keys = getAvailableKeys(column.reference.entityType);

    keys.forEach(key => {
        // Ищем ключ в формате
        const regex = new RegExp(`{${key.key}}`, 'g');
        let value = getNestedValue(item, key.key);
        display = display.replace(regex, value || '');
    });

    // Убираем лишние пробелы и скобки
    display = display.replace(/\s+/g, ' ').trim();
    display = display.replace(/\(\s*\)/g, '');
    display = display.replace(/\s+\)/g, ')');
    display = display.replace(/\(\s+/g, '(');

    return display;
};

/**
 * Получение примера формата для справочника
 * @param {string} entityType - Тип сущности справочника
 * @returns {string} Пример формата отображения
 */
export const getExampleFormat = (entityType) => {
    const examples = {
        accessory: '{brand.name} {model} ({series})',
        brand: '{name} ({country})',
        device_type: '{name} - {code}'
    };

    return examples[entityType] || '{name}';
};

/**
 * Получение доступных ключей для справочника
 * @param {string} entityType - Тип сущности справочника
 * @returns {Array} Массив доступных ключей
 */
export const getAvailableKeys = (entityType) => {
    const configs = {
        accessory: [
            { key: 'brand.name', label: 'Бренд' },
            { key: 'model', label: 'Модель' },
            { key: 'series', label: 'Серия' },
            { key: 'name', label: 'Название' }
        ],
        brand: [
            { key: 'name', label: 'Название' },
            { key: 'country', label: 'Страна' },
            { key: 'website', label: 'Веб-сайт' }
        ],
        device_type: [
            { key: 'name', label: 'Название' },
            { key: 'code', label: 'Код' }
        ]
    };

    return configs[entityType] || [];
};

/**
 * Получение вложенного значения по пути (brand.name)
 * @param {Object} obj - Объект, из которого нужно получить значение
 * @param {string} path - Путь к значению (например, 'brand.name')
 * @returns {*} Значение по указанному пути
 */
export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : '';
    }, obj);
};

/**
 * Парсинг булевых значений из разных форматов
 * @param {*} value - Значение для парсинга
 * @returns {boolean|null} Парсированное булево значение
 */
export const parseBooleanValue = (value) => {
    const trueValues = [true, 1, 'true', '1', 'yes', 'да'];
    const falseValues = [false, 0, 'false', '0', 'no', 'нет', null, 'null', ''];

    if (inArray(value, trueValues)) {
        return true;
    } else if (inArray(value, falseValues)) {
        return false;
    }

    return null;
};

/**
 * Проверка наличия значения в массиве
 * @param {*} value - Проверяемое значение
 * @param {Array} array - Массив для проверки
 * @returns {boolean} true, если значение найдено в массиве
 */
const inArray = (value, array) => {
    return array.some(item => {
        if (typeof item === 'string' && typeof value === 'string') {
            return item.toLowerCase() === value.toLowerCase();
        }
        return item === value;
    });
};
