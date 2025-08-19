// resources/js/components/DynamicTable/utils/dateUtils.js
import dayjs from 'dayjs';

// Форматирование отображения даты
export function formatDateDisplay(value, column) {
    if (!value || column.type !== 'date') {
        return value;
    }

    const dateFormat = column.dateFormat || column.date_format || 'YYYY-MM-DD';
    return dayjs(value).format(convertDateFormat(dateFormat));
}

// Пример отображения даты
export function formatDateExample(format) {
    const exampleDate = new Date();
    return dayjs(exampleDate).format(convertDateFormat(format));
}

// Конвертация формата даты для dayjs
export function convertDateFormat(format) {
    const replacements = {
        'YYYY': 'YYYY',
        'YY': 'YY',
        'MMMM': 'MMMM',
        'MMM': 'MMM',
        'MM': 'MM',
        'M': 'M',
        'DDDD': 'DDDD',
        'DDD': 'DDD',
        'DD': 'DD',
        'D': 'D',
        'HH': 'HH',
        'H': 'H',
        'hh': 'hh',
        'h': 'h',
        'mm': 'mm',
        'm': 'm',
        'ss': 'ss',
        's': 's',
        'A': 'A',
        'a': 'a'
    };

    let convertedFormat = format;
    for (const [key, value] of Object.entries(replacements)) {
        convertedFormat = convertedFormat.replace(key, value);
    }

    return convertedFormat;
}

// Форматирование даты (YYYY-MM-DD)
export function formatDate(date) {
    if (!date) return '';

    // Если это строка, преобразуем в объект Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Форматирование даты и времени (YYYY-MM-DD HH:mm:ss)
export function formatDateTime(date) {
    if (!date) return '';

    // Если это строка, преобразуем в объект Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Пытается распарсить строку даты в объект Date, учитывая несколько распространенных форматов.
 * Это вспомогательная функция для улучшенной обработки входных значений.
 * @param {string} dateString - Строка даты для парсинга.
 * @returns {Date|null} - Объект Date, если парсинг успешен, иначе null.
 */
export function parseFlexibleDate(dateString) {
    if (!dateString) return null;
    // Если уже объект Date и валидный, возвращаем его
    if (dateString instanceof Date && !isNaN(dateString.getTime())) return dateString;

    // 1. Попробуем стандартный конструктор Date
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // 2. Попробуем формат DD-MM-YYYY или DD.MM.YYYY (часто встречается вручную введенными)
    const dmyRegex = /^(\d{1,2})[.\-](\d{1,2})[.\-](\d{4})$/;
    const dmyMatch = dateString.match(dmyRegex);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1; // Месяцы в JS 0-11
        const year = parseInt(dmyMatch[3], 10);
        date = new Date(year, month, day);
        // Проверяем, не произошел ли автокоррekt (например, 32.01.2023 -> 01.02.2023)
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
            return date;
        }
    }

    // 3. Можно добавить другие специфичные форматы по необходимости
    // ...

    // Если ни один формат не подошел
    console.warn(`[parseFlexibleDate] Unable to parse date string: "${dateString}"`);
    return null;
}
