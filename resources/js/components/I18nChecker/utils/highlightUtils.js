/**
 * ============================================================================
 * HIGHLIGHT UTILS — УТИЛИТЫ ПОДСВЕТКИ ПОИСКА
 * ============================================================================
 *
 * 📁 Файл: highlightUtils.js
 * 📝 Описание: Логика подсветки найденного текста в поиске
 * 🔗 Используется во всех режимах: Simple, Scanner, Validator
 *
 * ============================================================================
 * ФУНКЦИИ
 * ============================================================================
 *
 * hexToRgb(hex)              ← Конвертация HEX в RGB
 * getLuminance(r, g, b)      ← Расчёт яркости (WCAG)
 * getContrastTextColor(hex)  ← Авто-выбор чёрный/белый
 * getHighlightStyle(color)   ← Полный стиль подсветки
 * styleObjectToString(style) ← Конвертация стилей в CSS-строку
 * highlightText(text, query, color) ← Подсветка с цветом
 *
 * ============================================================================
 */

// ============================================================================
// КОНВЕРТАЦИЯ ЦВЕТОВ
// ============================================================================

/**
 * Конвертация HEX в RGB
 * @param {string} hex - Цвет в формате #RRGGBB или #RGB
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };

    let cleanHex = hex.replace('#', '');

    // Короткая форма #RGB → #RRGGBB
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }

    const num = parseInt(cleanHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

// ============================================================================
// WCAG КОНТРАСТНОСТЬ
// ============================================================================

/**
 * Расчёт относительной яркости по WCAG 2.0
 * Формула: L = 0.2126 × R + 0.7152 × G + 0.0722 × B
 * @param {number} r - Красный (0-255)
 * @param {number} g - Зелёный (0-255)
 * @param {number} b - Синий (0-255)
 * @returns {number} Яркость от 0 (чёрный) до 1 (белый)
 */
export function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const sRGB = c / 255;
        return sRGB <= 0.03928
            ? sRGB / 12.92
            : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Авто-выбор контрастного цвета текста
 * @param {string} backgroundColor - HEX цвет фона
 * @returns {string} HEX цвет текста (#000000 или #ffffff)
 */
export function getContrastTextColor(backgroundColor) {
    const { r, g, b } = hexToRgb(backgroundColor);
    const luminance = getLuminance(r, g, b);
    // Порог 0.5 — если яркость выше, фон светлый → чёрный текст
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================================================
// СТИЛИ ПОДСВЕТКИ
// ============================================================================

/**
 * Генерация полного стиля подсветки
 * @param {string} backgroundColor - HEX цвет фона
 * @returns {Object} Объект со стилями
 */
export function getHighlightStyle(backgroundColor) {
    const textColor = getContrastTextColor(backgroundColor);
    return {
        backgroundColor,
        color: textColor,
        borderBottom: `2px solid ${backgroundColor}`,
        padding: '0 1px',
        borderRadius: '1px',
        fontWeight: '600'
    };
}

/**
 * Конвертация объекта стилей в CSS-строку
 * @param {Object} style - Объект {camelCase: value}
 * @returns {string} CSS-строка "property: value; ..."
 */
export function styleObjectToString(style) {
    return Object.entries(style)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}:${value}`;
        })
        .join(';');
}

// ============================================================================
// ПОДСВЕТКА ТЕКСТА
// ============================================================================

/**
 * Экранирование спецсимволов regex
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Подсветка найденного текста с авто-контрастом
 * @param {string} text - Исходный текст
 * @param {string} query - Поисковый запрос
 * @param {string} color - HEX цвет фона подсветки (опционально)
 * @returns {string} HTML с подсвеченными фрагментами
 */
export function highlightText(text, query, color = '#fff3b0') {
    // Пустой text — нормальное поведение (el-table рендерит пустые ячейки)
    if (!text) return '';
    if (!query || !query.trim()) return text;

    const escapedQuery = escapeRegex(query.trim());
    if (!escapedQuery) return text;

    const style = getHighlightStyle(color);
    const styleString = styleObjectToString(style);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    return text.replace(regex, `<mark class="i18n-highlight" style="${styleString}">$1</mark>`);
}
