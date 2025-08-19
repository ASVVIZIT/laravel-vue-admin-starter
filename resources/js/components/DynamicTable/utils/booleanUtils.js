// resources/js/utils/booleanUtils.js

/**
 * Безопасное получение настроек boolean
 * @param {Object} column - Объект колонки
 * @param {string} setting - Название настройки
 * @returns {*} Значение настройки или значение по умолчанию
 */
export function getBooleanSetting(column, setting) {
    if (!column || column.type !== 'boolean') {
        return null;
    }

    // Если booleanSettings - это строка, попробуем распарсить
    let settings = column.booleanSettings;
    if (typeof settings === 'string') {
        try {
            settings = JSON.parse(settings);
        } catch (e) {
            console.warn('Не удалось распарсить настройки boolean:', e);
            settings = null;
        }
    }

    // Если settings не объект, используем значения по умолчанию
    if (!settings || typeof settings !== 'object') {
        settings = {
            displayType: 'toggle',
            trueLabel: 'Да',
            falseLabel: 'Нет'
        };
    }

    return settings[setting] ||
        (setting === 'displayType' ? 'toggle' :
            setting === 'trueLabel' ? 'Да' : 'Нет');
};

/**
 * Установка значения настройки булевой колонки
 * @param {Object} column - Объект колонки
 * @param {Object} settings - Объект настроек
 */
export function setBooleanSetting(column, settings) {
    if (!column || column.type !== 'boolean') {
        return;
    }

    // Инициализируем booleanSettings, если не существует
    if (!column.booleanSettings || typeof column.booleanSettings === 'string') {
        try {
            // Пытаемся распарсить, если это строка
            column.booleanSettings = typeof column.booleanSettings === 'string'
                ? JSON.parse(column.booleanSettings)
                : {};
        } catch (e) {
            column.booleanSettings = {};
        }
    }

    // Если это не объект, создаем новый объект
    if (typeof column.booleanSettings !== 'object') {
        column.booleanSettings = {};
    }

    // Устанавливаем значения
    column.booleanSettings.displayType = settings.displayType || 'toggle';
    column.booleanSettings.trueLabel = settings.trueLabel || 'Да';
    column.booleanSettings.falseLabel = settings.falseLabel || 'Нет';
}

/**
 * Парсинг различных представлений булевых значений в стандартное булево значение
 * @param {any} value - Значение для парсинга
 * @returns {boolean|null} - Стандартное булево значение или null
 */
export function parseBooleanValue(value) {
    // Список значений, которые считаются истиной
    const trueValues = [true, 1, 'true', '1', 'yes', 'да'];
    // Список значений, которые считаются ложью
    const falseValues = [false, 0, 'false', '0', 'no', 'нет', null, undefined, ''];

    // Проверяем, является ли значение истиной
    if (trueValues.some(v => {
        if (typeof v === 'string' && typeof value === 'string') {
            return v.toLowerCase() === value.toLowerCase();
        }
        return v === value;
    })) {
        return true;
    }

    // Проверяем, является ли значение ложью
    if (falseValues.some(v => {
        if (typeof v === 'string' && typeof value === 'string') {
            return v.toLowerCase() === value.toLowerCase();
        }
        return v === value;
    })) {
        return false;
    }

    // Если значение не распознано, возвращаем null
    return null;
}

/**
 * Форматирование булева значения для отображения
 * @param {*} value - Значение для форматирования
 * @param {Object} column - Объект колонки
 * @returns {string} Отформатированное значение
 */
export const formatBooleanDisplay = (value, column) => {
    // Получаем настройки из колонки
    const settings = column.booleanSettings || {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
    };

    const parsedValue = parseBooleanValue(value);
    if (parsedValue === null) {
        return '—';
    }
    if (settings.displayType === 'text') {
        return parsedValue ? settings.trueLabel : settings.falseLabel;
    }
    return parsedValue ? 'Да' : 'Нет';
};
