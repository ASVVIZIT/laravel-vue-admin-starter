/**
 * resources/js/components/DynamicTable/services/templateBuilderService.js
 * @service templateBuilderService
 *
 * Сервис для работы с шаблонами динамических таблиц.
 * Содержит методы для загрузки, сохранения и обработки шаблонов.
 *
 * Использует templateApi для взаимодействия с API.
 *
 * Основные функции:
 * - Загрузка шаблона
 * - Сохранение шаблона
 * - Создание примерных данных для предпросмотра
 * - Генерация временных ID
 */

import { templateApi } from '../api/templateApi';
import {
    getEntityTypes,
    getReferenceFields,
    getReferenceData,
    clearCache,
} from '../services/referenceService';
import { generateTempId, getExampleFormat, formatReferenceDisplay } from '../utils/templateBuilderUtils';

/**
 * Загружает шаблон по ID
 *
 * @param {number|string} id - ID шаблона
 * @returns {Promise<Object>} Загруженный шаблон
 * @throws {Error} При ошибке загрузки
 */
export const loadTemplate = async (id) => {
    try {
        const response = await templateApi.get(id);
        return formatTemplateResponse(response);
    } catch (error) {
        console.error(`Ошибка загрузки шаблона ${id}:`, error);
        throw new Error(`Не удалось загрузить шаблон: ${error.message}`);
    }
};

/**
 * Сохраняет шаблон
 *
 * @param {Object} templateData - Данные шаблона для сохранения
 * @returns {Promise<Object>} Сохраненный шаблон
 * @throws {Error} При ошибке сохранения
 */
export const saveTemplate = async (templateData) => {
    try {
        if (templateData.id) {
            return await templateApi.update(templateData.id, templateData);
        } else {
            return await templateApi.create(templateData);
        }
    } catch (error) {
        console.error('Ошибка сохранения шаблона:', error);
        throw new Error(`Не удалось сохранить шаблон: ${error.message}`);
    }
};

/**
 * Форматирует ответ API в структуру, понятную компоненту
 *
 * @param {Object} response - Ответ от API
 * @returns {Object} Отформатированный шаблон
 */
export const formatTemplateResponse = (response) => {
    // Если это массив (например, при получении списка), возвращаем как есть
    if (Array.isArray(response)) {
        return response.map(item => formatTemplateResponse(item));
    }

    // Если это объект со свойством data (стандартный ответ API)
    if (response && response.data) {
        return formatTemplateResponse(response.data);
    }

    // Форматируем колонки
    const formatted = {
        ...response,
        columns: (response.columns || []).map(col => ({
            ...col,
            tempId: col.tempId || col.id || generateTempId(),
            booleanSettings: col.type === 'boolean' ? (col.booleanSettings || {
                displayType: 'toggle',
                trueLabel: 'Да',
                falseLabel: 'Нет'
            }) : undefined,
            reference: col.type === 'reference' ? (col.reference || {
                entityType: '',
                displayFormat: ''
            }) : undefined,
            options: col.options || [],
            dataType: col.dataType || 'string',
            unit: col.unit || '',
            dateFormat: col.dateFormat || 'DD.MM.YYYY'
        }))
    };

    return formatted;
};

/**
 * Создает данные для предпросмотра
 *
 * @param {Object} template - Шаблон
 * @param {number} [rowCount=10] - Количество строк для предпросмотра
 * @returns {Array} Данные для предпросмотра
 */
export const createPreviewData = async (template, rowCount = 10) => {
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
        const rowData = {};

        for (const column of template.columns) {
            let exampleValue;

            switch (column.type) {
                case 'text':
                    exampleValue = `Пример текста ${i+1}`;
                    break;
                case 'number':
                    exampleValue = 100 + i;
                    break;
                case 'select':
                    exampleValue = column.options && column.options.length > 0 ? column.options[0] : `Выбор ${i+1}`;
                    break;
                case 'date':
                    exampleValue = i === 0 ? '2023-10-27' : '2024-01-15';
                    break;
                case 'datetime':
                    exampleValue = i === 0 ? '2023-10-27 10:30' : '2024-01-15 15:45';
                    break;
                case 'boolean':
                    exampleValue = i % 2 === 0;
                    break;
                case 'reference':
                    if (column.reference?.entityType) {
                        try {
                            // Загружаем данные справочника
                            const referenceData = await referenceService.getReferenceData(column.reference.entityType);

                            // Берем элемент из данных справочника или создаем примерный
                            const item = referenceData[i] || {
                                id: i + 1,
                                name: `Пример ${i + 1}`
                            };

                            // Форматируем отображение
                            exampleValue = formatReferenceDisplay(item, column);
                        } catch (error) {
                            console.error(`Ошибка загрузки данных справочника ${column.reference.entityType}:`, error);
                            exampleValue = { id: i + 1, name: `Ошибка: ${error.message}` };
                        }
                    } else {
                        exampleValue = { id: i + 1, name: 'Выберите справочник' };
                    }
                    break;
                default:
                    exampleValue = column.type;
            }

            rowData[column.tempId] = exampleValue;
        }

        rows.push({ rowData, order: i });
    }

    return rows;
};

/**
 * Создает новый шаблон с колонкой заданного типа
 *
 * @param {string} type - Тип колонки
 * @returns {Object} Новая колонка
 */
export const createColumn = (type) => {
    const baseColumn = {
        tempId: generateTempId(),
        type: type,
        label: `Колонка ${Date.now()}`,
        order: 0
    };

    switch (type) {
        case 'text':
            return {
                ...baseColumn,
                dataType: 'string'
            };

        case 'number':
            return {
                ...baseColumn,
                unit: ''
            };

        case 'select':
            return {
                ...baseColumn,
                options: ['Вариант 1', 'Вариант 2']
            };

        case 'date':
        case 'datetime':
            return {
                ...baseColumn,
                dateFormat: type === 'datetime' ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'
            };

        case 'boolean':
            return {
                ...baseColumn,
                booleanSettings: {
                    displayType: 'toggle',
                    trueLabel: 'Да',
                    falseLabel: 'Нет'
                }
            };

        case 'reference':
            return {
                ...baseColumn,
                reference: {
                    entityType: '',
                    displayFormat: ''
                }
            };

        default:
            return baseColumn;
    }
};
