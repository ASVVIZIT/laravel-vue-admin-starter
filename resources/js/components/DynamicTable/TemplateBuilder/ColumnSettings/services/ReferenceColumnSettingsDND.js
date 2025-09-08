// resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/services/ReferenceColumnSettingsDND.js
/**
 * @file ReferenceColumnSettingsDND.js
 * @description Сервис для обработки логики Drag & Drop и кликов в компоненте ReferenceColumnSettings.
 */

/**
 * Инициирует перетаскивание поля справочника.
 * @param {DragEvent} event - Событие dragstart.
 * @param {Object} field - Объект поля справочника, содержащий как минимум свойство `path`.
 */
export function dragStartKey(event, field) {
    console.log('[ReferenceColumnSettingsDND] dragStartKey called for field:', field.path);
    if (event.dataTransfer) {
        event.dataTransfer.setData('application/x-reference-field-path', field.path);
        event.dataTransfer.setData('text/plain', `{${field.path}}`);
        event.dataTransfer.effectAllowed = 'copy';
        console.log('[ReferenceColumnSettingsDND] Data set in dataTransfer:', field.path);
    } else {
        console.error('[ReferenceColumnSettingsDND] event.dataTransfer is not available');
    }
}

/**
 * Обрабатывает событие dragover над областью конструктора формата.
 * Предотвращает поведение по умолчанию, позволяя drop.
 * @param {DragEvent} event - Событие dragover.
 */
export function dragOverFormat(event) {
    console.log('[ReferenceColumnSettingsDND] dragOverFormat called');
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
    }
    console.log('[ReferenceColumnSettingsDND] dragOverFormat prevented default and set dropEffect');
}

/**
 * Обрабатывает событие drop в области конструктора формата в ТЕКСТОВОМ режиме.
 * Вставляет перетащенное поле в текущую позицию курсора внутри contenteditable элемента.
 * @param {DragEvent} event - Событие drop.
 * @param {Object} options - Опции.
 * @param {Function} options.onSuccess - Callback, вызываемый с путем поля при успешной вставке.
 * @param {Function} options.onError - Callback для обработки ошибок или предупреждений.
 * @param {Object} options.formatInputElementRef - Ссылка на элемент contenteditable (ref).
 */
export function dropKeyTextMode(event, { onSuccess, onError, formatInputElementRef }) {
    console.log('[ReferenceColumnSettingsDND] dropKeyTextMode called');
    event.preventDefault();
    event.stopPropagation();

    let fieldPath = null;
    if (event.dataTransfer) {
        fieldPath = event.dataTransfer.getData('application/x-reference-field-path') ||
            event.dataTransfer.getData('text/plain');
    }

    if (!fieldPath) {
        const errorMsg = 'Не удалось получить данные поля для перетаскивания.';
        console.warn('[ReferenceColumnSettingsDND] ' + errorMsg);
        onError?.(errorMsg);
        return;
    }
    console.log('[ReferenceColumnSettingsDND] Field path found:', fieldPath);

    const formatInputEl = formatInputElementRef.value;
    if (formatInputEl) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.startContainer;
            const offset = range.startOffset;

            const fullTextContent = formatInputEl.textContent || '';

            console.log('[ReferenceColumnSettingsDND] Full text content for checking:', fullTextContent);
            console.log('[ReferenceColumnSettingsDND] Approximate cursor offset:', offset);

            let isInsideTag = false;
            let braceCount = 0;
            for (let i = 0; i < fullTextContent.length; i++) {
                if (fullTextContent[i] === '{') braceCount++;
                if (fullTextContent[i] === '}') braceCount--;
                if (i === offset) {
                    if (braceCount > 0) {
                        isInsideTag = true;
                        console.log(`[ReferenceColumnSettingsDND] Cursor is inside a {} tag structure at position ${i}.`);
                    }
                    break;
                }
            }

            if (isInsideTag) {
                const warningMsg = 'Вставка внутри существующего тега недопустима.';
                console.warn('[ReferenceColumnSettingsDND] Insertion blocked: ' + warningMsg);
                onError?.(warningMsg);
                return;
            }
        } else {
            console.warn('[ReferenceColumnSettingsDND] No selection range found.');
        }
    } else {
        console.warn('[ReferenceColumnSettingsDND] formatInputElementRef is not valid.');
    }

    onSuccess?.(fieldPath);
}

