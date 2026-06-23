/**
 * ============================================================================
 * ЕДИНЫЙ МАППИНГ ИКОНОК: Custom/Fenix имя → Bootstrap имя
 * ============================================================================
 * Используется в I18nIcon.vue для fallback на Bootstrap
 * когда Fenix/Custom иконка не найдена.
 * ============================================================================
 */

export const ICON_TO_BOOTSTRAP = {
    // Core
    'Translate': 'translate',
    'Language': 'globe',

    // Status
    'Check': 'check-circle',
    'CheckCircle': 'check-circle',
    'Missing': 'exclamation-circle',
    'ExclamationCircle': 'exclamation-circle',
    'Success': 'check-circle',
    'Error': 'x-circle',
    'Warning': 'exclamation-triangle',
    'Info': 'info-circle',
    'Pending': 'clock',

    // Files
    'File': 'file',
    'Folder': 'folder',
    'Code': 'code',
    'Json': 'filetype-json',

    // Actions
    'Scan': 'search',
    'Search': 'search',
    'Refresh': 'arrow-clockwise',
    'Upload': 'upload',
    'Download': 'download',
    'Export': 'download',
    'Import': 'box-arrow-in-down',
    'Copy': 'clipboard',

    // Editing
    'Edit': 'pencil',
    'Save': 'save',
    'Delete': 'trash',
    'Add': 'plus',
    'Close': 'x',

    // Analysis
    'Compare': 'arrow-left-right',
    'Diff': 'diff',
    'Filter': 'funnel',
    'Sort': 'sort-down',
    'Merge': 'merge',

    // Extras
    'Settings': 'gear',
    'Gear': 'gear',
    'Key': 'key',
    'Tag': 'tag',
    'Bell': 'bell',
    'Help': 'question-circle',

    // Social
    'Telegram': 'send',
    'Vk': 'chat',
    'WhatsApp': 'chat-dots',
    'YouTube': 'play-circle',
    'Instagram': 'camera',
    'Twitter': 'chat-square-text',
    'Facebook': 'chat-fill',
    'TikTok': 'music-note',
    'Pinterest': 'pin',
    'LinkedIn': 'briefcase',

    // Maps
    '2gis': 'geo-alt',
    'GoogleMaps': 'geo-alt',
    'YandexMaps': 'geo-alt',
    'Default': 'circle',
};

/**
 * Получить Bootstrap имя по Custom/Fenix имени
 * @param {String} name
 * @returns {String}
 */
export const getBootstrapName = (name) => {
    return ICON_TO_BOOTSTRAP[name] || name;
};

/**
 * Проверить есть ли маппинг
 * @param {String} name
 * @returns {Boolean}
 */
export const hasBootstrapMapping = (name) => {
    return !!ICON_TO_BOOTSTRAP[name];
};
