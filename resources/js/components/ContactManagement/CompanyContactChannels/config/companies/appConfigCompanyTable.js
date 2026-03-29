/**
 * ============================================================================
 * APP CONFIG COMPANY TABLE — COMPANY TABLE COMPONENT
 * ============================================================================
 * 📁 Путь: config/companies/appConfigCompanyTable.js
 * ✅ Используется: CompanyTable.vue, CompanyList.vue
 * ✅ Безопасно менять — влияет только на таблицу компаний
 * ============================================================================
 */

import { COLORS, BREAKPOINTS } from '../global/index.js';
import { EDITABLE_CELL_UI, EDITABLE_CELL_PROPS_CONFIG } from '../common/appConfigEditableCell.js';

// ============================================================================
// TABLE COLUMN CONFIG — ВСЕ КОЛОНКИ В ОДНОМ МЕСТЕ!
// ============================================================================

export const COMPANY_TABLE_COLUMNS = {
    ROW_NUMBER: {
        key: 'row_number',
        type: 'special',
        label: '#',
        width: 40,
        visible: true,
        fixed: 'left',
        align: 'center',
        resizable: false,
        sortable: false,
    },
    ID: {
        key: 'id',
        type: 'text',
        label: 'ID',
        width: 50,
        visible: true,
        fixed: 'left',
        align: 'center',
        resizable: false,
        sortable: true,
    },
    NAME: {
        key: 'name',
        type: 'editable',
        label: 'Название',
        minWidth: 120,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        editable: true,
        maxLength: 255,
        placeholder: 'Название',
    },
    ICON: {
        key: 'settings.icon',
        type: 'select',
        label: 'Иконка',
        width: 120,
        visible: true,
        fixed: null,
        align: 'center',
        resizable: true,
        sortable: false,
        editable: true,
        placeholder: 'Выберите',
    },
    DESCRIPTION: {
        key: 'description',
        type: 'editable',
        label: 'Описание',
        minWidth: 130,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        editable: true,
        maxLength: 1000,
        placeholder: 'Описание',
    },
    ADDRESS: {
        key: 'address',
        type: 'editable',
        label: 'Адрес',
        minWidth: 120,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        editable: true,
        maxLength: 500,
        placeholder: 'Адрес',
    },
    CONTACT_CHANNELS: {
        key: 'contact_channels_count',
        type: 'tag',
        label: 'Каналы',
        width: 55,
        visible: true,
        fixed: null,
        align: 'center',
        resizable: false,
        sortable: true,
        editable: false,
    },
    ACTIONS: {
        key: 'actions',
        type: 'actions',
        label: 'Действия',
        width: 60,
        visible: true,
        fixed: 'right',
        align: 'center',
        resizable: false,
        sortable: false,
        buttons: ['refresh', 'edit', 'delete'],
    },
};

// ============================================================================
// UI CONFIGS
// ============================================================================

