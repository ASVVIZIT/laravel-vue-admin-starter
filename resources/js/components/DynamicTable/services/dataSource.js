// resources/js/components/DynamicTable/services/dataSource.js
import { ref, computed } from 'vue';
import { templateApi } from '../api/templateApi';
import { rowApi } from '../api/rowApi';
import { referenceApi } from '../api/referenceApi';
import { MOCK_TEMPLATES, MOCK_ROWS, MOCK_REFERENCE_DATA } from './mockData';
import { generateTempId } from '../utils/templateBuilderUtils';

// === Состояния ===
const source = ref('api'); // 'api' или 'mock'
const loading = ref(false);
const error = ref(null);

// === Геттеры ===
const currentSource = computed(() => source.value);
const isLoading = computed(() => loading.value);
const getError = computed(() => error.value);

// === Сеттеры ===
const setSource = (newSource) => {
    console.log(`[dataSource] Switching source to: ${newSource}`);
    source.value = newSource;
};

// === Методы API ===
const api = {
    // === Шаблоны ===
    async listTemplates(params = {}) {
        return templateApi.list(params);
    },

    async getTemplate(id) {
        return templateApi.get(id);
    },

    async createTemplate(data) {
        return templateApi.create(data);
    },

    async updateTemplate(id, data) {
        return templateApi.update(id, data);
    },

    async deleteTemplate(id) {
        return templateApi.delete(id);
    },

    // === Строки таблицы ===
    async fetchTableData(params) {
        return rowApi.list(params);
    },

    async createRow(data) {
        return rowApi.create(data);
    },

    async updateRow(id, data) {
        return rowApi.update(id, data);
    },

    async deleteRow(id) {
        return rowApi.destroy(id);
    },

    // === Справочники ===
    async getReferenceTypes() {
        return referenceApi.getTypes();
    },

    async getReferenceData(entityType, params = {}) {
        return referenceApi.getData(entityType, params);
    },

    async getReferenceInfo(entityType) {
        return referenceApi.getFieldInfo(entityType);
    },

    // Получение только полей справочника ===
    async getReferenceInfoFields(entityType) {
        try {
            console.log(`[dataSource.getReferenceInfoFields] Starting for: ${entityType}`);
            const info = await this.getReferenceInfo(entityType);
            console.log(`[dataSource.getReferenceInfoFields] Info loaded for ${entityType}:`, info);

            // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Извлекаем availableKeys ===
            let fields;

            // Проверяем различные возможные структуры ответа
            if (info && info.data !== undefined) {
                // Структура {  {  { availableKeys: [...] } } }
                fields = info.data.availableKeys || [];
            } else if (info && info.availableKeys && Array.isArray(info.availableKeys)) {
                // Структура {  [...] }
                fields = info.availableKeys;
            } else {
                fields = [];
            }
            // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ===

            console.log(`[dataSource.getReferenceInfoFields] Fields extracted for ${entityType}:`, fields);
            return fields;
        } catch (error) {
            console.error(`[dataSource.getReferenceInfoFields] Error for ${entityType}:`, error);
            throw new Error(`Не удалось загрузить поля справочника "${entityType}": ${error.message}`);
        }
    },
};

