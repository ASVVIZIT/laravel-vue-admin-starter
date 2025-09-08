// resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/services/formatService.js
/**
 * @file formatService.js
 * @description Сервис для работы с форматом отображения справочника.
 */

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
 * @param {Object} mockData - Моковые данные.
 * @param {string} selectedEntityType - Тип выбранного справочника.
 * @returns {string} Пример отформатированной строки.
 */
export function generateFormatExample(referenceInfo, displayFormat, mockData, selectedEntityType) {
    let exampleItem = referenceInfo?.example ||
        (selectedEntityType && mockData[selectedEntityType]?.[0]);
    if (exampleItem) {
        try {
            // Импортируем функцию форматирования, чтобы не дублировать ее логику
            // Предполагается, что formatReferenceDisplay доступен, например, через импорт
            // Так как сервис не должен зависеть от Vue компонентов, лучше передавать эту функцию как зависимость
            // или реализовать упрощенную версию здесь. Для простоты оставим console.warn.
            console.warn('[formatService.generateFormatExample] formatReferenceDisplay function needed for full implementation.');
            return `Пример для {${Object.keys(exampleItem)[0] || '...'}}`;
        } catch (e) {
            console.error('[formatService.generateFormatExample] Error:', e);
            return 'Ошибка формата';
        }
    }
    return '';
}

/**
 * Генерирует предпросмотр формата на основе данных справочника.
 * @param {Object|null} referenceInfo - Информация о справочнике.
 * @param {string} displayFormat - Строка формата.
 * @param {Object} mockData - Моковые данные.
 * @param {string} selectedEntityType - Тип выбранного справочника.
 * @returns {string} Строка предпросмотра.
 */
export function generatePreview(referenceInfo, displayFormat, mockData, selectedEntityType) {
    // Аналогично generateFormatExample, требует функции форматирования
    console.warn('[formatService.generatePreview] formatReferenceDisplay function needed for full implementation.');
    return generateFormatExample(referenceInfo, displayFormat, mockData, selectedEntityType);
}
