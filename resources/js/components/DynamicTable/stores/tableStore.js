// resources/js/components/DynamicTable/stores/tableStore.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { dataSource } from '../services/dataSource';

export const useTableStore = defineStore('dynamicTable', () => {
    //===============================================================
    // СОСТОЯНИЯ ХРАНИЛИЩА
    //===============================================================
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
    // МЕТОДЫ РАБОТЫ С ДАННЫМИ
    //===============================================================

    /**
     * Загрузка шаблона таблицы
     */
    const fetchTemplate = async (templateId) => {
        try {
            loading.value = true;
            const response = await dataSource.fetchTemplate(templateId);
            processTemplateResponse(response);
        } catch (err) {
            error.value = 'Ошибка загрузки шаблона: ' + err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Обработка ответа шаблона для соответствия клиентскому формату
     */
    const processTemplateResponse = (template) => {
        // Преобразование опций для селектов и справочников
        currentTemplate.value = {
            ...template,
            columns: template.columns.map(column => {
                if (column.type === 'select' && Array.isArray(column.options)) {
                    return {
                        ...column,
                        options: column.options.map(opt =>
                            typeof opt === 'string' ? opt : opt.value || opt.label || opt
                        )
                    };
                }
                return column;
            })
        };
    };

    /**
     * Основной метод загрузки данных
     */
    const resetAndFetchData = async (templateId) => {
        loading.value = true;
        rows.value = [];
        error.value = null;

        try {
            // Загружаем шаблон только если он не загружен
            if (!currentTemplate.value) {
                await fetchTemplate(templateId);
            }

            const response = await dataSource.fetchTableData({
                template_id: templateId || currentTemplate.value?.id,
                parent_id: null,
                page: pagination.value.current_page,
                per_page: pagination.value.per_page
            });

            // Обрабатываем как структуру с meta, так и плоский массив
            rows.value = response.data || response;
            pagination.value.total = response.meta?.total || rows.value.length;
        } catch (err) {
            error.value = 'Ошибка загрузки: ' + err.message;
            console.error('[Store] Ошибка:', { err, response: err.response });
        } finally {
            loading.value = false;
        }
    };

    /**
     * Загрузка дочерних строк
     */
    const fetchChildRows = async (parentId) => {
        try {
            const response = await dataSource.fetchChildRows({
                template_id: currentTemplate.value?.id,
                parent_id: parentId
            });

            // Нормализация данных
            const children = (response.data || response).map(child => ({
                ...child,
                children: child.children || [],
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
                stack: err.stack
            });
        }
    };

    //===============================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    //===============================================================

    /**
     * Обновление дерева строк (универсальная реализация)
     */
    const updateTree = (rows, targetId, updateFn) => {
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
                children: row.children ? updateTree(row.children, targetId, updateFn) : []
            };
        });
    };

    const setDataSource = (source) => {
        dataSource.setSource(source);
    };

    //===============================================================
    // ЭКСПОРТ МЕТОДОВ И СОСТОЯНИЙ
    //===============================================================
    return {
        // Состояния
        setDataSource,
        dataSource: dataSource.currentSource,
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
        // Обновление строки
        updateRow: async (rowId, newData) => {
            // Добавляем проверку ID
            if (!rowId) {
                throw new Error('ID строки не определен');
            }

            if (dataSource.value === 'mock') {
                rows.value = updateTree(rows.value, rowId, row => ({
                    ...row,
                    newData
                }));
            } else {
                try {
                    // ФОРМАТИРОВАНИЕ ДАННЫХ ПЕРЕД ОТПРАВКОЙ
                    const formattedData = {};
                    for (const [key, value] of Object.entries(newData.data)) {
                        // Для date преобразуем в стандартный формат для отправки на сервер
                        if (value && value instanceof Date) {
                            const year = value.getFullYear();
                            const month = (value.getMonth() + 1).toString().padStart(2, '0');
                            const day = value.getDate().toString().padStart(2, '0');
                            formattedData[key] = `${year}-${month}-${day}`;
                        }
                        // Для reference отправляем только ID
                        else if (value && value.id) {
                            formattedData[key] = value.id;
                        }
                        // Для других типов отправляем простое значение
                        else if (value && value.value !== undefined) {
                            formattedData[key] = value.value;
                        } else {
                            formattedData[key] = value;
                        }
                    }

                    await tableApi.update(rowId, {
                        data: formattedData,
                        order: newData.order
                    });
                    await resetAndFetchData(currentTemplate.value?.id);
                    ElMessage.success('Данные обновлены');
                } catch (err) {
                    ElMessage.error('Ошибка обновления данных: ' + (err.response?.data?.message || err.message));
                    throw err;
                }
            }
        },
        addRow: async (newRow) => {
            try {
                await dataSource.createRow(newRow);
                await resetAndFetchData(currentTemplate.value?.id);
                ElMessage.success('Строка добавлена');
            } catch (err) {
                ElMessage.error('Ошибка добавления строки: ' + (err.response?.data?.message || err.message));
                throw err;
            }
        },
        deleteRow: async (rowId) => {
            try {
                await dataSource.deleteRow(rowId);
                await resetAndFetchData(currentTemplate.value?.id);
                ElMessage.success('Строка удалена');
            } catch (err) {
                ElMessage.error('Ошибка удаления строки: ' + (err.response?.data?.message || err.message));
                throw err;
            }
        },
        toggleRow: (rowId) => {
            if (expandedRows.value.has(rowId)) {
                expandedRows.value.delete(rowId);
            } else {
                expandedRows.value.add(rowId);
                fetchChildRows(rowId);
            }
        }
    };
});
