// resources/js/components/DynamicTable/services/formatService.js
/**
 * @file formatService.js
 * @description Сервис для работы с форматированием данных в динамических таблицах.
 *
 * Основные функции:
 * - Форматирование отображения справочников
 * - Форматирование отображения boolean значений
 * - Форматирование отображения дат и времени
 * - Форматирование отображения чисел
 * - Форматирование отображения текста
 * - Форматирование отображения select значений
 * - Парсинг строки формата в блоки
 * - Сериализация блоков в строку формата
 * - Обновление значения текстового блока
 * - Обработка нажатия клавиши Backspace в текстовом блоке
 * - Генерация примера формата
 * - Генерация предпросмотра формата
 */

import { ref, computed } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { dataSource } from '@/components/DynamicTable/services/dataSource';
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils';
import { MOCK_REFERENCE_DATA } from '@/components/DynamicTable/services/mockData';

// === Состояния сервиса ===
const formatServiceState = ref({
    testMode: 'auto', // 'auto' | 'manual'
    manualTestData: {}, // { rowIndex: { colIndex: value, ... }, ... }
    columnWidths: [], // Массив ширин колонок
    cellStyles: {}, // { rowIndex: { colIndex: { backgroundColor, color, ... } }, ... }
    loading: false,
    error: null
});

// === Геттеры ===
const isManualMode = computed(() => formatServiceState.value.testMode === 'manual');

// === Сеттеры ===
const setTestMode = (mode) => {
    console.log(`[formatService.setTestMode] Setting test mode to: ${mode}`);
    if (mode === 'auto' || mode === 'manual') {
        formatServiceState.value.testMode = mode;
    } else {
        console.warn(`[formatService.setTestMode] Invalid test mode: ${mode}`);
    }
};

const toggleTestMode = () => {
    console.log(`[formatService.toggleTestMode] Toggling test mode from: ${formatServiceState.value.testMode}`);
    formatServiceState.value.testMode = formatServiceState.value.testMode === 'auto' ? 'manual' : 'auto';
    console.log(`[formatService.toggleTestMode] Test mode toggled to: ${formatServiceState.value.testMode}`);
};

// === Методы работы с тестовыми данными ===
const updateManualTestData = (rowIndex, colIndex, value) => {
    console.log(`[formatService.updateManualTestData] Updating manual data for [${rowIndex}][${colIndex}]:`, value);

    // Убеждаемся, что объекты существуют
    if (!formatServiceState.value.manualTestData[rowIndex]) {
        formatServiceState.value.manualTestData[rowIndex] = {};
    }

    formatServiceState.value.manualTestData[rowIndex][colIndex] = value;
    console.log(`[formatService.updateManualTestData] Manual test data updated:`, formatServiceState.value.manualTestData);
};

const resetManualTestData = () => {
    console.log(`[formatService.resetManualTestData] Resetting manual test data`);
    formatServiceState.value.manualTestData = {};
    console.log(`[formatService.resetManualTestData] Manual test data reset`);
};

const getManualTestData = (rowIndex, colIndex) => {
    return formatServiceState.value.manualTestData[rowIndex]?.[colIndex];
};

// === Методы работы с ширинами колонок ===
const setColumnWidth = (colIndex, width) => {
    console.log(`[formatService.setColumnWidth] Setting column width for [${colIndex}]: ${width}px`);
    formatServiceState.value.columnWidths[colIndex] = width;
    console.log(`[formatService.setColumnWidth] Column width set:`, formatServiceState.value.columnWidths);
};

const getColumnWidth = (colIndex) => {
    return formatServiceState.value.columnWidths[colIndex] || 120; // Дефолтная ширина 120px
};

// === Методы работы со стилями ячеек ===
const updateCellStyles = (rowIndex, colIndex, styles) => {
    console.log(`[formatService.updateCellStyles] Updating cell styles for [${rowIndex}][${colIndex}]:`, styles);

    // Убеждаемся, что объекты существуют
    if (!formatServiceState.value.cellStyles[rowIndex]) {
        formatServiceState.value.cellStyles[rowIndex] = {};
    }

    // Объединяем новые стили с существующими
    formatServiceState.value.cellStyles[rowIndex][colIndex] = {
        ...formatServiceState.value.cellStyles[rowIndex][colIndex],
        ...styles
    };
    console.log(`[formatService.updateCellStyles] Cell styles updated:`, formatServiceState.value.cellStyles);
};

