// resources/js/components/DynamicTable/services/mockDataService.js

import { MOCK_ACCESSORIES, MOCK_BRANDS, MOCK_DEVICE_TYPES } from './mockData';

export class MockDataService {
    constructor() {
        this.MAX_ROWS = 50;
        this.mockDataStore = {
            templates: [],
            rows: [],
            nextId: 1
        };
        this.referenceOptions = {
            accessory: MOCK_ACCESSORIES,
            brand: MOCK_BRANDS,
            device_type: MOCK_DEVICE_TYPES
        };

        // Инициализируем моковые данные
        this.initializeMockData();
    }

    /**
     * Генерация моковых данных (на основе шаблона)
     */
    generateMockData(currentTemplate, levels = 2, itemsPerLevel = 5) {
        if (!currentTemplate?.columns) return [];

        const columns = currentTemplate.columns;
        let idCounter = this.mockDataStore.nextId;
        let totalItems = 0;
        const maxTotalItems = this.MAX_ROWS;

        const createLevel = (parentId = null, currentLevel = 0) => {
            // Проверяем, не превысили ли мы максимальное количество строк
            if (totalItems >= maxTotalItems) return [];

            const levelItems = Math.min(itemsPerLevel, maxTotalItems - totalItems);
            totalItems += levelItems;

            return Array.from({ length: levelItems }, (_, i) => {
                const rowId = idCounter++;
                const row = {
                    id: rowId,
                    parent_id: parentId,
                    data: {},
                    children: [],
                    has_children: currentLevel < levels - 1 && totalItems < maxTotalItems,
                    order: i
                };

                // Генерация данных для каждой колонки
                columns.forEach(column => {
                    switch (column.type) {
                        case 'text':
                            row.data[column.label] = `Элемент ${rowId}`;
                            break;
                        case 'select': {
                            // Получаем опции из шаблона
                            const options = column.options || [];

                            if (options.length === 0) {
                                row.data[column.label] = `Вариант ${rowId}`;
                            } else {
                                // Выбираем случайное значение
                                const randomIndex = Math.floor(Math.random() * options.length);
                                row.data[column.label] = options[randomIndex];
                            }
                            break;
                        }
                        case 'reference': {
                            // Для справочников сохраняем ID
                            if (column.reference && column.reference.entityType) {
                                const options = this.referenceOptions[column.reference.entityType] || [];
                                if (options.length > 0) {
                                    const randomIndex = Math.floor(Math.random() * options.length);
                                    row.data[column.label] = options[randomIndex].id;
                                } else {
                                    row.data[column.label] = null;
                                }
                            } else {
                                row.data[column.label] = null;
                            }
                            break;
                        }
                        case 'boolean':
                            row.data[column.label] = Math.random() > 0.5;
                            break;
                        case 'number':
                            row.data[column.label] = Math.floor(Math.random() * 1000) + 100;
                            break;
                        case 'date': {
                            const today = new Date();
                            today.setDate(today.getDate() - Math.floor(Math.random() * 365));
                            row.data[column.label] = this.formatDate(today, column.dateFormat || 'YYYY-MM-DD');
                            break;
                        }
                        default:
                            row.data[column.label] = '';
                    }
                });

                if (row.has_children && totalItems < maxTotalItems) {
                    row.children = createLevel(rowId, currentLevel + 1);
                }

                return row;
            });
        };

        const data = createLevel();

        // Обновляем nextId для следующих генераций
        this.mockDataStore.nextId = idCounter;

        return data;
    }

