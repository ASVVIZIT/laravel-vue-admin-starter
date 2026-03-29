/**
 * ============================================================================
 * CHANNEL VALIDATION CONFIG — ЕДИНАЯ ВАЛИДАЦИЯ ДЛЯ ФОРМЫ И INLINE
 * ============================================================================
 * 📁 Путь: config/channels/appConfigChannelValidation.js
 * ✅ Используется: ChannelForm.vue, ChannelTable.vue, EditableCell.vue
 * ✅ Безопасно менять — влияет на всю валидацию каналов
 * ✅ Импортирует типы и валидацию из appConfigChannelTypes.js
 * ============================================================================
 */

import {
    CHANNEL_TYPES,
    CHANNEL_TYPE_FIELD_CONFIG,
    getChannelTypeLabel,
    validateIdentifierByType,
} from './appConfigChannelTypes.js';

// ============================================================================
// ТИПЫ ПОЛЕЙ КОТОРЫЕ ТРЕБУЮТ URL
// ============================================================================

export const TYPES_REQUIRING_URL = CHANNEL_TYPE_FIELD_CONFIG?.typesWithUrl || [
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
];

// ============================================================================
// ТИПЫ ПОЛЕЙ КОТОРЫЕ ТРЕБУЮТ IDENTIFIER
// ============================================================================

export const TYPES_REQUIRING_IDENTIFIER = CHANNEL_TYPE_FIELD_CONFIG?.typesWithIdentifier || [
    CHANNEL_TYPES.EMAIL,
    CHANNEL_TYPES.PHONE_NUMBER,
    CHANNEL_TYPES.MESSENGER,
    CHANNEL_TYPES.MESSENGER_GROUP,
    CHANNEL_TYPES.SOCIAL_NETWORK,
    CHANNEL_TYPES.SUPPORT,
    CHANNEL_TYPES.CHAT,
    CHANNEL_TYPES.API,
];

// ============================================================================
// ВАЛИДАЦИЯ URL
// ============================================================================

export function isValidUrl(url) {
    if (!url || url === '') return true;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// ВАЛИДАЦИЯ EMAIL
// ============================================================================

export function isValidEmail(email) {
    if (!email || email === '') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================================================
// ВАЛИДАЦИЯ TELEPHONE
// ============================================================================

export function isValidPhone(phone) {
    if (!phone || phone === '') return true;
    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
    return phoneRegex.test(phone);
}

// ============================================================================
// ВАЛИДАЦИЯ USERNAME
// ============================================================================

export function isValidUsername(identifier) {
    if (!identifier || identifier === '') return true;
    const usernameRegex = /^[a-zA-Z0-9._@-]{3,50}$/;
    return usernameRegex.test(identifier);
}

// ============================================================================
// ВАЛИДАЦИЯ JSON
// ============================================================================

export function isValidJson(jsonString) {
    if (!jsonString || jsonString === '') return true;
    try {
        JSON.parse(jsonString);
        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// ВАЛИДАЦИЯ INTEGER
// ============================================================================

export function isValidInteger(value, min = null, max = null) {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

// ============================================================================
// ВАЛИДАЦИЯ ПО ТИПУ КАНАЛА — URL
// ============================================================================

export function validateUrlByType(url, type) {
    if (!url || url === '') {
        return { valid: true, message: '' };
    }

    if (!TYPES_REQUIRING_URL.includes(type)) {
        return { valid: true, message: '' };
    }

    if (!isValidUrl(url)) {
        return {
            valid: false,
            message: 'Некорректный URL',
        };
    }

    return { valid: true, message: '' };
}

// ============================================================================
// УНИВЕРСАЛЬНАЯ ВАЛИДАЦИЯ ПОЛЯ
// ============================================================================

export function validateField(fieldName, value, context = {}) {
    const { type = null, min = null, max = null } = context;

    switch (fieldName) {
        case 'url':
            return validateUrlByType(value, type);

        case 'identifier':
            return validateIdentifierByType(value, type);

        case 'metadata':
            if (typeof value === 'string') {
                return isValidJson(value)
                    ? { valid: true, message: '' }
                    : { valid: false, message: 'Некорректный JSON' };
            }
            return { valid: true, message: '' };

        case 'order_column':
            return isValidInteger(value, min, max)
                ? { valid: true, message: '' }
                : { valid: false, message: 'Должно быть целое число' };

        case 'title':
            if (!value || value.trim() === '') {
                return { valid: false, message: 'Поле обязательно' };
            }
            if (max && value.length > max) {
                return { valid: false, message: `Максимум ${max} символов` };
            }
            return { valid: true, message: '' };

        default:
            return { valid: true, message: '' };
    }
}

// ============================================================================
// ЭКСПОРТ
// ============================================================================

export default {
    TYPES_REQUIRING_URL,
    TYPES_REQUIRING_IDENTIFIER,
    isValidUrl,
    isValidEmail,
    isValidPhone,
    isValidUsername,
    isValidJson,
    isValidInteger,
    validateUrlByType,
    validateIdentifierByType,
    validateField,
};
