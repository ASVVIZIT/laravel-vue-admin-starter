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
            // Современный путь (HTTPS / localhost)
            await navigator.clipboard.writeText(text)
        } else {
            // Fallback для HTTP
            copyViaTextarea(text)
        }
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