/**
 * Вставляет ключ (например, {fieldName}) в текущую позицию курсора внутри contenteditable элемента.
 * @param {string} fieldPath - Путь к полю (например, 'name' или 'brand.name').
 * @param {Object} formatInputElementRef - Ссылка на элемент contenteditable (ref).
 * @param {Function} onUpdateModel - Callback для обновления связанной модели данных (например, displayFormat).
 */
export function insertKeyAtCursor(fieldPath, formatInputElementRef, onUpdateModel) {
    console.log('[ReferenceColumnSettingsDND] insertKeyAtCursor called with:', fieldPath);
    const formatInputEl = formatInputElementRef.value;
    if (!formatInputEl) {
        console.error('[ReferenceColumnSettingsDND] formatInputElementRef is null or undefined');
        return;
    }

    const newKey = `{${fieldPath}}`;
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(newKey);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('[ReferenceColumnSettingsDND] Key inserted and cursor positioned.');
    } else {
        formatInputEl.textContent += newKey;
        console.log('[ReferenceColumnSettingsDND] Key appended to the end.');
    }

    onUpdateModel?.();
    console.log('[ReferenceColumnSettingsDND] insertKeyAtCursor finished.');
}

/**
 * Добавляет ключ в формат по клику (в конец).
 * @param {Object|string} fieldOrPath - Объект поля или строка пути.
 * @param {Object} options - Опции.
 * @param {Function} options.onInsert - Callback для выполнения логики вставки.
 * @param {string} options.editMode - Текущий режим редактирования ('text' | 'blocks').
 * @param {Array} options.formatBlocks - Реактивный массив блоков (для режима 'blocks').
 * @param {Function} options.updateModelFn - Функция для обновления displayFormat и emit.
 */
export function addKeyToFormat(fieldOrPath, { onInsert, editMode, formatBlocks, updateModelFn }) {
    console.log('[ReferenceColumnSettingsDND] addKeyToFormat called with:', fieldOrPath, 'in mode:', editMode);
    const path = typeof fieldOrPath === 'object' && fieldOrPath !== null ? fieldOrPath.path : fieldOrPath;
    if (path) {
        if (editMode === 'text') {
            onInsert?.(path);
        } else if (editMode === 'blocks') {
            // В блочном режиме добавляем в конец
            formatBlocks.push({ type: 'tag', value: path });
            // Сериализуем и обновляем модель через переданную функцию
            const newFormat = formatBlocks.map(b => b.type === 'tag' ? `{${b.value}}` : b.value).join('');
            updateModelFn(newFormat);
        }
    } else {
        console.warn('[ReferenceColumnSettingsDND] addKeyToFormat: Invalid field or path provided.');
    }
}

// === Логика для БЛОЧНОГО режима ===

/**
 * Обрабатывает событие drop в области конструктора формата в БЛОЧНОМ режиме.
 * Создает новый блок тега и вставляет его в контейнер.
 * @param {DragEvent} event - Событие drop.
 * @param {Object} options - Опции.
 * @param {Function} options.onBlockDrop - Callback, вызываемый с путем поля и индексом вставки.
 * @param {Object} options.formatBlocksContainerRef - Ссылка на контейнер блоков (ref).
 */
export function dropKeyBlocksMode(event, { onBlockDrop, formatBlocksContainerRef }) {
    console.log('[ReferenceColumnSettingsDND] dropKeyBlocksMode called');
    event.preventDefault();
    event.stopPropagation();

    let fieldPath = null;
    if (event.dataTransfer) {
        fieldPath = event.dataTransfer.getData('application/x-reference-field-path');
    }

    if (!fieldPath) {
        console.warn('[ReferenceColumnSettingsDND] dropKeyBlocksMode: Not a reference field path.');
        return;
    }
    console.log('[ReferenceColumnSettingsDND] Field path for block found:', fieldPath);

    const containerEl = formatBlocksContainerRef.value;
    if (containerEl) {
        let insertIndex = containerEl.children.length;
        const children = Array.from(containerEl.children);
        for (let i = 0; i < children.length; i++) {
            const childRect = children[i].getBoundingClientRect();
            if (event.clientX < childRect.left + childRect.width / 2) {
                insertIndex = i;
                break;
            }
        }
        console.log(`[ReferenceColumnSettingsDND] Calculated insert index: ${insertIndex}`);
        onBlockDrop?.(fieldPath, insertIndex);
    } else {
        console.warn('[ReferenceColumnSettingsDND] formatBlocksContainerRef is not valid.');
    }
}

/**
 * Заглушка для перетаскивания блоков внутри контейнера (реордеринг).
 * @param {DragEvent} event - Событие dragstart.
 * @param {Object} block - Блок, который начал перетаскиваться.
 */
