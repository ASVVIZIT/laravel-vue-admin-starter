import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

// Настройка Axios для работы с куками и CORS
axios.defaults.withCredentials = true;

// Интерцепторы для логирования запросов/ответов
axios.interceptors.request.use(config => {
    console.log('[Axios] Запрос:', config.url, config.params);
    return config;
});

axios.interceptors.response.use(
    response => {
        console.log('[Axios] Ответ:', response.status, response.data);
        return response;
    },
    error => {
        console.error('[Axios] Ошибка:', error.response?.status, error.config?.url);
        return Promise.reject(error);
    }
);

export const useTableStore = defineStore('dynamicTable', () => {
    //===============================================================
    // СОСТОЯНИЯ ХРАНИЛИЩА
    //===============================================================
    const dataSource = ref('api'); // Режим работы: 'api' или 'mock'
    const currentTemplate = ref(null); // Текущий шаблон таблицы
    const rows = ref([]); // Данные таблицы
    const expandedRows = ref(new Set()); // Раскрытые строки
    const loading = ref(false); // Состояние загрузки
    const error = ref(null); // Ошибки
    const pagination = ref({ // Пагинация
        current_page: 1,
        per_page: 20,
        total: 0
    });

    //===============================================================
    // ГЕНЕРАТОР МОКОВЫХ ДАННЫХ (на основе шаблона)
    //===============================================================
    const generateMockData = (levels = 3, itemsPerLevel = 12) => {
        if (!currentTemplate.value?.columns) return [];

        const columns = currentTemplate.value.columns;
        let idCounter = 1;

        const createLevel = (parentId = null, currentLevel = 0) => {
            return Array.from({ length: itemsPerLevel }, (_, i) => {
                const row = {
                    id: idCounter++,
                    parent_id: parentId,
                    data: {},
                    children: [],
                    has_children: currentLevel < levels - 1
                };

                // Генерация данных для каждой колонки
                columns.forEach(column => {
                    switch (column.type) {
                        case 'text':
                            row.data[column.label] = `Product ${idCounter}`;
                            break;
                        case 'select': {
                            // Получаем опции из шаблона
                            const options = column.options || [];

                            // Определяем формат опций (объекты или строки)
                            const isObjectOptions = options.length > 0 && typeof options[0] === 'object';

                            // Выбираем случайное значение
                            const randomIndex = Math.floor(Math.random() * options.length);
                            const selectedOption = options[randomIndex];

                            // Сохраняем ID для объекта или значение для строки
                            row.data[column.label] = isObjectOptions
                                ? selectedOption?.id || null
                                : selectedOption || 'N/A';
                            break;
                        }
                        case 'number':
                            row.data[column.label] = Math.floor(Math.random() * 1000) + 100;
                            break;
                        default:
                            row.data[column.label] = '';
                    }
                });

                if (row.has_children) {
                    row.children = createLevel(row.id, currentLevel + 1);
                }

                return row;
            });
        };

        return createLevel();
    };

    //===============================================================
    // МЕТОДЫ РАБОТЫ С API
    //===============================================================

    /**
     * Загрузка шаблона таблицы
     * @param {number} templateId - ID шаблона
     */
    const fetchTemplate = async (templateId) => {
        try {
            loading.value = true;
            const response = await axios.get(`/api/table/templates/${templateId}`);

            // Проверяем наличие колонок
            if (!response.data.columns) {
                throw new Error('Шаблон не содержит колонок');
            }

            currentTemplate.value = response.data;
            console.log('[Store] Шаблон загружен:', currentTemplate.value);
        } catch (err) {
            error.value = 'Ошибка загрузки шаблона: ' + err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Основной метод загрузки данных
     * @param {number} templateId - ID шаблона
     */
    const resetAndFetchData = async (templateId) => {
        loading.value = true;
        rows.value = [];
        error.value = null;

        try {
            // Для API: сначала загружаем шаблон
            if (dataSource.value === 'api') // Загружаем шаблон только если он не загружен
                if (!currentTemplate.value) {
                    await fetchTemplate(templateId);
                } else {
                    const response = await axios.get('/api/table/rows', {
                        params: {
                            template_id: templateId || currentTemplate.value?.id,
                            page: pagination.value.current_page,
                            per_page: pagination.value.per_page
                        }
                    });
                    // Обрабатываем как структуру с meta, так и плоский массив
                    rows.value = response.data.data || response.data;
                    pagination.value.total = response.data.meta?.total || rows.value.length;
                }
            // Для mock: Генерируем данные
            if (dataSource.value === 'mock') {
                await new Promise(resolve => setTimeout(resolve, 500));
                rows.value = generateMockData();
                console.log('[Store] Моковые данные созданы:', rows.value);
            }
        } catch (err) {
            error.value = 'Ошибка загрузки: ' + err.message;
            console.error('[Store] Ошибка:', { err, response: err.response });
        } finally {
            loading.value = false;
        }
    };

    /**
     * Обработчик для API данных
     */
    const processApiData = (parentId, response) => {
        const children = response.data.data.map(child => ({
            ...child,
            // Приводим к единому формату
            children: child.children || [],
            has_children: child.has_children || child.children?.length > 0
        }));

        return updateTree(rows.value, parentId, row => ({
            ...row,
            children: children,
            has_children: children.length > 0
        }));
    };


    const processMockData = (parentId) => {
        const children = generateMockData(2, 3).map(child => ({
            ...child,
            // Явно задаем структуру
            children: [],
            has_children: false
        }));

        return updateTree(rows.value, parentId, row => ({
            ...row,
            children: children,
            has_children: children.length > 0
        }));
    };

    /**
     * Загрузка дочерних строк
     * @param {number} parentId - ID родительской строки
     */
    const fetchChildRows = async (parentId) => {
        try {
            if (dataSource.value === 'mock') {
                rows.value = processMockData(parentId);
                return;
            }

            const response = await axios.get('/api/table/rows', {
                params: {
                    template_id: currentTemplate.value?.id,
                    parent_id: parentId,
                    per_page: 100
                }
            });

            // Нормализация данных
            const children = (response.data.data || response.data).map(child => ({
                ...child,
                children: child.children || [], // Гарантируем массив
                has_children: child.has_children || false
            }));

            rows.value = updateTree(rows.value, parentId, row => ({
                ...row,
                children: children,
                has_children: children.length > 0
            }));

        } catch (err) {
            error.value = 'Ошибка загрузки дочерних строк: ' + err.message;
            console.error('[Store] Ошибка:', {
                config: err.config,
                response: err.response,
                stack: err.stack // Добавляем стек вызовов
            });
        }
    };

    //===============================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    //===============================================================

    /**
     * Поиск строки в дереве по ID
     * @param {Array} rows - Массив строк
     * @param {number} id - Искомый ID
     */
    const findRow = (rows, id) => {
        for (const row of rows) {
            if (row.id === id) return row;
            if (row.children?.length) {
                const found = findRow(row.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    /**
     * Обновление дерева строк (универсальная реализация)
     * @param {Array} rows - Исходные данные
     * @param {number} targetId - ID целевой строки
     * @param {Function} updateFn - Функция обновления
     * @returns {Array} - Новое реактивное дерево
     */
    const updateTree = (rows, targetId, updateFn) => {
        return rows.map(row => {
            if (row.id === targetId) {
                const updatedRow = updateFn(row);
                // Гарантируем наличие children и has_children
                return {
                    ...updatedRow,
                    children: updatedRow.children || [],
                    has_children: updatedRow.has_children ?? updatedRow.children.length > 0
                };
            }
            return {
                ...row,
                children: row.children ? updateTree(row.children, targetId, updateFn) : []
            };
        });
    };


    const setDataSource = (source) => {
        dataSource.value = source;
        console.log('[Store] Источник данных изменен:', source);
    };

    //===============================================================
    // ЭКСПОРТ МЕТОДОВ И СОСТОЯНИЙ
    //===============================================================
    return {
        // Состояния
        setDataSource,
        dataSource,
        currentTemplate,
        rows,
        expandedRows,
        loading,
        error,
        pagination,

        // Геттеры
        formattedRows: computed(() => rows.value.map(row => ({
            ...row,
            created_at: new Date().toLocaleDateString()
        }))),

        // Действия
        fetchTemplate,
        resetAndFetchData,
        fetchChildRows,
        updateRow: async (rowId, newData) => {
            if (dataSource.value === 'mock') {
                rows.value = updateTree(rows.value, rowId, row => ({
                    ...row,
                    data: { ...row.data, ...newData }
                }));
            } else {
                await axios.put(`/api/table/rows/${rowId}`, newData);
                await resetAndFetchData(currentTemplate.value?.id);
            }
        },
        deleteRow: async (rowId) => {
            if (dataSource.value === 'mock') {
                rows.value = updateTree(rows.value, rowId, () => null);
            } else {
                await axios.delete(`/api/table/rows/${rowId}`);
                await resetAndFetchData(currentTemplate.value?.id);
            }
        },
        toggleRow: (rowId) => {
            expandedRows.value.has(rowId)
                ? expandedRows.value.delete(rowId)
                : expandedRows.value.add(rowId);
        }
    };
});
