/**
 * @utils templateBuilderUtils
 *
 * Вспомогательные функции для работы с шаблонами.
 *
 * Основные функции:
 * - Генерация временных ID
 * - Форматирование отображения справочников
 * - Получение примера формата
 */

/**
 * Генерирует уникальный временный ID
 *
 * @returns {string} Уникальный ID
 */
export const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Форматирует отображение справочника на основе шаблона
 *
 * @param {Object} item - Элемент справочника
 * @param {Object} column - Колонка с настройками
 * @returns {string} Отформатированная строка
 */
export const formatReferenceDisplay = (item, column) => {
    if (!item || !column?.reference?.displayFormat) {
        return '...';
    }

    try {
        let format = column.reference.displayFormat;

        // Заменяем все поля вида {field} на соответствующие значения
        return format.replace(/\{(\w+)\}/g, (match, key) => {
            // Проверяем, есть ли такое поле в элементе
            if (item.hasOwnProperty(key)) {
                return item[key];
            }

            // Если поле не найдено, возвращаем оригинальную строку
            return match;
        });
    } catch (e) {
        console.warn('Ошибка форматирования отображения справочника:', e);
        return 'Ошибка формата';
    }
};

/**
 * Получает пример формата для справочника
 *
 * @param {string} entityType - Тип справочника
 * @returns {string} Пример формата
 */
export const getExampleFormat = (entityType) => {
    switch(entityType) {
        case 'accessory': return '{name} ({model})';
        case 'brand': return '{name} ({country})';
        default: return '{id} - {name}';
    }
};

/**
 * Валидирует название шаблона
 *
 * @param {string} name - Название шаблона
 * @returns {Object} Результат валидации { isValid: boolean, error: string|null }
 */
export const validateTemplateName = (name) => {
    const trimmed = name.trim();

    if (!trimmed) {
        return { isValid: false, error: 'Название шаблона не может быть пустым' };
    }

    if (trimmed.length < 3) {
        return { isValid: false, error: 'Название шаблона должно быть не короче 3 символов' };
    }

    if (trimmed.length > 100) {
        return { isValid: false, error: 'Название шаблона должно быть не длиннее 100 символов' };
    }

    return { isValid: true, error: null };
};

/**
 * Получает название типа колонки
 *
 * @param {string} type - Тип колонки
 * @param {Array} columnTypes - Список доступных типов колонок
 * @returns {string} Название типа колонки
 */
export const getColumnTypeName = (type, columnTypes) => {
    const found = columnTypes.find(t => t.value === type);
    return found ? found.label : type;
};

/**
 * Проверяет, является ли колонка активной
 *
 * @param {Object} column - Колонка
 * @param {number|null} activeIndex - Индекс активной колонки
 * @param {number} currentIndex - Текущий индекс колонки
 * @returns {boolean} Является ли колонка активной
 */
export const isColumnActive = (column, activeIndex, currentIndex) => {
    return activeIndex === currentIndex;
};