    /**
     * Создание новой строки в моковом хранилище
     */
    createRow(data) {
        const rowId = this.mockDataStore.nextId++;

        const newRow = {
            id: rowId,
            template_id: data.template_id,
            parent_id: data.parent_id || null,
            data: data.data || {},
            order: data.order !== undefined ? data.order : (this.mockDataStore.rows.filter(r => r.parent_id === data.parent_id).length),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.mockDataStore.rows.push(newRow);
        return newRow;
    }

    /**
     * Обновление строки в моковом хранилище
     */
    updateRow(id, data) {
        const index = this.mockDataStore.rows.findIndex(r => r.id === id);

        if (index === -1) {
            throw new Error('Строка не найдена');
        }

        const updatedRow = {
            ...this.mockDataStore.rows[index],
            ...data,
            data: {
                ...this.mockDataStore.rows[index].data,
                ...data.data
            },
            updated_at: new Date().toISOString()
        };

        this.mockDataStore.rows[index] = updatedRow;
        return updatedRow;
    }

    /**
     * Удаление строки из мокового хранилища
     */
    deleteRow(id) {
        const index = this.mockDataStore.rows.findIndex(r => r.id === id);

        if (index === -1) {
            throw new Error('Строка не найдена');
        }

        // Удаляем дочерние элементы рекурсивно
        const removeChildren = (parentId) => {
            const childIndices = this.mockDataStore.rows
                .map((r, i) => ({ r, i }))
                .filter(({ r }) => r.parent_id === parentId)
                .map(({ i }) => i);

            for (const childIndex of childIndices) {
                removeChildren(this.mockDataStore.rows[childIndex].id);
                this.mockDataStore.rows[childIndex] = null;
            }
        };

        removeChildren(id);
        this.mockDataStore.rows[index] = null;

        // Очищаем null-значения
        this.mockDataStore.rows = this.mockDataStore.rows.filter(r => r !== null);
    }

    /**
     * Получение строк из мокового хранилища
     */
    getRows(params) {
        let filteredRows = [...this.mockDataStore.rows];

        // Фильтрация по шаблону
        if (params.template_id) {
            filteredRows = filteredRows.filter(r => r.template_id == params.template_id);
        }

        // Фильтрация по родителю
        if (params.parent_id !== undefined) {
            filteredRows = filteredRows.filter(r => r.parent_id == params.parent_id);
        }

        // Сортировка
        filteredRows.sort((a, b) => a.order - b.order);

        // Пагинация
        const page = params.page || 1;
        const perPage = params.per_page || 20;
        const startIndex = (page - 1) * perPage;
        const paginatedRows = filteredRows.slice(startIndex, startIndex + perPage);

        return {
            data: paginatedRows,
            meta: {
                current_page: page,
                per_page: perPage,
                total: filteredRows.length,
                last_page: Math.ceil(filteredRows.length / perPage)
            }
        };
    }

    /**
     * Инициализация моковых данных
     */
    initializeMockData() {
        // Создаем несколько моковых шаблонов
        const templates = [
            {
                id: 1,
                name: 'Электроавтоматы',
                columns: [
                    {
                        id: 1,
                        type: 'text',
                        label: 'Наименование',
                        order: 0
                    },
                    {
                        id: 2,
                        type: 'reference',
                        label: 'Производитель',
                        order: 1,
                        reference: {
                            entityType: 'brand',
                            displayFormat: '{name} ({country})'
                        }
                    },
                    {
                        id: 3,
                        type: 'select',
                        label: 'Тип',
                        order: 2,
                        options: ['Автомат', 'УЗО', 'Дифавтомат']
                    },
                    {
                        id: 4,
                        type: 'number',
                        label: 'Номинал, А',
                        order: 3
                    },
                    {
                        id: 5,
                        type: 'boolean',
                        label: 'В наличии',
                        order: 4,
                        booleanSettings: {
                            displayType: 'toggle',
                            trueLabel: 'Да',
                            falseLabel: 'Нет'
                        }
                    },
                    {
                        id: 6,
                        type: 'date',
                        label: 'Дата добавления',
                        order: 5,
                        dateFormat: 'DD.MM.YYYY'
                    }
                ]
            },
            {
                id: 2,
                name: 'Световые приборы',
                columns: [
                    {
                        id: 1,
                        type: 'text',
                        label: 'Модель',
                        order: 0
                    },
                    {
                        id: 2,
                        type: 'reference',
                        label: 'Производитель',
                        order: 1,
                        reference: {
                            entityType: 'brand',
                            displayFormat: '{name}'
                        }
                    },
                    {
                        id: 3,
                        type: 'select',
                        label: 'Тип',
                        order: 2,
                        options: ['Светодиодная лампа', 'Люминесцентная лампа', 'Галогенная лампа']
                    },
                    {
                        id: 4,
                        type: 'number',
                        label: 'Мощность, Вт',
                        order: 3
                    },
                    {
                        id: 5,
                        type: 'boolean',
                        label: 'Диммируемая',
                        order: 4,
                        booleanSettings: {
                            displayType: 'checkbox'
                        }
                    }
                ]
            }
        ];

        this.mockDataStore.templates = templates;

        // Генерируем данные для первого шаблона
        const templateId = templates[0].id;
        const mockData = this.generateMockData(templates[0], 2, 5);

        // Добавляем данные в хранилище
        mockData.forEach(row => {
            this.mockDataStore.rows.push({
                id: row.id,
                template_id: templateId,
                parent_id: row.parent_id,
                data: row.data,
                order: row.order,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        });
    }

    /**
     * Форматирование моковых строк для отображения
     */
    formatRows(rows, template) {
        return rows.map(row => {
            const formattedRow = { ...row };

            // Форматируем данные
            formattedRow.data = {};
            for (const [key, value] of Object.entries(row.data)) {
                const column = template.columns.find(col => col.label === key);

                if (column) {
                    formattedRow.data[key] = this.formatValue(value, column);
                } else {
                    formattedRow.data[key] = value;
                }
            }

            // Добавляем информацию о шаблоне
            formattedRow.template = {
                id: template.id,
                name: template.name
            };

            return formattedRow;
        });
    }

    /**
     * Форматирование значения для моковых данных
     */
    formatValue(value, column) {
        if (value === null || value === undefined) {
            return {
                value: null,
                display: '—'
            };
        }

        switch (column.type) {
            case 'boolean':
                const settings = column.booleanSettings || {
                    displayType: 'toggle',
                    trueLabel: 'Да',
                    falseLabel: 'Нет'
                };

                return {
                    value: value,
                    display: value ? settings.trueLabel : settings.falseLabel
                };

            case 'date':
                return {
                    value: value,
                    display: this.formatDate(value, column.dateFormat || 'DD.MM.YYYY')
                };

            case 'reference':
                if (column.reference && column.reference.entityType) {
                    const options = this.referenceOptions[column.reference.entityType] || [];
                    const item = options.find(opt => opt.id == value);

                    if (item) {
                        return {
                            id: value,
                            display: this.formatReferenceDisplay(item, column)
                        };
                    }
                }

                return {
                    id: value,
                    display: `Элемент #${value}`
                };

            case 'select':
                return {
                    value: value,
                    display: value
                };

            default:
                return {
                    value: value,
                    display: value
                };
        }
    }

    /**
     * Форматирование отображаемого значения для справочника
     */
    formatReferenceDisplay(item, column) {
        if (!column || !column.reference || !column.reference.displayFormat || !column.reference.entityType) {
            return this.getExampleFormat(column.reference?.entityType || 'accessory');
        }

        let display = column.reference.displayFormat;
        const keys = this.getAvailableKeys(column.reference.entityType);

        keys.forEach(key => {
            const regex = new RegExp(`{${key.key}}`, 'g');
            let value = this.getNestedValue(item, key.key);

            display = display.replace(regex, value || '');
        });

        display = display.replace(/\s+/g, ' ').trim();
        display = display.replace(/\(\s*\)/g, '');
        display = display.replace(/\s+\)/g, ')');
        display = display.replace(/\(\s+/g, '(');

        return display;
    }

    /**
     * Получение доступных ключей для справочника
     */
    getAvailableKeys(entityType) {
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
    }

    /**
     * Получение примера формата для справочника
     */
    getExampleFormat(entityType) {
        const examples = {
            accessory: '{brand.name} {model} ({series})',
            brand: '{name} ({country})',
            device_type: '{name} - {code}'
        };

        return examples[entityType] || '{name}';
    }

    /**
     * Получение вложенного значения по пути (brand.name)
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : '';
        }, obj);
    }

    /**
     * Форматирование даты
     */
    formatDate(date, format) {
        if (!date) return '';

        // Если это строка, преобразуем в объект Date
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Проверяем валидность даты
        if (isNaN(dateObj.getTime())) return date;

        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD.MM.YYYY':
                return `${day}.${month}.${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD MMM YYYY':
                return `${day} ${monthNames[dateObj.getMonth()]} ${year}`;
            case 'YYYY/MM/DD':
                return `${year}/${month}/${day}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }

    /**
     * Обновление дерева строк (универсальная реализация)
     */
    updateTree(rows, targetId, updateFn) {
        return rows.map(row => {
            if (row.id === targetId) {
                const updatedRow = updateFn(row);
                // Гарантируем наличие children и has_children
                return {
                    ...updatedRow,
                    children: updatedRow.children || [],
                    has_children: updatedRow.has_children ?? updatedRow.children?.length > 0
                };
            }
            return {
                ...row,
                children: row.children ? this.updateTree(row.children, targetId, updateFn) : []
            };
        });
    }

    /**
     * Загрузка шаблона таблицы
     */
    async fetchTemplate(templateId) {
        const template = this.mockDataStore.templates.find(t => t.id == templateId);
        if (!template) {
            throw new Error('Шаблон не найден');
        }
        return template;
    }

    /**
     * Загрузка данных таблицы
     */
    async fetchTableData(params) {
        return this.getRows(params);
    }

    /**
     * Загрузка дочерних строк
     */
    async fetchChildRows(params) {
        return this.getRows(params);
    }
}