// === Методы Mock ===
const mock = {
    // === Шаблоны ===
    async listTemplates(params = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filteredTemplates = [...MOCK_TEMPLATES];

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
    },

    async getTemplate(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const template = MOCK_TEMPLATES.find(t => t.id === parseInt(id));

                if (!template) {
                    reject(new Error('Template not found'));
                    return;
                }

                // Форматируем колонки в соответствии с API
                const formattedTemplate = {
                    ...template,
                    columns: template.columns.map(column => ({
                        id: column.id,
                        tempId: column.tempId || column.id || generateTempId(),
                        type: column.type,
                        label: column.label?.trim() || `Колонка ${column.order + 1}`,
                        order: column.order,
                        options: column.type === 'select' ? (column.options || []).filter(opt => opt.trim() !== '') : undefined,
                        data_type: column.type === 'text' ? (column.dataType || 'string') : undefined,
                        unit: column.type === 'number' ? (column.unit || '') : undefined,
                        reference: column.type === 'reference' ? {
                            entity_type: column.reference?.entityType || '',
                            display_format: column.reference?.displayFormat || ''
                        } : undefined,
                        boolean_settings: column.type === 'boolean' ? column.booleanSettings : undefined,
                        date_format: (column.type === 'date' || column.type === 'datetime') ? (column.dateFormat || 'DD.MM.YYYY') : undefined
                    }))
                };

                resolve(formattedTemplate);
            }, 200);
        });
    },

    async createTemplate(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTemplate = {
                    id: Date.now(),
                    name: data.name,
                    columns: data.columns.map((column, index) => ({
                        ...column,
                        id: Date.now() + index,
                        tempId: column.tempId || generateTempId(),
                        order: index
                    }))
                };

                MOCK_TEMPLATES.push(newTemplate);

                resolve({
                    id: newTemplate.id,
                    name: newTemplate.name,
                    columns: newTemplate.columns
                });
            }, 300);
        });
    },

    async updateTemplate(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_TEMPLATES.findIndex(t => t.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Template not found'));
                    return;
                }

                MOCK_TEMPLATES[index] = {
                    ...MOCK_TEMPLATES[index],
                    ...data,
                    columns: data.columns.map((column, index) => ({
                        ...column,
                        id: column.id || Date.now() + index,
                        tempId: column.tempId || generateTempId(),
                        order: index
                    }))
                };

                resolve(MOCK_TEMPLATES[index]);
            }, 300);
        });
    },

    async deleteTemplate(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_TEMPLATES.findIndex(t => t.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Template not found'));
                    return;
                }

                const template = MOCK_TEMPLATES[index];
                MOCK_TEMPLATES.splice(index, 1);

                resolve({
                    message: `Шаблон '${template.name}' успешно удален`,
                    id: template.id
                });
            }, 200);
        });
    },

    // === Строки таблицы ===
    async fetchTableData(params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const templateId = parseInt(params.template_id);
                const parentId = params.parent_id !== undefined ? (params.parent_id === 'null' ? null : parseInt(params.parent_id)) : null;

                let rows = MOCK_ROWS.filter(row => row.template_id === templateId);

                // Фильтрация по родительскому ID
                if (parentId !== undefined) {
                    if (parentId !== null) {
                        rows = rows.filter(row => row.parent_id === parentId);
                    } else {
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
                    paginatedData,
                    meta: {
                        current_page: page,
                        per_page: perPage,
                        total: total,
                        last_page: totalPages
                    }
                });
            }, 300);
        });
    },

    async createRow(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newId = Date.now();
                const newRow = {
                    id: newId,
                    template_id: data.template_id,
                    parent_id: data.parent_id || null,
                    data: data,
                    order: data.order !== undefined ? data.order : (MOCK_ROWS.filter(r => r.template_id === data.template_id && r.parent_id === data.parent_id).length || 0),
                    has_children: false
                };

                MOCK_ROWS.push(newRow);

                resolve(newRow);
            }, 300);
        });
    },

    async updateRow(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_ROWS.findIndex(r => r.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Row not found'));
                    return;
                }

                MOCK_ROWS[index] = {
                    ...MOCK_ROWS[index],
                    ...data,
                    order: data.order !== undefined ? data.order : MOCK_ROWS[index].order
                };

                resolve(MOCK_ROWS[index]);
            }, 300);
        });
    },

    async deleteRow(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = MOCK_ROWS.findIndex(r => r.id === parseInt(id));

                if (index === -1) {
                    reject(new Error('Row not found'));
                    return;
                }

                // Удаляем дочерние строки
                const childrenIds = MOCK_ROWS
                    .filter(r => r.parent_id === parseInt(id))
                    .map(r => r.id);

                childrenIds.forEach(childId => {
                    const childIndex = MOCK_ROWS.findIndex(r => r.id === childId);
                    if (childIndex !== -1) {
                        MOCK_ROWS.splice(childIndex, 1);
                    }
                });

                // Удаляем саму строку
                const row = MOCK_ROWS[index];
                MOCK_ROWS.splice(index, 1);

                resolve({
                    success: true,
                    message: `Строка ${row.id} успешно удалена`
                });
            }, 200);
        });
    },

    // === Справочники ===
    async getReferenceTypes() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { value: 'accessory', label: 'Аксессуары', description: 'Аксессуары для электрооборудования' },
                    { value: 'brand', label: 'Бренды', description: 'Производители' },
                    { value: 'device_type', label: 'Типы устройств', description: 'Категории электрооборудования' },
                    { value: 'measurement_category', label: 'Категории измерений', description: 'Единицы измерения' }
                ]);
            }, 200);
        });
    },

    async getReferenceData(entityType, params = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Убираем завершающий слэш из entityType
                const cleanEntityType = entityType.replace(/\/$/, '');

                // Проверяем моковые данные
                if (MOCK_REFERENCE_DATA[cleanEntityType]?.[0]) {
                    resolve(MOCK_REFERENCE_DATA[cleanEntityType]);
                } else {
                    reject(new Error(`Справочник "${cleanEntityType}" не найден в моковых данных`));
                }
            }, 200);
        });
    },

    // === ИСПРАВЛЕНИЕ: Добавляем метод getReferenceInfo для mock ===
    async getReferenceInfo(entityType) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Убираем завершающий слэш из entityType
                const cleanEntityType = entityType.replace(/\/$/, '');

                // Проверяем моковые данные
                if (MOCK_REFERENCE_DATA[cleanEntityType]?.[0]) {
                    const exampleItem = MOCK_REFERENCE_DATA[cleanEntityType][0];
                    const fields = Object.keys(exampleItem).map(key => ({
                        key: key,
                        label: key,
                        type: typeof exampleItem[key]
                    }));

                    resolve({
                        modelName: cleanEntityType,
                        className: cleanEntityType.charAt(0).toUpperCase() + cleanEntityType.slice(1),
                        tableName: `ep_${cleanEntityType}s`,
                        fillable: Object.keys(exampleItem),
                        relations: {}, // Моковые данные не содержат информации о связях
                        fields: fields,
                        example: exampleItem,
                        exampleFormat: '{name}',
                        availableKeys: fields.map(f => f.key) // <-- Добавляем availableKeys для совместимости
                    });
                } else {
                    reject(new Error(`Справочник "${cleanEntityType}" не найден в моковых данных`));
                }
            }, 200);
        });
    },
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // === НОВЫЙ МЕТОД: Получение только полей справочника для mock ===
    async getReferenceInfoFields(entityType) {
        try {
            console.log(`[mock.getReferenceInfoFields] Starting for: ${entityType}`);
            const info = await this.getReferenceInfo(entityType); // <-- Вызываем getReferenceInfo
            console.log(`[mock.getReferenceInfoFields] Info loaded for ${entityType}:`, info);

            // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Извлекаем availableKeys ===
            let fields;

            // Проверяем различные возможные структуры ответа
            if (info && info.data !== undefined) {
                // Структура {  {  { availableKeys: [...] } } }
                fields = info.data.availableKeys || [];
            } else if (info && info.availableKeys && Array.isArray(info.availableKeys)) {
                // Структура {  [...] }
                fields = info.availableKeys;
            } else {
                fields = [];
            }
            // === КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ===

            console.log(`[mock.getReferenceInfoFields] Fields extracted for ${entityType}:`, fields);
            return fields;
        } catch (error) {
            console.error(`[mock.getReferenceInfoFields] Error for ${entityType}:`, error);
            throw new Error(`Не удалось загрузить поля справочника "${entityType}": ${error.message}`);
        }
    },
    // === КОНЕЦ НОВОГО МЕТОДА ===
};