export const COMPANY_TABLE_UI = {
    // ✅ HEADER
    HEADER_BACKGROUND: '#f5f7fa',
    HEADER_COLOR: '#606266',
    HEADER_FONT_WEIGHT: '600',
    HEADER_FONT_SIZE: '8px',
    HEADER_HEIGHT: '20px',
    HEADER_PADDING: '0 2px',

    // ✅ CELLS
    CELL_FONT_SIZE: '8px',
    CELL_FONT_SIZE_MOBILE: '7px',
    CELL_FONT_SIZE_SMALL: '6px',
    CELL_PADDING: '1px 2px',
    CELL_HEIGHT: '22px',
    CELL_LINE_HEIGHT: '1.2',
    ROW_HEIGHT: '22px',

    // ✅ TABLE HEIGHT
    TABLE_HEIGHT: 'calc(100vh - 290px)',
    TABLE_HEIGHT_MOBILE: 'calc(100vh - 310px)',
    TABLE_HEIGHT_SMALL: 'calc(100vh - 320px)',
    TABLE_HEIGHT_TOUCH: 'calc(100vh - 330px)',

    // ✅ TABLE PROPS ← ← ← КРИТИЧНО!
    HOVER_COLOR: '#f5f7fa',
    STRIPED_ROW_BACKGROUND: '#fafafa',
    LOADING_BACKGROUND: 'rgba(255, 255, 255, 0.9)',

    // ✅ SCROLLBAR
    SCROLLBAR_WIDTH: '6px',
    SCROLLBAR_TRACK_COLOR: '#f1f1f1',
    SCROLLBAR_THUMB_COLOR: '#c1c1c1',
    SCROLLBAR_BORDER_RADIUS: '3px',

    // ✅ EMPTY STATE
    EMPTY_ICON_SIZE: '24px',
    EMPTY_ICON_COLOR: '#909399',
    EMPTY_TEXT_COLOR: '#909399',
    EMPTY_TEXT_SIZE: '11px',
    EMPTY_PADDING: '20px 10px',
    EMPTY_GAP: '8px',
    EMPTY_CELL_TEXT: '—',

    // ✅ ROW NUMBER
    ROW_NUMBER_FONT_SIZE: '7px',
    ROW_NUMBER_COLOR: '#909399',
    ROW_NUMBER_WIDTH: '40',

    // ✅ ID COLUMN
    ID_FONT_WEIGHT: '600',
    ID_COLOR: COLORS.PRIMARY,
    ID_FONT_SIZE: '8px',
    ID_WIDTH: '50',

    // ✅ CHANNEL TAGS
    CHANNEL_TAG_HEIGHT: '14px',
    CHANNEL_TAG_PADDING: '0 3px',
    CHANNEL_TAG_FONT_SIZE: '7px',
    CHANNEL_TAG_FONT_WEIGHT: '500',
    CHANNEL_WIDTH: '55',
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

    // ✅ ACTIONS
    ACTION_BTN_PADDING: '0',
    ACTION_BTN_FONT_SIZE: '14px',
    ACTION_BTN_WIDTH: '24px',
    ACTION_BTN_HOVER_SCALE: '1.1',
    ACTION_WIDTH: '60',

    // ✅ ICONS
    ICON_DISPLAY_MIN_HEIGHT: '20px',
    ICON_PLACEHOLDER_FONT_SIZE: '14px',
    ICON_PLACEHOLDER_COLOR: '#c0c4cc',
    ICON_OPTION_GAP: '4px',
    ICON_SELECT_SIZE: '14px',
    ICON_DISPLAY_SIZE: '16px',
    ICON_DISPLAY_COLOR: COLORS.PRIMARY,
    ICON_WIDTH: '120',

    // ✅ COLUMNS WIDTH
    NAME_MIN_WIDTH: '120',
    DESCRIPTION_MIN_WIDTH: '130',
    ADDRESS_MIN_WIDTH: '120',

    // ✅ MAX LENGTH
    NAME_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
    ADDRESS_MAX_LENGTH: 500,

    // ✅ OVERFLOW
    CELL_OVERFLOW: 'visible',
    CONTAINER_OVERFLOW: 'hidden !important',
    FIXED_COLUMN_Z_INDEX: 10,

    // ✅ TABLE PROPS ← ← ← КРИТИЧНО!
    TABLE_PROPS: {
        stripe: true,
        border: true,
        size: 'small',
    },

    // ✅ TAG PROPS
    TAG_PROPS: {
        effect: 'plain',
        size: 'small',
    },

    // ✅ PLACEHOLDERS
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
// RECORD REFRESH CONFIG
// ============================================================================

export const RECORD_REFRESH_CONFIG = {
    BUTTON_SIZE: 'small',
    BUTTON_TYPE: 'info',
    BUTTON_WIDTH: '24px',
    TOOLTIP: 'Обновить запись',
    TOOLTIP_LOADING: 'Обновление...',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTableColumns() {
    return COMPANY_TABLE_COLUMNS;
}

export function getVisibleColumns() {
    return Object.values(COMPANY_TABLE_COLUMNS).filter(col => col.visible !== false);
}

export function getColumnByKey(key) {
    return Object.values(COMPANY_TABLE_COLUMNS).find(col => col.key === key);
}

export function getVisibleColumnsOptions() {
    return Object.values(COMPANY_TABLE_COLUMNS)
        .filter(col => col.visible !== false)
        .map(col => ({
            value: col.key,
            label: col.label,
        }));
}

export function isColumnVisible(key) {
    const column = getColumnByKey(key);
    return column?.visible !== false;
}

export function setColumnVisibility(key, visible) {
    const column = getColumnByKey(key);
    if (column) {
        column.visible = visible;
    }
}

export function getChannelTagType(count) {
    if (count === 0) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.EMPTY;
    if (count < COMPANY_TABLE_UI.CHANNEL_THRESHOLDS.LOW) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.LOW;
    if (count < COMPANY_TABLE_UI.CHANNEL_THRESHOLDS.MEDIUM) return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.MEDIUM;
    return COMPANY_TABLE_UI.CHANNEL_TAG_TYPES.HIGH;
}

export function getTableHeight() {
    return COMPANY_TABLE_UI.TABLE_HEIGHT;
}

export function getTableProps() {
    return COMPANY_TABLE_UI.TABLE_PROPS;
}

export function getFieldMaxLength(fieldName) {
    const maxLengthMap = {
        name: COMPANY_TABLE_UI.NAME_MAX_LENGTH,
        description: COMPANY_TABLE_UI.DESCRIPTION_MAX_LENGTH,
        address: COMPANY_TABLE_UI.ADDRESS_MAX_LENGTH,
    };
    return maxLengthMap[fieldName] || 255;
}

export function getColumnWidth(columnName) {
    const widthMap = {
        row_number: COMPANY_TABLE_UI.ROW_NUMBER_WIDTH,
        id: COMPANY_TABLE_UI.ID_WIDTH,
        name: COMPANY_TABLE_UI.NAME_MIN_WIDTH,
        description: COMPANY_TABLE_UI.DESCRIPTION_MIN_WIDTH,
        address: COMPANY_TABLE_UI.ADDRESS_MIN_WIDTH,
        contact_channels_count: COMPANY_TABLE_UI.CHANNEL_WIDTH,
        actions: COMPANY_TABLE_UI.ACTION_WIDTH,
        'settings.icon': COMPANY_TABLE_UI.ICON_WIDTH,
    };
    return widthMap[columnName] || 'auto';
}
