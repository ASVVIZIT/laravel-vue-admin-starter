/**
 * ============================================================================
 * GRADIENT UTILS — Утилиты для работы с градиентами в Fenix иконках
 * ============================================================================
 * 📁 Путь: @/components/FenixIconVue/utils/gradientUtils.js
 * ✅ Переиспользуется во всех Fenix иконках для генерации градиентов
 * ============================================================================
 */

/**
 * Осветлить цвет на указанный процент
 *
 * @param {String} color - HEX цвет (например: '#ff0000')
 * @param {Number} percent - Процент осветления (0-100)
 * @returns {String} - Новый HEX цвет
 *
 * @example
 * lightenColor('#ff0000', 20) → '#ff3333'
 */
export const lightenColor = (color, percent = 20) => {
    if (!color || color === 'currentColor') return '#37aee2'

    try {
        // Убираем # если есть
        let hex = color.replace('#', '')

        // Если 3-значный HEX, расширяем до 6-значного
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('')
        }

        const num = parseInt(hex, 16)
        const amt = Math.round(2.55 * percent)

        const R = Math.min(255, (num >> 16) + amt)
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
        const B = Math.min(255, (num & 0x0000FF) + amt)

        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
    } catch (e) {
        console.warn('[gradientUtils] lightenColor failed:', e)
        return color
    }
}

/**
 * Затемнить цвет на указанный процент
 *
 * @param {String} color - HEX цвет
 * @param {Number} percent - Процент затемнения (0-100)
 * @returns {String} - Новый HEX цвет
 *
 * @example
 * darkenColor('#ff0000', 20) → '#cc0000'
 */
export const darkenColor = (color, percent = 20) => {
    if (!color || color === 'currentColor') return '#1e96c8'

    try {
        let hex = color.replace('#', '')

        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('')
        }

        const num = parseInt(hex, 16)
        const amt = Math.round(2.55 * percent)

        const R = Math.max(0, (num >> 16) - amt)
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
        const B = Math.max(0, (num & 0x0000FF) - amt)

        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
    } catch (e) {
        console.warn('[gradientUtils] darkenColor failed:', e)
        return color
    }
}

/**
 * Создать градиентные цвета из базового
 *
 * @param {String} color - HEX цвет
 * @param {Number} intensity - Интенсивность (по умолчанию 20)
 * @returns {Object} - { start: String, end: String }
 *
 * @example
 * createGradientColors('#ff0000', 20)
 * → { start: '#ff3333', end: '#cc0000' }
 */
export const createGradientColors = (color, intensity = 20) => ({
    start: lightenColor(color, intensity),
    end: darkenColor(color, intensity)
})

/**
 * Проверить валидность HEX цвета
 *
 * @param {String} color - Строка цвета
 * @returns {Boolean}
 */
export const isValidHexColor = (color) => {
    if (!color || typeof color !== 'string') return false
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)
}

/**
 * Конвертировать RGB в HEX
 *
 * @param {Number} r - Red (0-255)
 * @param {Number} g - Green (0-255)
 * @param {Number} b - Blue (0-255)
 * @returns {String} - HEX цвет
 */
export const rgbToHex = (r, g, b) => {
    return `#${[r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, x)).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('')}`
}

/**
 * Конвертировать HEX в RGB
 *
 * @param {String} hex - HEX цвет
 * @returns {Object} - { r, g, b }
 */
export const hexToRgb = (hex) => {
    let cleanHex = hex.replace('#', '')

    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('')
    }

    const num = parseInt(cleanHex, 16)
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    }
}

export default {
    lightenColor,
    darkenColor,
    createGradientColors,
    isValidHexColor,
    rgbToHex,
    hexToRgb
}
