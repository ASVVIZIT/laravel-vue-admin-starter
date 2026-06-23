export const ICON_SOURCES = {
    BOOTSTRAP: 'bootstrap',
    FENIX: 'fenix',
    CUSTOM: 'custom'
};

export const ICON_DEFAULTS = {
    source: ICON_SOURCES.BOOTSTRAP,
    size: 20,
    color: 'currentColor'
};

/**
 * ============================================================================
 * КОНФИГ ИКОНОК — ЕДИНСТВЕННЫЙ источник истины
 * ============================================================================
 * Все иконки модуля I18nChecker используют Fenix источник.
 * Если Fenix иконка не найдена — fallback на Bootstrap через iconMapping.js
 * ============================================================================
 */
export const ICONS = {
    // Заголовок и режимы
    'i18n.title':         { source: 'fenix', name: 'Translate', size: 24 },
    'i18n.simpleMode':    { source: 'fenix', name: 'Check',     size: 20 },
    'i18n.scannerMode':   { source: 'fenix', name: 'Scan',      size: 20 },
    'i18n.validatorMode': { source: 'fenix', name: 'Warning',   size: 20 },

    // Действия
    'search':  { source: 'fenix', name: 'Scan',    size: 16 },
    'refresh': { source: 'fenix', name: 'Refresh', size: 16 },
    'export':  { source: 'fenix', name: 'Export',  size: 16 },
    'copy':    { source: 'fenix', name: 'Copy',    size: 16 },

    // Статусы
    'missing': { source: 'fenix', name: 'Missing', size: 16 },
    'success': { source: 'fenix', name: 'Success', size: 20 },
    'warning': { source: 'fenix', name: 'Warning', size: 16 },
    'info':    { source: 'fenix', name: 'Info',    size: 16 },

    // Специфичные для модуля
    'key': { source: 'fenix', name: 'Key', size: 16 },

    // Настройки и действия
    'settings': { source: 'fenix', name: 'Settings', size: 16 },
    'close':    { source: 'fenix', name: 'Close',    size: 16 }
};

export const getIconConfig = (name) => {
    if (ICONS[name]) return { ...ICON_DEFAULTS, ...ICONS[name] };
    return null;
};

export const getIconSource = (name) => {
    const config = getIconConfig(name);
    return config?.source || ICON_DEFAULTS.source;
};

export const getIconRealName = (name) => {
    const config = getIconConfig(name);
    return config?.name || name;
};

export const getIconSize = (name) => {
    const config = getIconConfig(name);
    return config?.size || ICON_DEFAULTS.size;
};

export const hasIcon = (name) => {
    return !!ICONS[name];
};
