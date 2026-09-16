// ============================================================================
// КОНФИГУРАЦИЯ ФОРМАТИРОВАНИЯ СПИСКА ПОЛЕЙ
// Единая точка настройки. При доработке менять только здесь.
// ============================================================================

/**
 * Настройки форматирования списка полей для копирования и превью.
 */
export const FIELD_LIST_CONFIG = {
    // Режимы отображения списка
    VIEW_MODES: {
        VERTICAL: 'vertical',
        HORIZONTAL: 'horizontal'
    },

    // Режим по умолчанию
    DEFAULT_VIEW_MODE: 'vertical',

    // Обёртка поля: одинарная кавычка для PHP $fillable
    FIELD_QUOTE: "'",

    // Суффикс после поля в вертикальном режиме (запятая)
    FIELD_SUFFIX: ',',

    // Разделитель в горизонтальном режиме (запятая + пробел)
    INLINE_SEPARATOR: ', ',

    // Символ переноса строки в вертикальном режиме.
    // Unix/Linux/macOS: '\n' | Windows: '\r\n'
    LINE_BREAK: '\n',

    // Показывать количество полей в бейдже рядом с заголовком
    SHOW_FIELD_COUNT: true
}

/**
 * Массив обёрнутых полей с суффиксом (для рендера списка по <li> и копирования).
 * @param {string[]} fields - ['pending_new_email', 'pending_email_token']
 * @returns {string[]} ["'pending_new_email',", "'pending_email_token',"]
 */
export const getFieldLines = (fields) => {
    const { FIELD_QUOTE, FIELD_SUFFIX } = FIELD_LIST_CONFIG
    return fields.map((field) => `${FIELD_QUOTE}${field}${FIELD_QUOTE}${FIELD_SUFFIX}`)
}

/**
 * Вертикальный формат (строка): каждое поле с новой строки, запятая после каждого.
 * 'field',
 * 'field',
 * 'field',
 * @param {string[]} fields
 * @returns {string}
 */
export const formatFieldsVertical = (fields) => {
    return getFieldLines(fields).join(FIELD_LIST_CONFIG.LINE_BREAK)
}

/**
 * Горизонтальный формат (строка): все поля в одну строку.
 * Запятая только как разделитель (нет после последнего).
 * 'field', 'field', 'field'
 * @param {string[]} fields
 * @returns {string}
 */
export const formatFieldsHorizontal = (fields) => {
    const { FIELD_QUOTE, INLINE_SEPARATOR } = FIELD_LIST_CONFIG
    return fields.map((field) => `${FIELD_QUOTE}${field}${FIELD_QUOTE}`).join(INLINE_SEPARATOR)
}

/**
 * Форматирование по режиму отображения.
 * @param {string[]} fields
 * @param {string} mode - 'vertical' | 'horizontal'
 * @returns {string}
 */
export const formatFieldsByMode = (fields, mode) => {
    return mode === FIELD_LIST_CONFIG.VIEW_MODES.VERTICAL
        ? formatFieldsVertical(fields)
        : formatFieldsHorizontal(fields)
}

// ============================================================================
// КОПИРОВАНИЕ В БУФЕР ОБМЕНА
// ============================================================================

/**
 * Копирование текста в буфер обмена с уведомлением.
 * Поддерживает fallback для небезопасного контекста (HTTP без HTTPS),
 * где navigator.clipboard недоступен (стенд 94.41.87.10:8050).
 * @param {string} text - Текст для копирования
 * @param {string} [successMessage] - Кастомное сообщение об успехе
 */
export const copyToClipboard = async (text, successMessage = 'Скопировано') => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            console.log('[copyToClipboard] путь: navigator.clipboard (secure context)') // 🔥 DEBUG
            await navigator.clipboard.writeText(text)
        } else {
            console.log('[copyToClipboard] путь: textarea-fallback (HTTP)', { // 🔥 DEBUG
                isSecureContext: window.isSecureContext,
                hasNavigatorClipboard: !!navigator.clipboard
            })
            copyViaTextarea(text)
        }
        console.log('[copyToClipboard] скопировано:', text) // 🔥 DEBUG
        ElMessage.success(successMessage)
    } catch (error) {
        console.error('Ошибка копирования:', error)
        ElMessage.error('Не удалось скопировать')
    }
}

/**
 * Легаси-копирование через временный textarea (работает по HTTP)
 * @param {string} text - Текст для копирования
 */
const copyViaTextarea = (text) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, text.length)

    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (!ok) {
        throw new Error('document.execCommand("copy") вернул false')
    }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ УТИЛИТЫ
// ============================================================================

/**
 * Форматирование CLI-команды для отображения
 * @param {string} command - Команда
 * @returns {string}
 */
export const formatCliCommand = (command) => {
    return command?.trim() || ''
}

/**
 * Получение иконки для типа действия
 * @param {'info'|'warning'|'danger'} type
 * @returns {string} Имя иконки Element Plus
 */
export const getActionIcon = (type) => {
    const icons = {
        info: 'InfoFilled',
        warning: 'WarningFilled',
        danger: 'CircleCloseFilled'
    }
    return icons[type] || 'InfoFilled'
}

/**
 * Получение типа кнопки для типа действия
 * @param {'info'|'warning'|'danger'} type
 * @returns {string} Тип кнопки Element Plus
 */
export const getActionButtonType = (type) => {
    const types = {
        info: 'primary',
        warning: 'warning',
        danger: 'danger'
    }
    return types[type] || 'primary'
}