export function dragStartBlock(event, block) {
    console.log('[ReferenceColumnSettingsDND] dragStartBlock for block (reordering not implemented)', block);
    event.preventDefault();
}

// === Обработчики событий из компонента (прокси) ===

/**
 * Проксирует событие drop в текстовом режиме в низкоуровневую функцию.
 * @param {DragEvent} event - Событие drop.
 * @param {Object} context - Контекст выполнения из компонента.
 * @param {Object} context.refs - Refs компонента (formatInput).
 * @param {Function} context.updateModelFn - Функция обновления displayFormat и emit.
 * @param {Function} context.messageFn - Функция для показа сообщений (ElMessage.warning).
 */
export function handleDropTextMode(event, { refs, updateModelFn, messageFn }) {
    console.log('[ReferenceColumnSettingsDND.handleDropTextMode] Proxying to dropKeyTextMode');
    dropKeyTextMode(event, {
        onSuccess: (fieldPath) => {
            console.log('[ReferenceColumnSettingsDND.handleDropTextMode] onSuccess:', fieldPath);
            insertKeyAtCursor(fieldPath, refs.formatInput, () => {
                const currentTextContent = refs.formatInput.value?.textContent || '';
                updateModelFn(currentTextContent);
            });
        },
        onError: (message) => {
            console.warn('[ReferenceColumnSettingsDND.handleDropTextMode] onError:', message);
            messageFn(message);
        },
        formatInputElementRef: refs.formatInput
    });
}

/**
 * Проксирует событие dragover.
 * @param {DragEvent} event - Событие dragover.
 */
export function handleDragOver(event) {
    console.log('[ReferenceColumnSettingsDND.handleDragOver] Proxying to dragOverFormat');
    dragOverFormat(event);
}

/**
 * Проксирует событие dragstart для поля.
 * @param {DragEvent} event - Событие dragstart.
 * @param {Object} field - Поле справочника.
 */
export function handleDragStart(event, field) {
    console.log('[ReferenceColumnSettingsDND.handleDragStart] Proxying to dragStartKey');
    dragStartKey(event, field);
}

/**
 * Проксирует событие dragstart для блока (заглушка).
 * @param {DragEvent} event - Событие dragstart.
 * @param {Object} block - Блок.
 */
export function handleDragStartBlock(event, block) {
    console.log('[ReferenceColumnSettingsDND.handleDragStartBlock] Proxying to dragStartBlock');
    dragStartBlock(event, block);
}

/**
 * Проксирует событие drop в блочном режиме в низкоуровневую функцию.
 * @param {DragEvent} event - Событие drop.
 * @param {Object} context - Контекст выполнения из компонента.
 * @param {Object} context.refs - Refs компонента (formatBlocksContainer).
 * @param {Array} context.formatBlocks - Реактивный массив блоков.
 * @param {Function} context.updateModelFn - Функция обновления displayFormat и emit.
 */
export function handleDropBlocksMode(event, { refs, formatBlocks, updateModelFn }) {
    console.log('[ReferenceColumnSettingsDND.handleDropBlocksMode] Proxying to dropKeyBlocksMode');
    dropKeyBlocksMode(event, {
        onBlockDrop: (fieldPath, insertIndex) => {
            console.log(`[ReferenceColumnSettingsDND.handleDropBlocksMode] Dropping block {${fieldPath}} at index ${insertIndex}`);
            formatBlocks.splice(insertIndex, 0, { type: 'tag', value: fieldPath });
            const newFormat = formatBlocks.map(b => b.type === 'tag' ? `{${b.value}}` : b.value).join('');
            updateModelFn(newFormat);
        },
        formatBlocksContainerRef: refs.formatBlocksContainer
    });
}

/**
 * Проксирует событие клика по полю в низкоуровневую функцию.
 * @param {Object} field - Поле справочника.
 * @param {Object} context - Контекст выполнения из компонента.
 * @param {string} context.editMode - Текущий режим редактирования.
 * @param {Array} context.formatBlocks - Реактивный массив блоков.
 * @param {Function} context.updateModelFn - Функция обновления displayFormat и emit.
 * @param {Function} context.onInsertText - Callback для вставки в текстовый режим.
 */
export function handleAddKey(field, { editMode, formatBlocks, updateModelFn, onInsertText }) {
    console.log('[ReferenceColumnSettingsDND.handleAddKey] Proxying to addKeyToFormat');
    addKeyToFormat(field, {
        onInsert: onInsertText,
        editMode,
        formatBlocks,
        updateModelFn
    });
}
