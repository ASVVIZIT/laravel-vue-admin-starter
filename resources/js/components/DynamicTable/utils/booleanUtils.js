/**
 * @utils booleanUtils
 *
 * Вспомогательные функции для работы с булевыми колонками.
 *
 * Основные функции:
 * - Получение настроек булевой колонки
 * - Установка настроек булевой колонки
 * - Парсинг булевых значений
 */

/**
 * Получает значение настройки булевой колонки
 *
 * @param {Object} column - Колонка
 * @param {string} setting - Название настройки
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {*} Значение настройки
 */
export const getBooleanSetting = (column, setting, defaultValue = null) => {
    if (!column || column.type !== 'boolean' || !column.booleanSettings) {
        return defaultValue;
    }

    return column.booleanSettings[setting] !== undefined
        ? column.booleanSettings[setting]
        : defaultValue;
};

/**
 * Устанавливает значение настройки булевой колонки
 *
 * @param {Object} column - Колонка
 * @param {string} setting - Название настройки
 * @param {*} value - Значение настройки
 * @returns {Object} Обновленная колонка
 */
export const setBooleanSetting = (column, setting, value) => {
    if (!column || column.type !== 'boolean') {
        return column;
    }

    // Создаем копию колонки и настроек
    const updatedColumn = { ...column };
    updatedColumn.booleanSettings = {
        ...(updatedColumn.booleanSettings || {}),
        [setting]: value
    };

    return updatedColumn;
};

/**
 * Парсит значение в булево значение
 *
 * @param {*} value - Значение для парсинга
 * @returns {boolean|null} Булево значение или null
 */
export const parseBooleanValue = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'да' || lower === 'yes') return true;
        if (lower === 'false' || lower === 'нет' || lower === 'no') return false;
    }

    if (typeof value === 'number') {
        return value !== 0;
    }

    return null;
};

/**
 * Форматирует отображение булевого значения
 * @param {any} value - Значение для форматирования
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
