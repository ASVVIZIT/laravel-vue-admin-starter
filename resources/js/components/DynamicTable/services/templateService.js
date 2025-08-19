// resources/js/services/templateService.js

import Resource from '../api/resource';

const templateResource = new Resource('templates');

export const templateService = {
    /**
     * Получение списка шаблонов
     */
    async list(params = {}) {
        try {
            const response = await templateResource.list(params);
            return response;
        } catch (error) {
            console.error('Ошибка загрузки шаблонов:', error);
            throw error;
        }
    },

    /**
     * Получение шаблона по ID
     */
    async get(id) {
        try {
            const response = await templateResource.get(id);
            return this.formatTemplateResponse(response);
        } catch (error) {
            console.error('Ошибка загрузки шаблона:', error);
            throw error;
        }
    },

    /**
     * Создание нового шаблона
     */
    async create(data) {
        try {
            const response = await templateResource.store(data);
            return this.formatTemplateResponse(response);
        } catch (error) {
            console.error('Ошибка создания шаблона:', error);
            throw error;
        }
    },

    /**
     * Обновление шаблона
     */
    async update(id, data) {
        try {
            const response = await templateResource.update(id, data);
            return this.formatTemplateResponse(response);
        } catch (error) {
            console.error('Ошибка обновления шаблона:', error);
            throw error;
        }
    },

    /**
     * Удаление шаблона
     */
    async delete(id) {
        try {
            await templateResource.destroy(id);
            return { id };
        } catch (error) {
            console.error('Ошибка удаления шаблона:', error);
            throw error;
        }
    },

    /**
     * Форматирование ответа шаблона
     */
    formatTemplateResponse(response) {
        // Если это массив (например, при получении списка), возвращаем как есть
        if (Array.isArray(response)) {
            return response.map(item => this.formatTemplateResponse(item));
        }

        // Если это объект со свойством data (стандартный ответ API)
        if (response && response.data) {
            return this.formatTemplateResponse(response.data);
        }

        // Форматируем шаблон
        return {
            id: response.id,
            name: response.name,
            columns: response.columns.map(column => {
                const formattedColumn = {
                    id: column.id,
                    tempId: column.id || Date.now(),
                    type: column.type,
                    label: column.label,
                    order: column.order,
                    options: column.options || []
                };

                // Добавляем специфичные данные для каждого типа
                switch (column.type) {
                    case 'reference':
                        // Парсим reference, если это строка
                        if (typeof column.reference === 'string') {
                            try {
                                formattedColumn.reference = JSON.parse(column.reference);
                            } catch (e) {
                                formattedColumn.reference = {
                                    entityType: '',
                                    displayFormat: ''
                                };
                            }
                        } else {
                            formattedColumn.reference = column.reference || {
                                entityType: '',
                                displayFormat: ''
                            };
                        }
                        break;

                    case 'boolean':
                        // Парсим booleanSettings, если это строка
                        if (typeof column.booleanSettings === 'string') {
                            try {
                                formattedColumn.booleanSettings = JSON.parse(column.booleanSettings);
                            } catch (e) {
                                formattedColumn.booleanSettings = {
                                    displayType: 'toggle',
                                    trueLabel: 'Да',
                                    falseLabel: 'Нет'
                                };
                            }
                        } else {
                            formattedColumn.booleanSettings = column.booleanSettings || {
                                displayType: 'toggle',
                                trueLabel: 'Да',
                                falseLabel: 'Нет'
                            };
                        }
                        break;

                    case 'date':
                    case 'datetime':
                        formattedColumn.dateFormat = column.dateFormat ||
                            (column.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
                        break;
                }

                return formattedColumn;
            })
        };
    }
};
