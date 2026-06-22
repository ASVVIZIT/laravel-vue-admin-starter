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
    // Заголовок и режимы — CUSTOM
    'i18n.title': { source: 'custom', name: 'Translate', size: 24 },
    'i18n.simpleMode': { source: 'custom', name: 'CheckCircle', size: 20 },
    'i18n.scannerMode': { source: 'custom', name: 'Search', size: 20 },
    'i18n.validatorMode': { source: 'fenix', name: 'Warning', size: 20 },

    // Действия — CUSTOM
    'search': { source: 'custom', name: 'Search', size: 16 },
    'refresh': { source: 'bootstrap', name: 'arrow-clockwise', size: 16 },
    'export': { source: 'bootstrap', name: 'download', size: 16 },
    'copy': { source: 'bootstrap', name: 'clipboard', size: 16 },

    // Статусы — CUSTOM
    'missing': { source: 'custom', name: 'ExclamationCircle', size: 16 },
    'success': { source: 'custom', name: 'CheckCircle', size: 20 },
    'warning': { source: 'fenix', name: 'Warning', size: 16 },
    'info': { source: 'bootstrap', name: 'info-circle', size: 16 },

    // Специфичные для модуля — CUSTOM
    'key': { source: 'custom', name: 'Key', size: 16 },

    // Настройки и действия
    'settings': { source: 'custom', name: 'Gear', size: 16 },
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
