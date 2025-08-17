// resources/js/components/DynamicTable/utils/booleanUtils.js

/**
 * Безопасное получение настроек для boolean-колонки
 * @param {Object} column - Объект колонки
 * @param {string} setting - Название настройки ('displayType', 'trueLabel', 'falseLabel')
 * @returns {string|boolean} Значение настройки или значение по умолчанию
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

    // Возвращаем значение или значение по умолчанию
    return column.booleanSettings[setting] ||
        (setting === 'displayType' ? 'toggle' :
            setting === 'trueLabel' ? 'Да' : 'Нет');
};

/**
 * Парсинг различных представлений булевых значений в стандартное булево значение
 * @param {any} value - Значение для парсинга
 * @returns {boolean|null} - Стандартное булево значение или null
 */
export const parseBooleanValue = (value) => {
    // Список значений, которые считаются истиной
    const trueValues = [
        true,
        1,
        'true',
        '1',
        'yes',
        'да'
    ];

    // Список значений, которые считаются ложью
    const falseValues = [
        false,
        0,
        'false',
        '0',
        'no',
        'нет',
        null,
        undefined,
        ''
    ];

    // Проверяем, является ли значение истиной
    if (trueValues.some(v =>
        v === value ||
        (typeof v === 'string' && typeof value === 'string' && v.toLowerCase() === value.toLowerCase())
    )) {
        return true;
    }

    // Проверяем, является ли значение ложью
    if (falseValues.some(v =>
        v === value ||
        (v === null && value === null) ||
        (v === undefined && value === undefined) ||
        (typeof v === 'string' && typeof value === 'string' && v.toLowerCase() === value.toLowerCase())
    )) {
        return false;
    }

    // Если значение не распознано, возвращаем null
    return null;
};

/**
 * Получить отображаемое значение для булевого поля
 * @param {boolean|null} value - Значение поля
 * @param {Object} column - Объект колонки
 * @returns {string} Отображаемое значение
 */
export const getBooleanDisplayValue = (value, column) => {
    const boolValue = parseBooleanValue(value);

    if (boolValue === true) {
        return getBooleanSetting(column, 'trueLabel');
    } else if (boolValue === false) {
        return getBooleanSetting(column, 'falseLabel');
    }
    return '—';
};

// Метод для установки значений boolean-настроек
export const setBooleanSetting = (column, setting, value) => {
    // Инициализируем booleanSettings, если не определен
    if (!column.booleanSettings) {
        column.booleanSettings = {
            displayType: 'toggle',
            trueLabel: 'Да',
            falseLabel: 'Нет'
        };
    }

    // Устанавливаем значение
    column.booleanSettings[setting] = value;
};