const resetCellStyles = (rowIndex, colIndex) => {
    console.log(`[formatService.resetCellStyles] Resetting cell styles for [${rowIndex}][${colIndex}]`);

    if (formatServiceState.value.cellStyles[rowIndex]) {
        delete formatServiceState.value.cellStyles[rowIndex][colIndex];
        // Если объект строки стал пустым, удаляем его
        if (Object.keys(formatServiceState.value.cellStyles[rowIndex]).length === 0) {
            delete formatServiceState.value.cellStyles[rowIndex];
        }
    }
    console.log(`[formatService.resetCellStyles] Cell styles reset:`, formatServiceState.value.cellStyles);
};

const resetAllCellStyles = () => {
    console.log(`[formatService.resetAllCellStyles] Resetting all cell styles`);
    formatServiceState.value.cellStyles = {};
    console.log(`[formatService.resetAllCellStyles] All cell styles reset`);
};

const getCellStyles = (rowIndex, colIndex) => {
    return formatServiceState.value.cellStyles[rowIndex]?.[colIndex] || {};
};

// === Методы форматирования ===

/**
 * Парсит строку формата в массив блоков.
 * @param {string} formatString - Строка формата (например, "Привет, {name}!").
 * @returns {Array<Object>} Массив блоков, например: [{type: 'text', value: 'Привет, '}, {type: 'tag', value: 'name'}, {type: 'text', value: '!'}].
 */
export function parseFormatStringToBlocks(formatString = '') {
    console.log('[formatService] Parsing format string:', formatString);
    const blocks = [];
    let lastIndex = 0;
    const tagRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = tagRegex.exec(formatString)) !== null) {
        // Текст до тега
        if (match.index > lastIndex) {
            const textPart = formatString.substring(lastIndex, match.index);
            if (textPart) {
                blocks.push({ type: 'text', value: textPart });
            }
        }
        // Сам тег
        blocks.push({ type: 'tag', value: match[1] }); // match[1] - содержимое скобок
        lastIndex = match.index + match[0].length;
    }
    // Текст после последнего тега
    if (lastIndex < formatString.length) {
        const textPart = formatString.substring(lastIndex);
        if (textPart) {
            blocks.push({ type: 'text', value: textPart });
        }
    }
    console.log('[formatService] Parsed blocks:', blocks);
    return blocks;
}

/**
 * Сериализует массив блоков в строку формата.
 * @param {Array<Object>} blocks - Массив блоков.
 * @returns {string} Строка формата.
 */
export function serializeBlocksToFormatString(blocks = []) {
    console.log('[formatService] Serializing blocks to string:', blocks);
    const result = blocks.map(block =>
        block.type === 'tag' ? `{${block.value}}` : block.value
    ).join('');
    console.log('[formatService] Serialized string:', result);
    return result;
}

/**
 * Обновляет значение текстового блока.
 * @param {Array<Object>} blocks - Массив блоков (мутируется).
 * @param {number} index - Индекс текстового блока.
 * @param {string} newValue - Новое значение текста.
 * @returns {boolean} True, если обновление прошло успешно.
 */
export function updateTextBlockValue(blocks, index, newValue) {
    if (blocks[index] && blocks[index].type === 'text') {
        console.log(`[formatService] Updating text block ${index} from '${blocks[index].value}' to '${newValue}'`);
        blocks[index].value = newValue;
        return true;
    }
    console.warn(`[formatService] Cannot update text block at index ${index}: not a text block or out of bounds.`);
    return false;
}

/**
 * Обрабатывает нажатие клавиши Backspace в текстовом блоке для слияния с предыдущим.
 * @param {Array<Object>} blocks - Массив блоков (мутирует при слиянии).
 * @param {number} index - Индекс текущего текстового блока.
 * @returns {Object|null} Объект с информацией о слиянии `{ merged: true, newCursorPosition: ... }` или `null`, если слияние не произошло.
 */
