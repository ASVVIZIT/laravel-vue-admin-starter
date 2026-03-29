/**
 * ============================================================================
 * CHANNEL TYPES CONFIG — КОНФИГУРАЦИЯ ТИПОВ КАНАЛОВ
 * ============================================================================
 * 📁 Путь: config/channels/appConfigChannelTypes.js
 * ✅ Используется: Валидация, Форма, Таблица, Список
 * ✅ Безопасно менять — влияет на все типы каналов
 * ✅ ЕДИНЫЙ ИСТОЧНИК — все импортируют отсюда
 * ============================================================================
 */

// ============================================================================
// БАЗОВЫЕ ТИПЫ (одиночные)
// ============================================================================

export const CHANNEL_TYPES = {
    SOCIAL_NETWORK: 'social_network',
    MESSENGER: 'messenger',
    MESSENGER_GROUP: 'messenger_group',
    GIS_MAP: 'gis_map',
    YANDEX_MAP: 'yandex_map',
    EMAIL: 'email',
    PHONE_NUMBER: 'phone_number',
    WEBSITE: 'website',
    VIDEO: 'video',
    DOCUMENT: 'document',
    BLOG: 'blog',
    FORUM: 'forum',
    SUPPORT: 'support',
    CHAT: 'chat',
    API: 'api',
    OTHER: 'other',
};

// ============================================================================
// ЛЕЙБЛЫ ТИПОВ
// ============================================================================

export const CHANNEL_TYPE_LABELS = {
    [CHANNEL_TYPES.SOCIAL_NETWORK]: 'Соцсеть',
    [CHANNEL_TYPES.MESSENGER]: 'Мессенджер',
    [CHANNEL_TYPES.MESSENGER_GROUP]: 'Группа',
    [CHANNEL_TYPES.GIS_MAP]: '2GIS Карта',
    [CHANNEL_TYPES.YANDEX_MAP]: 'Яндекс Карта',
    [CHANNEL_TYPES.EMAIL]: 'Email',
    [CHANNEL_TYPES.PHONE_NUMBER]: 'Телефон',
    [CHANNEL_TYPES.WEBSITE]: 'Сайт',
    [CHANNEL_TYPES.VIDEO]: 'Видео',
    [CHANNEL_TYPES.DOCUMENT]: 'Документ',
    [CHANNEL_TYPES.BLOG]: 'Блог',
    [CHANNEL_TYPES.FORUM]: 'Форум',
    [CHANNEL_TYPES.SUPPORT]: 'Поддержка',
    [CHANNEL_TYPES.CHAT]: 'Чат',
    [CHANNEL_TYPES.API]: 'API',
    [CHANNEL_TYPES.OTHER]: 'Другое',
};

// ============================================================================
// КОНФИГ ПОЛЕЙ ПО ТИПАМ
// ============================================================================

export const CHANNEL_TYPE_FIELD_CONFIG = {
    // URL требуется для этих типов
    typesWithUrl: [
        CHANNEL_TYPES.SOCIAL_NETWORK,
        CHANNEL_TYPES.MESSENGER,
        CHANNEL_TYPES.MESSENGER_GROUP,
        CHANNEL_TYPES.WEBSITE,
        CHANNEL_TYPES.VIDEO,
        CHANNEL_TYPES.BLOG,
        CHANNEL_TYPES.FORUM,
        CHANNEL_TYPES.SUPPORT,
        CHANNEL_TYPES.CHAT,
        CHANNEL_TYPES.API,
    ],

    // Identifier требуется для этих типов
    typesWithIdentifier: [
        CHANNEL_TYPES.EMAIL,
        CHANNEL_TYPES.PHONE_NUMBER,
        CHANNEL_TYPES.MESSENGER,
        CHANNEL_TYPES.MESSENGER_GROUP,
        CHANNEL_TYPES.SOCIAL_NETWORK,
        CHANNEL_TYPES.SUPPORT,
        CHANNEL_TYPES.CHAT,
        CHANNEL_TYPES.API,
    ],

    // Metadata требуется для этих типов
    typesWithMetadata: [
        CHANNEL_TYPES.GIS_MAP,
        CHANNEL_TYPES.YANDEX_MAP,
        CHANNEL_TYPES.MESSENGER_GROUP,
        CHANNEL_TYPES.VIDEO,
        CHANNEL_TYPES.DOCUMENT,
        CHANNEL_TYPES.BLOG,
        CHANNEL_TYPES.FORUM,
        CHANNEL_TYPES.API,
        CHANNEL_TYPES.OTHER,
    ],
};

