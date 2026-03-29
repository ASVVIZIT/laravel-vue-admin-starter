/**
 * ============================================================================
 * APP CONFIG CHANNEL FORM — CHANNEL FORM COMPONENT
 * ============================================================================
 * 📁 Путь: config/channels/appConfigChannelForm.js
 * ✅ Используется: ChannelForm.vue, ChannelList.vue
 * ✅ Безопасно менять — влияет только на форму канала
 * ✅ НЕ ЗАВИСИТ ОТ: config/companies/* (полностью независим)
 * ============================================================================
 */

import { COLORS, BREAKPOINTS } from '../global/index.js';
import { CHANNEL_TYPES, CHANNEL_TYPE_LABELS } from './appConfigChannelTypes.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

export const CHANNEL_FORM_UI = {
    DIALOG_WIDTH: '600px',
    DIALOG_WIDTH_TABLET: '550px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    DIALOG_BODY_PADDING: '20px',
    DIALOG_BODY_PADDING_SMALL: '16px 12px',
    DIALOG_HEADER_PADDING: '16px 20px',
    DIALOG_HEADER_PADDING_SMALL: '12px 16px',
    DIALOG_HEADER_BORDER_COLOR: '#EBEEF5',
    DIALOG_TITLE_FONT_SIZE: '16px',
    DIALOG_TITLE_FONT_SIZE_MOBILE: '14px',
    DIALOG_TITLE_FONT_SIZE_SMALL: '13px',
    DIALOG_TITLE_FONT_WEIGHT: '600',
    DIALOG_TITLE_COLOR: '#303133',
    LABEL_WIDTH: '120px',
    LABEL_POSITION: 'right',
    FORM_SIZE: 'small',
    FORM_LABEL_FONT_SIZE: '12px',
    FORM_LABEL_FONT_SIZE_MOBILE: '11px',
    FORM_LABEL_FONT_SIZE_SMALL: '10px',
    FORM_LABEL_FONT_WEIGHT: '500',
    FORM_LABEL_COLOR: '#606266',
    FORM_LABEL_MARGIN_BOTTOM: '4px',
    FORM_ROW_GAP: '16px',
    FORM_ROW_GAP_TABLET: '12px',
    FORM_ROW_GAP_MOBILE: '8px',
    FORM_ITEM_MARGIN_BOTTOM: '16px',
    FORM_FOOTER_GAP: '12px',
    FORM_FOOTER_GAP_MOBILE: '8px',
    FORM_FOOTER_PADDING_TOP: '12px',
    FORM_FOOTER_BUTTON_MIN_WIDTH: '80px',
    FORM_SELECT_HEIGHT: '20px',
    FORM_DROPDOWN_HOVER_BACKGROUND: '#f5f7fa',
    FORM_DROPDOWN_SELECTED_BACKGROUND: '#f0f9eb',
    FORM_ERROR_FONT_SIZE: '10px',
    FORM_ERROR_PADDING_TOP: '2px',
};

// ============================================================================
// FIELD LABELS
// ============================================================================

export const CHANNEL_FORM_FIELD_LABELS = {
    TYPE: 'Тип канала',
    TITLE: 'Название',
    DESCRIPTION: 'Описание',
    LOGO_URL: 'Логотип',
    URL: 'Ссылка',
    IDENTIFIER: 'Контакт',
    METADATA: 'Метаданные',
    ORDER_COLUMN: 'Порядок',
    IS_ACTIVE: 'Активен',
    COMPANY: 'Компания',
};

// ============================================================================
// FIELD PLACEHOLDERS
// ============================================================================

export const CHANNEL_FORM_FIELD_PLACEHOLDERS = {
    TYPE: 'Выберите тип',
    TITLE: 'Введите название',
    DESCRIPTION: 'Введите описание',
    LOGO_URL: 'URL логотипа',
    URL: 'https://...',
    IDENTIFIER: 'Email, телефон или username',
    METADATA: 'JSON',
    ORDER_COLUMN: '0',
    COMPANY: 'Выберите компанию',
};

// ============================================================================
// MESSAGES
// ============================================================================

