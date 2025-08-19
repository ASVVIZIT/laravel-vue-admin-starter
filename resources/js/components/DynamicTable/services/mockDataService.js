// resources/js/components/DynamicTable/services/mockDataService.js
export class MockDataService {
    constructor() {
        // Инициализация данных
        this.initData();
    }

    initData() {
        // Моковые шаблоны
        this.templates = [
            {
                id: 1,
                name: 'Электрооборудование',
                columns: [
                    {
                        id: 1,
                        tempId: 1,
                        type: 'text',
                        label: 'Наименование',
                        order: 0,
                        dataType: 'string'
                    },
                    {
                        id: 2,
                        tempId: 2,
                        type: 'number',
                        label: 'Количество',
                        order: 1,
                        unit: 'шт.'
                    },
                    {
                        id: 3,
                        tempId: 3,
                        type: 'reference',
                        label: 'Производитель',
                        order: 2,
                        reference: {
                            entityType: 'brand',
                            displayFormat: '{name} ({country})'
                        }
                    },
                    {
                        id: 4,
                        tempId: 4,
                        type: 'date',
                        label: 'Дата поставки',
                        order: 3,
                        dateFormat: 'DD.MM.YYYY'
                    },
                    {
                        id: 5,
                        tempId: 5,
                        type: 'boolean',
                        label: 'В наличии',
                        order: 4,
                        booleanSettings: {
                            displayType: 'toggle',
                            trueLabel: 'Да',
                            falseLabel: 'Нет'
                        }
                    }
                ]
            },
            {
                id: 2,
                name: 'Аксессуары',
                columns: [
                    {
                        id: 6,
                        tempId: 6,
                        type: 'text',
                        label: 'Модель',
                        order: 0,
                        dataType: 'string'
                    },
                    {
                        id: 7,
                        tempId: 7,
                        type: 'number',
                        label: 'Цена',
                        order: 1,
                        unit: 'руб.'
                    },
                    {
                        id: 8,
                        tempId: 8,
                        type: 'select',
                        label: 'Тип',
                        order: 2,
                        options: ['Корпус', 'Крепление', 'Доп. оборудование']
                    }
                ]
            }
        ];

        // Моковые строки таблиц
        this.tableRows = {
            1: [ // Для шаблона 1
                {
                    id: 1,
                    template_id: 1,
                    parent_id: null,
                    data: {
                        'Наименование': 'Автоматический выключатель',
                        'Количество': 5,
                        'Производитель': 1,
                        'Дата поставки': '2023-10-15',
                        'В наличии': true
                    },
                    order: 0,
                    has_children: true,
                    children: [
                        {
                            id: 4,
                            template_id: 1,
                            parent_id: 1,
                            data: {
                                'Наименование': 'ABB SH200',
                                'Количество': 2,
                                'Производитель': 1,
                                'Дата поставки': '2023-10-15',
                                'В наличии': true
                            },
                            order: 0,
                            has_children: false
                        },
                        {
                            id: 5,
                            template_id: 1,
                            parent_id: 1,
                            data: {
                                'Наименование': 'Legrand DX 3',
                                'Количество': 3,
                                'Производитель': 2,
                                'Дата поставки': '2023-10-15',
                                'В наличии': true
                            },
                            order: 1,
                            has_children: false
                        }
                    ]
                },
                {
                    id: 2,
                    template_id: 1,
                    parent_id: null,
                    data: {
                        'Наименование': 'УЗО',
                        'Количество': 3,
                        'Производитель': 2,
                        'Дата поставки': '2023-10-20',
                        'В наличии': true
                    },
                    order: 1,
                    has_children: false
                },
                {
                    id: 3,
                    template_id: 1,
                    parent_id: null,
                    data: {
                        'Наименование': 'Дифавтомат',
                        'Количество': 7,
                        'Производитель': 3,
                        'Дата поставки': '2023-10-25',
                        'В наличии': false
                    },
                    order: 2,
                    has_children: false
                }
            ],
            2: [ // Для шаблона 2
                {
                    id: 6,
                    template_id: 2,
                    parent_id: null,
                    data: {
                        'Модель': 'Корпус IP44',
                        'Цена': 150,
                        'Тип': 'Корпус'
                    },
                    order: 0,
                    has_children: false
                },
                {
                    id: 7,
                    template_id: 2,
                    parent_id: null,
                    data: {
                        'Модель': 'Крепежный комплект',
                        'Цена': 75,
                        'Тип': 'Крепление'
                    },
                    order: 1,
                    has_children: false
                }
            ]
        };

        // Генератор ID
        this.nextTemplateId = 3;
        this.nextRowId = 8;
        this.nextColumnId = 9;

        // Типы справочников
        this.referenceTypes = [
            { value: 'accessory', label: 'Аксессуары' },
            { value: 'brand', label: 'Бренды' },
            { value: 'device_type', label: 'Типы устройств' }
        ];

        // Данные справочников
        this.referenceData = {
            accessory: [
                { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
                { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
                { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' }
            ],
            brand: [
                { id: 1, name: 'ABB', country: 'Швейцария', website: 'https://www.se.com' },
                { id: 2, name: 'Legrand', country: 'Франция', website: 'https://www.legrand.com' },
                { id: 3, name: 'IEK', country: 'Россия', website: 'https://www.iek.ru' }
            ],
            device_type: [
                { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
                { id: 2, name: 'УЗО', code: 'RCD' },
                { id: 3, name: 'Дифавтомат', code: 'RCBO' }
            ]
        };

        // Генератор ID для справочников
        this.nextReferenceId = {
            accessory: 4,
            brand: 4,
            device_type: 4
        };
    }

    // ===========================
    // Методы для работы с шаблонами
    // ===========================

    /**
     * Получение списка шаблонов с пагинацией и поиском
     */
    async listTemplates(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filteredTemplates = [...this.templates];

                // Фильтрация по поиску
                if (params.search) {
                    const search = params.search.toLowerCase();
                    filteredTemplates = filteredTemplates.filter(template =>
                        template.name.toLowerCase().includes(search)
                    );
                }

                // Пагинация
                const page = parseInt(params.page) || 1;
                const perPage = parseInt(params.per_page) || 10;
                const total = filteredTemplates.length;
                const totalPages = Math.ceil(total / perPage);
                const start = (page - 1) * perPage;
                const end = start + perPage;

                const paginatedData = filteredTemplates.slice(start, end);

                resolve({
                    data: paginatedData.map(template => ({
                        id: template.id,
                        name: template.name,
                        columns_count: template.columns.length
                    })),
                    meta: {
                        current_page: page,
                        per_page: perPage,
                        total: total,
                        last_page: totalPages
                    }
                });
            }, 300);
        });
    }