export function handleBackspaceInTextBlock(blocks, index) {
    const block = blocks[index];
    if (block && block.type === 'text') {
        // Предполагается, что проверка на позицию курсора уже выполнена в компоненте
        if (index > 0) {
            const prevBlock = blocks[index - 1];
            if (prevBlock.type === 'text') {
                console.log(`[formatService] Merging text block ${index} into ${index - 1}`);
                const newText = prevBlock.value + block.value;
                prevBlock.value = newText;
                blocks.splice(index, 1);
                return {
                    merged: true,
                    // Информация для последующей установки курсора
                    focusIndex: index - 1,
                    focusEndPos: newText.length
                };
            } else {
                console.log(`[formatService] Removing empty text block ${index} after tag block ${index - 1}`);
                // Предыдущий блок - тег, просто удаляем текущий пустой текстовый блок
                blocks.splice(index, 1);
                return { merged: true, focusIndex: index - 1, focusEndPos: null }; // Фокус на конце тега
            }
        } else if (blocks.length === 1 && block.value === '') {
            console.log('[formatService] Prevented removal of last empty text block.');
            return { merged: false }; // Не удаляем последний пустой блок
        } else if (block.value === ''){
            console.log(`[formatService] Removing empty text block ${index} at the beginning.`);
            blocks.splice(index, 1);
            return { merged: true, focusIndex: null }; // Нет элемента для фокуса
        }
    }
    return null; // Ничего не изменилось
}

/**
 * Генерирует пример формата на основе данных справочника.
 * @param {Object|null} referenceInfo - Информация о справочнике.
 * @param {string} displayFormat - Строка формата.
 * @returns {string} Пример формата.
 */
export function generateFormatExample(referenceInfo, displayFormat) {
    let exampleItem = referenceInfo?.example ||
        (selectedEntityType.value && MOCK_REFERENCE_DATA[selectedEntityType.value]?.[0]);
    if (exampleItem) {
        try {
            return formatReferenceDisplay(exampleItem, { reference: { displayFormat: displayFormat } });
        } catch (e) {
            console.error('[ReferenceColumnSettings.generateFormatExample] Error:', e);
            return 'Ошибка формата';
        }
    }
    return '';
}

/**
 * Генерирует предпросмотр формата на основе данных справочника.
 * @param {Object|null} referenceInfo - Информация о справочнике.
 * @param {string} displayFormat - Строка формата.
 * @returns {string} Предпросмотр формата.
 */
export function generatePreview(referenceInfo, displayFormat) {
    let exampleItem = referenceInfo?.example ||
        (selectedEntityType.value && MOCK_REFERENCE_DATA[selectedEntityType.value]?.[0]);
    if (exampleItem) {
        try {
            return formatReferenceDisplay(exampleItem, { reference: { displayFormat: displayFormat } });
        } catch (e) {
            console.error('[ReferenceColumnSettings.generatePreview] Error:', e);
            return 'Ошибка формата';
        }
    }
    return '';
}

// === Экспорт ===
export const formatService = {
    // Состояния
    state: formatServiceState,
    testMode: computed(() => formatServiceState.value.testMode),
    manualTestData: computed(() => formatServiceState.value.manualTestData),
    columnWidths: computed(() => formatServiceState.value.columnWidths),
    cellStyles: computed(() => formatServiceState.value.cellStyles),
    loading: computed(() => formatServiceState.value.loading),
    error: computed(() => formatServiceState.value.error),

    // Геттеры
    isManualMode,
    getManualTestData,
    getColumnWidth,
    getCellStyles,

    // Сеттеры
    setTestMode,
    toggleTestMode,

    // Методы
    updateManualTestData,
    resetManualTestData,
    setColumnWidth,
    updateCellStyles,
    resetCellStyles,
    resetAllCellStyles,

    // Методы форматирования
    parseFormatStringToBlocks,
    serializeBlocksToFormatString,
    updateTextBlockValue,
    handleBackspaceInTextBlock,
    generateFormatExample,
    generatePreview
};
