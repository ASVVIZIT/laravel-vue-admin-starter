// resources/js/components/DynamicTable/services/dataSource.js
import { templateApi } from '../api/templateApi';
import { rowApi } from '../api/rowApi';
import { referenceApi } from '../api/referenceApi';

// Моковые данные для режима разработки
const mockDataStore = {
    templates: [
        {
            id: 1,
            name: 'Электрооборудование',
            columns: [
                {
                    id: 1,
                    type: 'text',
                    label: 'Наименование',
                    order: 0
                },
                {
                    id: 2,
                    type: 'number',
                    label: 'Количество',
                    unit: 'шт.',
                    order: 1
                },
                {
                    id: 3,
                    type: 'reference',
                    label: 'Производитель',
                    reference: {
                        entityType: 'brand',
                        displayFormat: '{name} ({country})'
                    },
                    order: 2
                },
                {
                    id: 4,
                    type: 'date',
                    label: 'Дата поставки',
                    dateFormat: 'DD.MM.YYYY',
                    order: 3
                },
                {
                    id: 5,
                    type: 'boolean',
                    label: 'В наличии',
                    booleanSettings: {
                        displayType: 'toggle',
                        trueLabel: 'Да',
                        falseLabel: 'Нет'
                    },
                    order: 4
                }
            ]
        },
        {
            id: 2,
            name: 'Аксессуары',
            columns: [
                {
                    id: 6,
                    type: 'text',
                    label: 'Модель',
                    order: 0
                },
                {
                    id: 7,
                    type: 'number',
                    label: 'Цена',
                    unit: 'руб.',
                    order: 1
                },
                {
                    id: 8,
                    type: 'select',
                    label: 'Тип',
                    options: ['Корпус', 'Крепление', 'Доп. оборудование'],
                    order: 2
                }
            ]
        }
    ],
    rows: [
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
            has_children: true
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
        },
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
        },
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
    ],
    referenceData: {
        accessory: [
            { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
            { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
            { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' }
        ],
        brand: [
            { id: 1, name: 'ABB', country: 'Швейцария', website: 'https://www.se.com  ' },
            { id: 2, name: 'Legrand', country: 'Франция', website: 'https://www.legrand.com  ' },
            { id: 3, name: 'IEK', country: 'Россия', website: 'https://www.iek.ru  ' }
        ],
        device_type: [
            { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
            { id: 2, name: 'УЗО', code: 'RCD' },
            { id: 3, name: 'Дифавтомат', code: 'RCBO' }
        ]
    }
};

// Класс для управления источником данных
export class DataSource {
    constructor() {
        this.source = 'api'; // По умолчанию используем API
        this.setSource('api');
    }

    // Установка источника данных
    setSource(source) {
        console.log(`[DataSource] Switching source to: ${source}`); // Опционально, для отладки
        this.source = source;
    }

    // Получение списка шаблонов
    async list(params = {}) {
        if (this.source === 'mock') {
            return this.getMockTemplates(params);
        }

        return templateApi.list(params);
    }

    // Получение шаблона по ID
    async get(id) {
        if (this.source === 'mock') {
            return this.getMockTemplate(id);
        }

        return templateApi.get(id);
    }

    // Создание нового шаблона
    async create(data) {
        if (this.source === 'mock') {
            return this.createMockTemplate(data);
        }

        return templateApi.create(data);
    }

    // Обновление шаблона
    async update(id, data) {
        if (this.source === 'mock') {
            return this.updateMockTemplate(id, data);
        }

        return templateApi.update(id, data);
    }

    // Удаление шаблона
    async delete(id) {
        if (this.source === 'mock') {
            return this.deleteMockTemplate(id);
        }

        return templateApi.delete(id);
    }

    // Загрузка данных таблицы
    async fetchTableData(params) {
        if (this.source === 'mock') {
            return this.getMockTableData(params);
        }

        return rowApi.list(params);
    }

    // Создание новой строки
    async createRow(data) {
        if (this.source === 'mock') {
            return this.createMockRow(data);
        }

        return rowApi.create(data);
    }

    // Обновление строки
    async updateRow(id, data) {
        if (this.source === 'mock') {
            return this.updateMockRow(id, data);
        }

        return rowApi.update(id, data);
    }

    // Удаление строки
    async deleteRow(id) {
        if (this.source === 'mock') {
            return this.deleteMockRow(id);
        }

        return rowApi.delete(id);
    }

    // Получение дочерних строк
    async fetchChildRows(parentId, params) {
        if (this.source === 'mock') {
            return this.getMockChildRows(parentId, params);
        }

        return rowApi.list({ ...params, parent_id: parentId });
    }

    // Получение данных справочника
    async getReferenceData(entityType) {
        if (this.source === 'mock') {
            return this.getMockReferenceData(entityType);
        }

        return referenceApi.getData(entityType);
    }

    // НОВЫЙ МЕТОД: Загрузка данных справочника с правильной обработкой ошибок
    // Этот метод добавлен для решения ошибки "de.loadReferenceData is not a function"
    async loadReferenceData(entityType) {
        try {
            // ИСПРАВЛЕНИЕ: Используем существующий метод getReferenceData
            const data = await this.getReferenceData(entityType);
            return data;
        } catch (error) {
            console.error(`Ошибка загрузки данных справочника (${entityType}):`, error);
            // Возвращаем пустой массив в случае ошибки
            return [];
        }
    }

    // НОВЫЙ МЕТОД: Получение типов справочников
    async getReferenceTypes() {
        if (this.source === 'mock') {
            // В моковых данных типы справочников могут быть получены из ключей referenceData
            return Object.keys(mockDataStore.referenceData).map(type => ({
                value: type,
                label: this.getReferenceTypeLabel(type)
            }));
        }

        // Для реального API получаем типы справочников
        return referenceApi.getTypes();
    }

    // Вспомогательный метод для получения метки типа справочника
    getReferenceTypeLabel(type) {
        const labels = {
            'accessory': 'Аксессуары',
            'brand': 'Бренды',
            'device_type': 'Типы устройств',
            'measurement_category': 'Категория Единиц измерения'
        };
        return labels[type] || type;
    }

    // Моковые методы
    getMockTemplates(params = {}) {
        let templates = [...mockDataStore.templates];

        // Фильтрация по поиску
        if (params.search) {
            const search = params.search.toLowerCase();
            templates = templates.filter(template =>
                template.name.toLowerCase().includes(search)
            );
        }

        // Пагинация
        const page = params.page || 1;
        const perPage = params.per_page || 15;
        const total = templates.length;
        const totalPages = Math.ceil(total / perPage);

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedTemplates = templates.slice(startIndex, endIndex);

        return {
            data: paginatedTemplates,
            meta: {
                current_page: page,
                per_page: perPage,
                total: total,
                last_page: totalPages
            }
        };
    }

    getMockTemplate(id) {
        const template = mockDataStore.templates.find(t => t.id === parseInt(id));
        if (!template) {
            throw new Error('Template not found');
        }

        // Глубокое клонирование для предотвращения мутаций
        return JSON.parse(JSON.stringify(template));
    }

    createMockTemplate(data) {
        const newId = Math.max(...mockDataStore.templates.map(t => t.id)) + 1;
        const newTemplate = {
            id: newId,
            ...data,
            columns: data.columns.map((col, index) => ({
                ...col,
                id: Math.max(...mockDataStore.templates.flatMap(t => t.columns).map(c => c.id)) + index + 1,
                order: index
            }))
        };

        mockDataStore.templates.push(newTemplate);
        return JSON.parse(JSON.stringify(newTemplate));
    }

    updateMockTemplate(id, data) {
        const index = mockDataStore.templates.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Template not found');
        }

        const updatedTemplate = {
            ...mockDataStore.templates[index],
            ...data,
            columns: data.columns.map((col, index) => ({
                ...col,
                id: col.id || Math.max(...mockDataStore.templates.flatMap(t => t.columns).map(c => c.id)) + index + 1,
                order: index
            }))
        };

        mockDataStore.templates[index] = updatedTemplate;
        return JSON.parse(JSON.stringify(updatedTemplate));
    }

    deleteMockTemplate(id) {
        const index = mockDataStore.templates.findIndex(t => t.id === parseInt(id));
        if (index === -1) {
            throw new Error('Template not found');
        }

        mockDataStore.templates.splice(index, 1);
        return { success: true };
    }

    getMockTableData(params) {
        let rows = [...mockDataStore.rows];

        // Фильтрация по шаблону
        if (params.template_id) {
            rows = rows.filter(row => row.template_id === parseInt(params.template_id));
        }

        // Фильтрация по родительской строке
        if (params.parent_id !== undefined) {
            rows = rows.filter(row => {
                if (params.parent_id === null) {
                    return row.parent_id === null;
                }
                return row.parent_id === parseInt(params.parent_id);
            });
        }

        // Сортировка
        rows.sort((a, b) => a.order - b.order);

        // Пагинация
        const page = params.page || 1;
        const perPage = params.per_page || 20;
        const total = rows.length;
        const totalPages = Math.ceil(total / perPage);

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedRows = rows.slice(startIndex, endIndex);

        return {
            data: paginatedRows,
            meta: {
                current_page: page,
                per_page: perPage,
                total: total,
                last_page: totalPages
            }
        };
    }

    createMockRow(data) {
        const newId = Math.max(...mockDataStore.rows.map(r => r.id)) + 1;
        const newRow = {
            id: newId,
            ...data,
            has_children: false
        };

        mockDataStore.rows.push(newRow);
        return JSON.parse(JSON.stringify(newRow));
    }

    updateMockRow(id, data) {
        const index = mockDataStore.rows.findIndex(r => r.id === parseInt(id));
        if (index === -1) {
            throw new Error('Row not found');
        }

        const updatedRow = {
            ...mockDataStore.rows[index],
            ...data
        };

        mockDataStore.rows[index] = updatedRow;
        return JSON.parse(JSON.stringify(updatedRow));
    }

    deleteMockRow(id) {
        const index = mockDataStore.rows.findIndex(r => r.id === parseInt(id));
        if (index === -1) {
            throw new Error('Row not found');
        }

        mockDataStore.rows.splice(index, 1);
        return { success: true };
    }

    getMockChildRows(parentId, params) {
        return this.getMockTableData({ ...params, parent_id: parentId });
    }

    getMockReferenceData(entityType) {
        if (!mockDataStore.referenceData[entityType]) {
            throw new Error(`Reference data for ${entityType} not found`);
        }

        return [...mockDataStore.referenceData[entityType]];
    }
}

// Экземпляр dataSource для использования в компонентах
export const dataSource = new DataSource();