// ============================================================================
// HELPER FUNCTIONS — ПРОВЕРКА ТИПОВ
// ============================================================================

export function hasUrlField(type) {
    return !type || CHANNEL_TYPE_FIELD_CONFIG.typesWithUrl.includes(type);
}

export function hasIdentifierField(type) {
    return !type || CHANNEL_TYPE_FIELD_CONFIG.typesWithIdentifier.includes(type);
}

export function hasMetadataField(type) {
    return !type || CHANNEL_TYPE_FIELD_CONFIG.typesWithMetadata.includes(type);
}

// ============================================================================
// CHANNEL TYPE ICONS
// ============================================================================

export const CHANNEL_TYPE_ICONS = {
    [CHANNEL_TYPES.SOCIAL_NETWORK]: 'Connection',
    [CHANNEL_TYPES.MESSENGER]: 'ChatLineSquare',
    [CHANNEL_TYPES.MESSENGER_GROUP]: 'ChatLineRound',
    [CHANNEL_TYPES.GIS_MAP]: 'Position',
    [CHANNEL_TYPES.YANDEX_MAP]: 'Position',
    [CHANNEL_TYPES.EMAIL]: 'Message',
    [CHANNEL_TYPES.PHONE_NUMBER]: 'Phone',
    [CHANNEL_TYPES.WEBSITE]: 'Link',
};

// ============================================================================
// ВАЛИДАЦИЯ IDENTIFIER ПО ТИПАМ
// ============================================================================

export const IDENTIFIER_VALIDATION_RULES = {
    // Соцсети — username (anna.sazonova, @username)
    [CHANNEL_TYPES.SOCIAL_NETWORK]: {
        type: 'username',
        pattern: /^[a-zA-Z0-9._@-]{3,50}$/,
        message: 'Некорректный username (разрешены буквы, цифры, . _ - @)',
    },

    // Email — только email
    [CHANNEL_TYPES.EMAIL]: {
        type: 'email',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Некорректный email',
    },

    // Телефон — только телефон
    [CHANNEL_TYPES.PHONE_NUMBER]: {
        type: 'phone',
        pattern: /^[\d\s\+\-\(\)]{7,20}$/,
        message: 'Некорректный телефон',
    },

    // Мессенджеры — username ИЛИ телефон
    [CHANNEL_TYPES.MESSENGER]: {
        type: 'username_or_phone',
        patterns: [
            /^[a-zA-Z0-9._@-]{3,50}$/,  // username
            /^[\d\s\+\-\(\)]{7,20}$/,   // phone
        ],
        message: 'Некорректный контакт (username или телефон)',
    },

    [CHANNEL_TYPES.MESSENGER_GROUP]: {
        type: 'username_or_phone',
        patterns: [
            /^[a-zA-Z0-9._@-]{3,50}$/,
            /^[\d\s\+\-\(\)]{7,20}$/,
        ],
        message: 'Некорректный контакт (username или телефон)',
    },
};

// ============================================================================
// ПОДДЕРЖКА НЕСКОЛЬКИХ ТИПОВ (НА БУДУЩЕЕ)
// ============================================================================

/**
 * Проверить является ли значение массивом типов
 */
export function isMultiType(value) {
    return Array.isArray(value);
}

/**
 * Нормализовать типы (преобразовать в массив)
 */