export const CHANNEL_FORM_MESSAGES = {
    // ✅ ЗАГОЛОВКИ
    TITLE_CREATE: 'Добавить Канал',
    TITLE_EDIT: 'Редактировать Канал',

    // ✅ КНОПКИ
    SUBMIT_CREATE: 'Создать',
    SUBMIT_EDIT: 'Сохранить',
    CANCEL: 'Отмена',

    // ✅ ВАЛИДАЦИЯ
    FIELD_REQUIRED: (field) => `Поле "${field}" обязательно`,
    FIELD_MIN_LENGTH: (field, min) => `Минимум ${min} символов`,
    FIELD_MAX_LENGTH: (field, max) => `Максимум ${max} символов`,
    FIELD_INVALID_URL: 'Некорректный URL',
    FIELD_INVALID_EMAIL: 'Некорректный email',
    FIELD_INVALID_INTEGER: 'Должно быть целое число',
    FIELD_MIN_VALUE: (field, min) => `Минимальное значение ${min}`,

    // ✅ УСПЕХ
    SUCCESS_CHANNEL_CREATED: 'Канал создан',
    SUCCESS_CHANNEL_UPDATED: 'Канал обновлён',

    // ✅ WARNING
    METADATA_INVALID_JSON: 'Некорректный JSON в метаданных',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const CHANNEL_FORM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    channel: { type: Object, default: null },
    companyId: { type: Number, required: true },
    companies: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    useStore: { type: Boolean, default: true },
};

// ============================================================================
// VALIDATION
// ============================================================================

export const CHANNEL_FORM_VALIDATION = {
    TYPE: { required: true, trigger: ['blur', 'change'] },
    TITLE: { required: true, min: 2, max: 255, trigger: ['blur', 'change'] },
    DESCRIPTION: { required: false, max: 1000, trigger: ['blur', 'change'] },
    LOGO_URL: { required: false, type: 'url', max: 2048, trigger: ['blur', 'change'] },
    URL: { required: false, type: 'url', max: 2048, trigger: ['blur', 'change'] },
    IDENTIFIER: { required: false, max: 255, trigger: ['blur', 'change'] },
    METADATA: { required: false, type: 'json', trigger: ['blur', 'change'] },
    ORDER_COLUMN: { required: false, type: 'integer', min: 0, trigger: ['blur', 'change'] },
    IS_ACTIVE: { required: false, type: 'boolean', trigger: ['blur', 'change'] },
};

// ============================================================================
// FIELD CONFIGS
// ============================================================================

export const CHANNEL_FORM_FIELDS = {
    TYPE: {
        key: 'type',
        label: 'Тип канала',
        placeholder: 'Выберите тип',
        type: 'select',
        options: 'channelTypes',
        required: true,
    },
    TITLE: {
        key: 'title',
        label: 'Название',
        placeholder: 'Введите название',
        type: 'text',
        maxLength: 255,
        required: true,
    },
    DESCRIPTION: {
        key: 'description',
        label: 'Описание',
        placeholder: 'Введите описание',
        type: 'textarea',
        rows: 3,
        maxLength: 1000,
        required: false,
    },
    LOGO_URL: {
        key: 'logo_url',
        label: 'Логотип',
        placeholder: 'URL логотипа',
        type: 'url',
        maxLength: 2048,
        required: false,
    },
    URL: {
        key: 'url',
        label: 'Ссылка',
        placeholder: 'https://...',
        type: 'url',
        maxLength: 2048,
        required: false,
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Контакт',
        placeholder: 'Email, телефон или username',
        type: 'text',
        maxLength: 255,
        required: false,
    },
    METADATA: {
        key: 'metadata',
        label: 'Метаданные',
        placeholder: 'JSON',
        type: 'json',
        required: false,
    },
    ORDER_COLUMN: {
        key: 'order_column',
        label: 'Порядок',
        placeholder: '0',
        type: 'number',
        min: 0,
        required: false,
    },
    IS_ACTIVE: {
        key: 'is_active',
        label: 'Активен',
        type: 'switch',
        required: false,
    },
};

// ============================================================================
// DEFAULT VALIDATION RULES
// ============================================================================

