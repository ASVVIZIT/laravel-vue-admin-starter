// resources/js/components/DynamicTable/utils/dateUtils.js
import dayjs from 'dayjs';

/**
 * Получить форматированную дату
 * @param {Date|string} date - Дата для форматирования
 * @param {string} format - Формат даты
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, format) => {
    if (!date) return '';

    // Если это строка, преобразуем в объект Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) return date;

    // Определяем PHP-формат для dayjs
    const formatsMap = {
        'YYYY-MM-DD': 'YYYY-MM-DD',
        'DD.MM.YYYY': 'DD.MM.YYYY',
        'MM/DD/YYYY': 'MM/DD/YYYY',
        'DD MMM YYYY': 'DD MMM YYYY',
        'YYYY/MM/DD': 'YYYY/MM/DD',
        'DD-MM-YYYY': 'DD-MM-YYYY'
    };

    const dayjsFormat = formatsMap[format] || 'YYYY-MM-DD';

    return dayjs(dateObj).format(dayjsFormat);
};

/**
 * Получить пример формата даты
 * @param {string} format - Формат даты
 * @returns {string} Пример отформатированной даты
 */
export const getExampleDateFormat = (format) => {
    return dayjs().format(format || 'YYYY-MM-DD');
};

/**
 * Получить доступные форматы даты
 * @returns {Array} Массив доступных форматов
 */
export const getDateFormats = () => {
    return [
        { value: 'YYYY-MM-DD', label: 'Год-Месяц-День', example: '2023-10-15' },
        { value: 'DD.MM.YYYY', label: 'День.Месяц.Год', example: '15.10.2023' },
        { value: 'MM/DD/YYYY', label: 'Месяц/День/Год', example: '10/15/2023' },
        { value: 'DD MMM YYYY', label: 'День Месяц Год', example: '15 Oct 2023' },
        { value: 'YYYY/MM/DD', label: 'Год/Месяц/День', example: '2023/10/15' },
        { value: 'DD-MM-YYYY', label: 'День-Месяц-Год', example: '15-10-2023' }
    ];
};