export function normalizeTypes(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

/**
 * Проверить валидацию для нескольких типов
 */
export function validateForMultiTypes(identifier, types) {
    const normalizedTypes = normalizeTypes(types);

    if (normalizedTypes.length === 1) {
        return validateIdentifierByType(identifier, normalizedTypes[0]);
    }

    for (const type of normalizedTypes) {
        const rules = IDENTIFIER_VALIDATION_RULES[type];
        if (!rules) continue;

        if (rules.type === 'username_or_phone') {
            const matches = rules.patterns.some(pattern => pattern.test(identifier));
            if (matches) {
                return { valid: true, message: '' };
            }
        } else {
            if (!rules.pattern.test(identifier)) {
                return { valid: false, message: rules.message };
            }
        }
    }

    return { valid: true, message: '' };
}

/**
 * Основная функция валидации
 */
export function validateIdentifierByType(identifier, type) {
    if (!identifier || identifier === '') {
        return { valid: true, message: '' };
    }

    if (isMultiType(type)) {
        return validateForMultiTypes(identifier, type);
    }

    const rules = IDENTIFIER_VALIDATION_RULES[type];

    if (!rules) {
        return { valid: true, message: '' };
    }

    if (rules.type === 'username_or_phone') {
        const matches = rules.patterns.some(pattern => pattern.test(identifier));
        if (matches) {
            return { valid: true, message: '' };
        }
        return { valid: false, message: rules.message };
    }

    if (!rules.pattern.test(identifier)) {
        return { valid: false, message: rules.message };
    }

    return { valid: true, message: '' };
}

// ============================================================================
// HELPER — ПРОВЕРКА ДОСТУПНОСТИ ПОЛЯ ПО ТИПУ КАНАЛА
// ============================================================================

export function isFieldAvailable(fieldName, channelType) {
    if (!channelType) {
        return { available: true, reason: '' };
    }

    const types = normalizeTypes(channelType);

    switch (fieldName) {
        case 'url':
            if (types.some(t => CHANNEL_TYPE_FIELD_CONFIG.typesWithUrl.includes(t))) {
                return { available: true, reason: '' };
            }
            return {
                available: false,
                reason: `Поле недоступно для типа "${getChannelTypeLabel(types[0])}"`
            };

        case 'identifier':
            if (types.some(t => CHANNEL_TYPE_FIELD_CONFIG.typesWithIdentifier.includes(t))) {
                return { available: true, reason: '' };
            }
            return {
                available: false,
                reason: `Поле недоступно для типа "${getChannelTypeLabel(types[0])}"`
            };

        case 'metadata':
            if (types.some(t => CHANNEL_TYPE_FIELD_CONFIG.typesWithMetadata.includes(t))) {
                return { available: true, reason: '' };
            }
            return {
                available: false,
                reason: `Поле недоступно для типа "${getChannelTypeLabel(types[0])}"`
            };

        default:
            return { available: true, reason: '' };
    }
}

// ============================================================================
// HELPER FUNCTIONS — ЭКСПОРТИРУЕМЫЕ
// ============================================================================

/**
 * Получить лейбл типа канала
 */
export function getChannelTypeLabel(type) {
    return CHANNEL_TYPE_LABELS[type] || type;
}

/**
 * Получить все типы каналов
 */
export function getChannelTypes() {
    return Object.values(CHANNEL_TYPES);
}

/**
 * Получить опции для select (value + label)
 */
export function getChannelTypeOptions() {
    return Object.entries(CHANNEL_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));
}

/**
 * Получить иконку для типа канала
 */
export function getChannelTypeIcon(type) {
    return CHANNEL_TYPE_ICONS[type] || 'Link';
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export default {
    CHANNEL_TYPES,
    CHANNEL_TYPE_LABELS,
    CHANNEL_TYPE_FIELD_CONFIG,
    CHANNEL_TYPE_ICONS,
    IDENTIFIER_VALIDATION_RULES,
    hasUrlField,
    hasIdentifierField,
    hasMetadataField,
    isMultiType,
    normalizeTypes,
    validateForMultiTypes,
    validateIdentifierByType,
    isFieldAvailable,
    getChannelTypeLabel,
    getChannelTypes,
    getChannelTypeOptions,
    getChannelTypeIcon,
};