export function getDefaultChannelFormValidation() {
    return {
        type: [
            {
                required: CHANNEL_FORM_VALIDATION.TYPE.required,
                message: CHANNEL_FORM_MESSAGES.FIELD_REQUIRED('Тип'),
                trigger: CHANNEL_FORM_VALIDATION.TYPE.trigger,
            },
        ],
        title: [
            {
                required: CHANNEL_FORM_VALIDATION.TITLE.required,
                message: CHANNEL_FORM_MESSAGES.FIELD_REQUIRED('Название'),
                trigger: CHANNEL_FORM_VALIDATION.TITLE.trigger,
            },
            {
                min: CHANNEL_FORM_VALIDATION.TITLE.min,
                message: CHANNEL_FORM_MESSAGES.FIELD_MIN_LENGTH('Название', CHANNEL_FORM_VALIDATION.TITLE.min),
                trigger: CHANNEL_FORM_VALIDATION.TITLE.trigger,
            },
            {
                max: CHANNEL_FORM_VALIDATION.TITLE.max,
                message: CHANNEL_FORM_MESSAGES.FIELD_MAX_LENGTH('Название', CHANNEL_FORM_VALIDATION.TITLE.max),
                trigger: CHANNEL_FORM_VALIDATION.TITLE.trigger,
            },
        ],
        description: [
            {
                max: CHANNEL_FORM_VALIDATION.DESCRIPTION.max,
                message: CHANNEL_FORM_MESSAGES.FIELD_MAX_LENGTH('Описание', CHANNEL_FORM_VALIDATION.DESCRIPTION.max),
                trigger: CHANNEL_FORM_VALIDATION.DESCRIPTION.trigger,
            },
        ],
        logo_url: [
            {
                type: CHANNEL_FORM_VALIDATION.LOGO_URL.type,
                message: CHANNEL_FORM_MESSAGES.FIELD_INVALID_URL,
                trigger: CHANNEL_FORM_VALIDATION.LOGO_URL.trigger,
            },
            {
                max: CHANNEL_FORM_VALIDATION.LOGO_URL.max,
                message: CHANNEL_FORM_MESSAGES.FIELD_MAX_LENGTH('Логотип', CHANNEL_FORM_VALIDATION.LOGO_URL.max),
                trigger: CHANNEL_FORM_VALIDATION.LOGO_URL.trigger,
            },
        ],
        url: [
            {
                type: CHANNEL_FORM_VALIDATION.URL.type,
                message: CHANNEL_FORM_MESSAGES.FIELD_INVALID_URL,
                trigger: CHANNEL_FORM_VALIDATION.URL.trigger,
            },
            {
                max: CHANNEL_FORM_VALIDATION.URL.max,
                message: CHANNEL_FORM_MESSAGES.FIELD_MAX_LENGTH('Ссылку', CHANNEL_FORM_VALIDATION.URL.max),
                trigger: CHANNEL_FORM_VALIDATION.URL.trigger,
            },
        ],
        identifier: [
            {
                max: CHANNEL_FORM_VALIDATION.IDENTIFIER.max,
                message: CHANNEL_FORM_MESSAGES.FIELD_MAX_LENGTH('Контакт', CHANNEL_FORM_VALIDATION.IDENTIFIER.max),
                trigger: CHANNEL_FORM_VALIDATION.IDENTIFIER.trigger,
            },
        ],
        order_column: [
            {
                type: CHANNEL_FORM_VALIDATION.ORDER_COLUMN.type,
                message: CHANNEL_FORM_MESSAGES.FIELD_INVALID_INTEGER,
                trigger: CHANNEL_FORM_VALIDATION.ORDER_COLUMN.trigger,
            },
            {
                min: CHANNEL_FORM_VALIDATION.ORDER_COLUMN.min,
                message: CHANNEL_FORM_MESSAGES.FIELD_MIN_VALUE('Порядок', CHANNEL_FORM_VALIDATION.ORDER_COLUMN.min),
                trigger: CHANNEL_FORM_VALIDATION.ORDER_COLUMN.trigger,
            },
        ],
        is_active: [
            {
                type: CHANNEL_FORM_VALIDATION.IS_ACTIVE.type,
                message: 'Должно быть true или false',
                trigger: CHANNEL_FORM_VALIDATION.IS_ACTIVE.trigger,
            },
        ],
        metadata: [
            {
                type: CHANNEL_FORM_VALIDATION.METADATA.type,
                message: 'Некорректный JSON',
                trigger: CHANNEL_FORM_VALIDATION.METADATA.trigger,
            },
        ],
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getInitialChannelFormState(companyId = null) {
    return {
        company_id: companyId,
        type: '',
        title: '',
        description: '',
        logo_url: '',
        url: '',
        identifier: '',
        metadata: {},
        order_column: 0,
        is_active: true,
    };
}

export function getFormValidationRules() {
    return getDefaultChannelFormValidation();
}

export function getFieldConfig(fieldName) {
    return CHANNEL_FORM_FIELDS[fieldName.toUpperCase()] || null;
}

export function getChannelTypeOptions() {
    return Object.entries(CHANNEL_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));
}

export function getFieldLabels() {
    return CHANNEL_FORM_FIELD_LABELS;
}

export function getFieldPlaceholders() {
    return CHANNEL_FORM_FIELD_PLACEHOLDERS;
}