    /**
     * Получение шаблона по ID
     */
    async getTemplate(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const template = this.templates.find(t => t.id === parseInt(id));

                if (!template) {
                    reject(new Error('Template not found'));
                    return;
                }

                // Форматируем колонки в соответствии с API
                const formattedTemplate = {
                    id: template.id,
                    name: template.name,
                    columns: template.columns.map(column => ({
                        id: column.id,
                        type: column.type,
                        label: column.label,
                        options: column.options || [],
                        order: column.order,
                        reference: column.reference ? {
                            entityType: column.reference.entityType,
                            displayFormat: column.reference.displayFormat
                        } : null,
                        booleanSettings: column.booleanSettings ? {
                            displayType: column.booleanSettings.displayType,
                            trueLabel: column.booleanSettings.trueLabel,
                            falseLabel: column.booleanSettings.falseLabel
                        } : null,
                        dateFormat: column.dateFormat
                    }))
                };

                resolve(formattedTemplate);
            }, 200);
        });
    }

    /**
     * Создание нового шаблона
     */
    async createTemplate(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTemplate = {
                    id: this.nextTemplateId++,
                    name: data.name,
                    columns: data.columns.map((column, index) => ({
                        id: this.nextColumnId++,
                        tempId: column.tempId || Date.now() + index,
                        type: column.type,
                        label: column.label,
                        options: column.options || [],
                        order: column.order || index,
                        reference: column.reference,
                        booleanSettings: column.booleanSettings,
                        dateFormat: column.dateFormat
                    }))
                };

                this.templates.push(newTemplate);

                // Создаем пустую структуру для строк таблицы
                this.tableRows[newTemplate.id] = [];

                resolve({
                    id: newTemplate.id,
                    name: newTemplate.name,
                    columns: newTemplate.columns
                });
            }, 300);
        });
    }

    /**
     * Обновление шаблона
     */
    async updateTemplate(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.templates.findIndex(t => t.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Template not found'));
                    return;
                }

                // Обрабатываем удаление колонок
                const oldColumns = this.templates[index].columns;
                const oldColumnIds = oldColumns.map(c => c.id);
                const newColumnIds = data.columns.map(c => c.id).filter(id => id);

                const columnsToDelete = oldColumnIds.filter(id => !newColumnIds.includes(id));

                // Удаляем колонки из строк таблицы
                if (columnsToDelete.length > 0 && this.tableRows[id]) {
                    this.tableRows[id] = this.tableRows[id].map(row => {
                        const newData = { ...row.data };

                        // Находим метки колонок для удаления
                        const columnsToDeleteLabels = oldColumns
                            .filter(col => columnsToDelete.includes(col.id))
                            .map(col => col.label);

                        columnsToDeleteLabels.forEach(label => {
                            delete newData[label];
                        });

                        return {
                            ...row,
                            data: newData
                        };
                    });
                }

                // Обновляем шаблон
                this.templates[index] = {
                    id: parseInt(id),
                    name: data.name,
                    columns: data.columns.map((column, index) => ({
                        id: column.id || this.nextColumnId++,
                        tempId: column.tempId || Date.now() + index,
                        type: column.type,
                        label: column.label,
                        options: column.options || [],
                        order: column.order || index,
                        reference: column.reference,
                        booleanSettings: column.booleanSettings,
                        dateFormat: column.dateFormat
                    }))
                };

                resolve(this.templates[index]);
            }, 300);
        });
    }

    /**
     * Удаление шаблона
     */
    async deleteTemplate(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.templates.findIndex(t => t.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Template not found'));
                    return;
                }

                // Удаляем строки таблицы
                delete this.tableRows[id];

                // Удаляем шаблон
                const template = this.templates[index];
                this.templates.splice(index, 1);

                resolve({
                    message: `Шаблон '${template.name}' успешно удален`,
                    id: template.id
                });
            }, 200);
        });
    }

    // ===========================
    // Методы для работы со строками таблиц
    // ===========================

    /**
     * Получение строк таблицы с пагинацией
     */
    async getTableRows(params) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const templateId = parseInt(params.template_id);

                if (!this.tableRows[templateId]) {
                    reject(new Error('Template not found'));
                    return;
                }

                let rows = [...this.tableRows[templateId]];

                // Фильтрация по родительскому ID
                if (params.parent_id !== undefined) {
                    const parentId = params.parent_id === 'null' ? null : parseInt(params.parent_id);

                    // Если запрашиваются дочерние элементы
                    if (parentId !== null) {
                        rows = rows.filter(row => row.parent_id === parentId);
                    } else {
                        // Если запрашиваются корневые элементы
                        rows = rows.filter(row => row.parent_id === null);
                    }
                } else {
                    // По умолчанию - корневые элементы
                    rows = rows.filter(row => row.parent_id === null);
                }

                // Пагинация
                const page = parseInt(params.page) || 1;
                const perPage = parseInt(params.per_page) || 10;
                const total = rows.length;
                const totalPages = Math.ceil(total / perPage);
                const start = (page - 1) * perPage;
                const end = start + perPage;

                const paginatedData = rows.slice(start, end);

                resolve({
                    data: this.formatRowsForResponse(paginatedData),
                    meta: {
                        current_page: page,
                        per_page: perPage,
                        total: total,
                        last_page: totalPages
                    }
                });
            }, 300);
        });
    }

    /**
     * Получение конкретной строки
     */
    async getTableRow(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let foundRow = null;

                // Ищем строку во всех шаблонах
                Object.values(this.tableRows).forEach(rows => {
                    const row = rows.find(r => r.id === parseInt(id));
                    if (row) foundRow = row;
                });

                if (!foundRow) {
                    reject(new Error('Row not found'));
                    return;
                }

                // Форматируем ответ
                resolve(this.formatRowForResponse(foundRow));
            }, 200);
        });
    }

    /**
     * Создание новой строки
     */
    async createTableRow(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const templateId = parseInt(data.template_id);

                if (!this.templates.some(t => t.id === templateId)) {
                    reject(new Error('Template not found'));
                    return;
                }

                // Генерируем новый ID
                const newId = this.nextRowId++;

                // Создаем новую строку
                const newRow = {
                    id: newId,
                    template_id: templateId,
                    parent_id: data.parent_id || null,
                    data: data.data,
                    order: data.order !== undefined ? data.order : (this.tableRows[templateId]?.filter(r => r.parent_id === data.parent_id).length || 0),
                    has_children: false
                };

                // Добавляем строку
                if (!this.tableRows[templateId]) {
                    this.tableRows[templateId] = [];
                }

                this.tableRows[templateId].push(newRow);

                resolve(this.formatRowForResponse(newRow));
            }, 300);
        });
    }

    /**
     * Обновление строки
     */
    async updateTableRow(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let targetRow = null;
                let templateId = null;

                // Ищем строку
                for (const [tid, rows] of Object.entries(this.tableRows)) {
                    const index = rows.findIndex(r => r.id === parseInt(id));
                    if (index !== -1) {
                        targetRow = rows[index];
                        templateId = parseInt(tid);
                        break;
                    }
                }

                if (!targetRow) {
                    reject(new Error('Row not found'));
                    return;
                }

                // Обновляем данные
                const updatedRow = {
                    ...targetRow,
                    data: {
                        ...targetRow.data,
                        ...data.data
                    },
                    order: data.order !== undefined ? data.order : targetRow.order
                };

                // Обновляем строку
                const index = this.tableRows[templateId].findIndex(r => r.id === parseInt(id));
                this.tableRows[templateId][index] = updatedRow;

                resolve(this.formatRowForResponse(updatedRow));
            }, 300);
        });
    }

    /**
     * Удаление строки
     */
    async deleteTableRow(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let templateId = null;

                // Ищем строку и удаляем её
                for (const [tid, rows] of Object.entries(this.tableRows)) {
                    const index = rows.findIndex(r => r.id === parseInt(id));
                    if (index !== -1) {
                        // Удаляем дочерние строки
                        const childrenIds = rows
                            .filter(r => r.parent_id === parseInt(id))
                            .map(r => r.id);

                        childrenIds.forEach(childId => {
                            const childIndex = rows.findIndex(r => r.id === childId);
                            if (childIndex !== -1) {
                                rows.splice(childIndex, 1);
                            }
                        });

                        // Удаляем саму строку
                        rows.splice(index, 1);
                        templateId = parseInt(tid);
                        break;
                    }
                }

                if (templateId === null) {
                    reject(new Error('Row not found'));
                    return;
                }

                resolve({ success: true });
            }, 300);
        });
    }

    // ===========================
    // Методы для работы со справочниками
    // ===========================

    /**
     * Получение списка типов справочников
     */
    async getReferenceTypes() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [...this.referenceTypes]
                });
            }, 100);
        });
    }

    /**
     * Получение данных справочника по типу
     */
    async getReferenceData(entityType) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.referenceData[entityType]) {
                    reject(new Error('Invalid reference type'));
                    return;
                }

                resolve({
                    data: [...this.referenceData[entityType]]
                });
            }, 200);
        });
    }

    /**
     * Создание нового элемента справочника
     */
    async createReferenceItem(entityType, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.referenceData[entityType]) {
                    reject(new Error('Invalid reference type'));
                    return;
                }

                const newItem = {
                    id: this.nextReferenceId[entityType]++,
                    ...data
                };

                this.referenceData[entityType].push(newItem);

                resolve(newItem);
            }, 200);
        });
    }

    /**
     * Обновление элемента справочника
     */
    async updateReferenceItem(entityType, id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.referenceData[entityType]) {
                    reject(new Error('Invalid reference type'));
                    return;
                }

                const index = this.referenceData[entityType].findIndex(item => item.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Item not found'));
                    return;
                }

                this.referenceData[entityType][index] = {
                    ...this.referenceData[entityType][index],
                    ...data
                };

                resolve(this.referenceData[entityType][index]);
            }, 200);
        });
    }

    /**
     * Удаление элемента справочника
     */
    async deleteReferenceItem(entityType, id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.referenceData[entityType]) {
                    reject(new Error('Invalid reference type'));
                    return;
                }

                const index = this.referenceData[entityType].findIndex(item => item.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Item not found'));
                    return;
                }

                this.referenceData[entityType].splice(index, 1);

                resolve({ success: true });
            }, 200);
        });
    }

    // ===========================
    // Вспомогательные методы
    // ===========================

    /**
     * Форматирование строк для ответа API
     */
    formatRowsForResponse(rows) {
        return rows.map(row => this.formatRowForResponse(row));
    }

    /**
     * Форматирование строки для ответа API
     */
    formatRowForResponse(row) {
        return {
            id: row.id,
            template_id: row.template_id,
            parent_id: row.parent_id,
            data: row.data,
            order: row.order,
            has_children: row.has_children,
            children: row.children ? this.formatRowsForResponse(row.children) : []
        };
    }
}
