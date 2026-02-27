// ============================================================================
// APP CONFIG COMPANY TABLE — COMPANY TABLE COMPONENT
// ============================================================================
// 📁 Путь: config/appConfigCompanyTable.js
// ✅ Используется: CompanyTable.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на таблицу компаний
// ✅ Зависит от: appConfigGlobal.js (COLORS, BREAKPOINTS)
// ✅ Зависит от: appConfigIcons.js (getIconMap, getIconOptions)
// ============================================================================

import { COLORS, BREAKPOINTS } from './appConfigGlobal.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

export const COMPANY_TABLE_UI = {
    HEADER_BACKGROUND: '#f5f7fa',
    HEADER_COLOR: '#606266',
    HEADER_FONT_WEIGHT: '600',
    HEADER_FONT_SIZE: '8px',
    HEADER_HEIGHT: '20px',
    HEADER_PADDING: '0 2px',
    CELL_FONT_SIZE: '8px',
    CELL_FONT_SIZE_MOBILE: '7px',
    CELL_FONT_SIZE_SMALL: '6px',
    CELL_PADDING: '1px 2px',
    CELL_HEIGHT: '22px',
    CELL_LINE_HEIGHT: '1.2',
    ROW_HEIGHT: '22px',
    TABLE_HEIGHT: 'calc(100vh - 290px)',
    HOVER_COLOR: '#f5f7fa',
    SCROLLBAR_WIDTH: '6px',
    SCROLLBAR_TRACK_COLOR: '#f1f1f1',
    SCROLLBAR_THUMB_COLOR: '#c1c1c1',
    SCROLLBAR_BORDER_RADIUS: '3px',
    EMPTY_ICON_SIZE: '24px',
    EMPTY_ICON_COLOR: '#909399',
    EMPTY_TEXT_COLOR: '#909399',
    EMPTY_TEXT_SIZE: '11px',
    EMPTY_PADDING: '20px 10px',
    EMPTY_GAP: '8px',
    ROW_NUMBER_FONT_SIZE: '7px',
    ROW_NUMBER_COLOR: '#909399',
    ID_FONT_WEIGHT: '600',
    ID_COLOR: COLORS.PRIMARY,
    ID_FONT_SIZE: '8px',
    CHANNEL_TAG_HEIGHT: '14px',
    CHANNEL_TAG_PADDING: '0 3px',
    CHANNEL_TAG_FONT_SIZE: '7px',
    CHANNEL_TAG_FONT_WEIGHT: '500',
    ACTION_BTN_PADDING: '1px',
    ACTION_BTN_FONT_SIZE: '10px',
    ACTION_BTN_HOVER_SCALE: '1.1',
    ICON_DISPLAY_MIN_HEIGHT: '20px',
    ICON_PLACEHOLDER_FONT_SIZE: '14px',
    ICON_PLACEHOLDER_COLOR: '#c0c4cc',
    ICON_OPTION_GAP: '4px',
    ICON_SELECT_SIZE: '14px',
    ICON_DISPLAY_SIZE: '16px',
    ICON_DISPLAY_COLOR: COLORS.PRIMARY,
    ROW_NUMBER_WIDTH: '28',
    ID_WIDTH: '35',
    NAME_MIN_WIDTH: '120',
    ICON_WIDTH: '120',
    DESCRIPTION_MIN_WIDTH: '130',
    ADDRESS_MIN_WIDTH: '120',
    CHANNEL_WIDTH: '55',
    ACTION_WIDTH: '60',
    DESCRIPTION_MAX_LENGTH: 1000,
    ADDRESS_MAX_LENGTH: 500,
    LOADING_BACKGROUND: 'rgba(255, 255, 255, 0.9)',
    EMPTY_CELL_TEXT: '—',
    STRIPED_ROW_BACKGROUND: '#fafafa',
    CELL_OVERFLOW: 'visible',
    CONTAINER_OVERFLOW: 'hidden !important',
    FIXED_COLUMN_Z_INDEX: 10,
    TABLE_PROPS: {
        stripe: true,
        border: true,
        size: 'small',
    },
    TAG_PROPS: {
        effect: 'plain',
        size: 'small',
    },
    CHANNEL_THRESHOLDS: {
        LOW: 3,
        MEDIUM: 10,
    },
    CHANNEL_TAG_TYPES: {
        EMPTY: 'info',
        LOW: 'success',
        MEDIUM: 'warning',
        HIGH: 'danger',
    },
    NAME_PLACEHOLDER: 'Название',
    ICON_PLACEHOLDER: 'Выберите',
    DESCRIPTION_PLACEHOLDER: 'Описание',
    ADDRESS_PLACEHOLDER: 'Адрес',
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const COMPANY_TABLE_PROPS_CONFIG = {
    data: { type: Array, required: true },
    iconMap: { type: Object, required: true },
    iconOptions: { type: Array, required: true },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 15 },
    tableHeight: { type: String, default: '280' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    useStore: { type: Boolean, default: true },
};

// ============================================================================
// EDITABLE CELL UI
// ============================================================================

export const EDITABLE_CELL_UI = {
    FONT_SIZE: '8px',
    LINE_HEIGHT: '14px',
    INPUT_HEIGHT: '18px',
    INPUT_PADDING: '1px 4px',
    BUTTON_FONT_SIZE: '10px',
    ERROR_COLOR: COLORS.DANGER,
};

// ============================================================================
// EDITABLE CELL PROPS CONFIG
// ============================================================================

export const EDITABLE_CELL_PROPS_CONFIG = {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: 'Введите значение' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '—' },
    maxLength: { type: Number, default: 255 },
    rows: { type: Number, default: 1 },
    showEditButton: { type: Boolean, default: true },
    showActionButtons: { type: Boolean, default: false },
    validator: { type: Function, default: null },
};

// ============================================================================
// RECORD REFRESH CONFIG
// ============================================================================

export const RECORD_REFRESH_CONFIG = {
    BUTTON_SIZE: 'small',
    BUTTON_TYPE: 'info',
    BUTTON_WIDTH: '24px',
    TOOLTIP: 'Обновить запись',
    TOOLTIP_LOADING: 'Обновление...',
};
