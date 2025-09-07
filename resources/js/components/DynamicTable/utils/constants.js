/**
 * @utils constants
 *
 * Константы для работы с шаблонами.
 *
 * Основные константы:
 * - Типы колонок
 * - Типы данных для текстовых колонок
 * - Форматы даты
 */

/**
 * Типы колонок
 * @type {Array}
 */
export const columnTypes = [
    { value: 'text', label: 'Текст' },
    { value: 'number', label: 'Число' },
    { value: 'select', label: 'Выбор' },
    { value: 'date', label: 'Дата' },
    { value: 'datetime', label: 'Дата и время' },
    { value: 'boolean', label: 'Да/Нет' },
    { value: 'reference', label: 'Справочник' },
];

/**
 * Типы данных для текстовых колонок
 * @type {Array}
 */
export const textDataTypes = [
    { value: 'string', label: 'Строка' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
];

/**
 * Форматы даты
 * @type {Array}
 */
export const dateFormats = [
    { value: 'YYYY-MM-DD', label: 'ГГГГ-ММ-ДД', example: '2023-10-27' },
    { value: 'DD.MM.YYYY', label: 'ДД.ММ.ГГГГ', example: '27.10.2023' },
    { value: 'MM/DD/YYYY', label: 'ММ/ДД/ГГГГ', example: '10/27/2023' },
    { value: 'DD MMM YYYY', label: 'ДД МММ ГГГГ', example: '27 Oct 2023' },
    { value: 'YYYY-MM-DD HH:mm', label: 'ГГГГ-ММ-ДД ЧЧ:мм', example: '2023-10-27 14:30' },
    { value: 'DD.MM.YYYY HH:mm', label: 'ДД.ММ.ГГГГ ЧЧ:мм', example: '27.10.2023 14:30' },
];
