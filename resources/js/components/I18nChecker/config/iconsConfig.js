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

export const ICONS = {
    // Заголовок и режимы
    'i18n.title': { source: 'bootstrap', name: 'translate', size: 24 },
    'i18n.simpleMode': { source: 'bootstrap', name: 'check-circle', size: 20 },
    'i18n.scannerMode': { source: 'bootstrap', name: 'search', size: 20 },
    'i18n.validatorMode': { source: 'bootstrap', name: 'exclamation-triangle', size: 20 },

    // Действия
    'search': { source: 'bootstrap', name: 'search', size: 16 },
    'refresh': { source: 'bootstrap', name: 'arrow-clockwise', size: 16 },
    'export': { source: 'bootstrap', name: 'download', size: 16 },
    'copy': { source: 'bootstrap', name: 'clipboard', size: 16 },

    // Статусы
    'missing': { source: 'bootstrap', name: 'exclamation-circle', size: 16 },
    'success': { source: 'bootstrap', name: 'check-circle', size: 20 },
    'warning': { source: 'bootstrap', name: 'exclamation-triangle', size: 16 },
    'info': { source: 'bootstrap', name: 'info-circle', size: 16 },

    // Специфичные для модуля
    'key': { source: 'bootstrap', name: 'key', size: 16 },

    // 🔥 Настройки и действия (НОВЫЕ)
    'settings': { source: 'bootstrap', name: 'gear', size: 16 },
    'close': { source: 'bootstrap', name: 'x', size: 16 }
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