// === Экспортируемый объект dataSource ===
export const dataSource = {
    // Геттеры
    get currentSource() { return currentSource.value; },
    get isLoading() { return isLoading.value; },
    get error() { return getError.value; },

    // Сеттеры
    setSource,

    // Методы
    async listTemplates(params = {}) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.listTemplates(params);
            } else {
                return await api.listTemplates(params);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки списка шаблонов';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async getTemplate(id) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.getTemplate(id);
            } else {
                return await api.getTemplate(id);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки шаблона';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async createTemplate(data) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.createTemplate(data);
            } else {
                return await api.createTemplate(data);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка создания шаблона';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async updateTemplate(id, data) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.updateTemplate(id, data);
            } else {
                return await api.updateTemplate(id, data);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка обновления шаблона';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async deleteTemplate(id) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.deleteTemplate(id);
            } else {
                return await api.deleteTemplate(id);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка удаления шаблона';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async fetchTableData(params) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.fetchTableData(params);
            } else {
                return await api.fetchTableData(params);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки данных таблицы';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async createRow(data) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.createRow(data);
            } else {
                return await api.createRow(data);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка создания строки';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async updateRow(id, data) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.updateRow(id, data);
            } else {
                return await api.updateRow(id, data);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка обновления строки';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async deleteRow(id) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.deleteRow(id);
            } else {
                return await api.deleteRow(id);
            }
        } catch (err) {
            error.value = err.message || 'Ошибка удаления строки';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async getReferenceTypes() {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.getReferenceTypes();
            } else {
                return await api.getReferenceTypes();
            }
        } catch (err) {
            error.value = err.message || 'Ошибка загрузки типов справочников';
            throw err;
        } finally {
            loading.value = false;
        }
    },

    async getReferenceData(entityType, params = {}) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.getReferenceData(entityType, params);
            } else {
                return await api.getReferenceData(entityType, params);
            }
        } catch (err) {
            error.value = err.message || `Ошибка загрузки данных справочника "${entityType}"`;
            throw err;
        } finally {
            loading.value = false;
        }
    },

    // === ИСПРАВЛЕНИЕ: Экспортируем метод getReferenceInfo ===
    async getReferenceInfo(entityType) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.getReferenceInfo(entityType);
            } else {
                return await api.getReferenceInfo(entityType);
            }
        } catch (err) {
            error.value = err.message || `Ошибка загрузки информации о справочнике "${entityType}"`;
            throw err;
        } finally {
            loading.value = false;
        }
    },
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    // === НОВЫЙ МЕТОД: Экспортируем метод getReferenceInfoFields ===
    async getReferenceInfoFields(entityType) {
        loading.value = true;
        error.value = null;
        try {
            if (source.value === 'mock') {
                return await mock.getReferenceInfoFields(entityType);
            } else {
                return await api.getReferenceInfoFields(entityType);
            }
        } catch (err) {
            error.value = err.message || `Ошибка загрузки полей справочника "${entityType}"`;
            throw err;
        } finally {
            loading.value = false;
        }
    },
    // === КОНЕЦ НОВОГО МЕТОДА ===
};
