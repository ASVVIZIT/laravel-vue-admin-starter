// resources/js/components/DynamicTable/TemplateBuilder/services/tablePreviewService.js
/**
 * @file tablePreviewService.js
 * @description Сервис для работы с предпросмотром таблицы в шаблонизаторе.
 *
 * Основные функции:
 * - Генерация данных для предпросмотра
 * - Управление состоянием редактирования ячеек
 * - Обработка прокрутки таблицы
 */

import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';

// === Состояния сервиса ===
const previewRows = ref([]);
const selectedPreviewColumnIndex = ref(null);
const selectedPreviewRowIndex = ref(null);
const editingCell = ref(null);
const columnWidths = ref([]);

// === Геттеры ===
const getPreviewRows = computed(() => previewRows.value);
const getSelectedPreviewColumnIndex = computed(() => selectedPreviewColumnIndex.value);
const getSelectedPreviewRowIndex = computed(() => selectedPreviewRowIndex.value);
export const isCellEditing = (rowIndex, colIndex) => {
    return editingCell.value &&
        editingCell.value.rowIndex === rowIndex &&
        editingCell.value.colIndex === colIndex;
};
export const getColumnWidth = (index) => columnWidths.value[index] || 120;

// === Сеттеры ===
export const setPreviewRows = (rows) => {
    previewRows.value = Array.isArray(rows) ? rows : [];
};

export const setSelectedPreviewColumnIndex = (index) => {
    selectedPreviewColumnIndex.value = index;
};

export const setSelectedPreviewRowIndex = (index) => {
    selectedPreviewRowIndex.value = index;
};

export const setEditingCell = (rowIndex, colIndex) => {
    editingCell.value = { rowIndex, colIndex };
};

export const clearEditingCell = () => {
    editingCell.value = null;
};

export const setColumnWidths = (widths) => {
    columnWidths.value = Array.isArray(widths) ? widths : [];
};

// === Методы ===
export const updatePreviewData = async (columns, manualTestData = {}, testMode = 'auto') => {
    try {
        const rows = [];

        for (let i = 0; i < 10; i++) {
            const rowData = {};

            for (const [colIndex, column] of columns.entries()) {
                let exampleValue;

                // Логика в зависимости от режима тестирования
                if (testMode === 'manual' && manualTestData[i] && manualTestData[i][colIndex] !== undefined) {
                    // Используем ручное значение из хранилища
                    exampleValue = manualTestData[i][colIndex];
                } else {
                    // Генерируем автоматическое значение
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
                                    // Проверяем MOCK_REFERENCE_DATA
                                    if (MOCK_REFERENCE_DATA[column.reference.entityType]?.[i]) {
                                        exampleValue = MOCK_REFERENCE_DATA[column.reference.entityType][i];
                                    } else {
                                        // Если моковых данных нет, пытаемся загрузить реальные данные
                                        const referenceData = await dataSource.getReferenceData(column.reference.entityType);
                                        if (referenceData && referenceData.length > 0) {
                                            const item = referenceData[i] || referenceData[0];
                                            if (item) {
                                                exampleValue = formatReferenceDisplay(item, column);
                                            } else {
                                                exampleValue = 'Нет данных';
                                            }
                                        } else {
                                            exampleValue = 'Нет данных в справочнике';
                                        }
                                    }
                                } catch (error) {
                                    console.error(`Ошибка загрузки данных справочника ${column.reference.entityType}:`, error);
                                    ElMessage.error(`Не удалось загрузить данные справочника "${column.reference.entityType}": ${error.message}`);
                                }
                            } else {
                                exampleValue = 'Выберите справочник';
                            }
                            break;
                        default:
                            exampleValue = column.type;
                    }
                }

                rowData[column.tempId] = exampleValue;
            }

            rows.push({ rowData, order: i });
        }

        setPreviewRows(rows);
        return rows;
    } catch (error) {
        console.error('[tablePreviewService.updatePreviewData] Error:', error);
        ElMessage.error('Ошибка обновления данных предпросмотра: ' + error.message);
        throw error;
    }
};

export const handleBodyScroll = (event, previewTableHeaderRef) => {
    if (previewTableHeaderRef.value) {
        previewTableHeaderRef.value.scrollLeft = event.target.scrollLeft;
    }
};

export const getCellValue = (row, column) => {
    return row.rowData[column.tempId] || '';
};

export const updateCellValue = async (rowIndex, colIndex, newValue, columns, rows) => {
    const columnObj = columns[colIndex];
    const updatedRows = [...rows];

    if (columnObj.type === 'reference' && referenceData.value[columnObj.reference?.entityType]) {
        try {
            const data = await dataSource.getReferenceData(columnObj.reference.entityType);
            const item = data.find(item => item.id == newValue);
            newValue = item ? item.id : newValue;
        } catch (error) {
            console.error(`Ошибка загрузки данных справочника ${columnObj.reference.entityType}:`, error);
            ElMessage.error(`Не удалось загрузить данные справочника "${columnObj.reference.entityType}": ${error.message}`);
        }
    }

    updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        rowData: {
            ...updatedRows[rowIndex].rowData,
            [columnObj.tempId]: newValue
        }
    };

    setPreviewRows(updatedRows);
    return updatedRows;
};

// === Экспорт ===
export const tablePreviewService = {
    // Состояния
    previewRows: getPreviewRows,
    selectedPreviewColumnIndex: getSelectedPreviewColumnIndex,
    selectedPreviewRowIndex: getSelectedPreviewRowIndex,
    editingCell,
    columnWidths,

    // Геттеры
    getPreviewRows: () => getPreviewRows.value,
    getSelectedPreviewColumnIndex: () => getSelectedPreviewColumnIndex.value,
    getSelectedPreviewRowIndex: () => getSelectedPreviewRowIndex.value,
    isCellEditing,
    getColumnWidth,

    // Сеттеры
    setPreviewRows,
    setSelectedPreviewColumnIndex,
    setSelectedPreviewRowIndex,
    setEditingCell,
    clearEditingCell,
    setColumnWidths,

    // Методы
    updatePreviewData,
    handleBodyScroll,
    getCellValue,
    updateCellValue
};
