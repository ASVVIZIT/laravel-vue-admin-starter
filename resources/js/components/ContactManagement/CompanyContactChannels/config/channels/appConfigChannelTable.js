// ============================================================================
// APP CONFIG CHANNEL TABLE — CHANNEL TABLE COMPONENT
// ============================================================================
// 📁 Путь: config/channels/appConfigChannelTable.js
// ✅ Используется: ChannelTable.vue, ChannelList.vue
// ✅ Безопасно менять — влияет только на таблицу каналов
// ✅ НЕ ЗАВИСИТ ОТ: config/companies/* (полностью независим)
// ============================================================================

import { COLORS, BREAKPOINTS } from '../global/index.js';

// ============================================================================
// TABLE COLUMN CONFIG — ВСЕ КОЛОНКИ В ОДНОМ МЕСТЕ!
// ============================================================================

export const CHANNEL_TABLE_COLUMNS = {
    DRAG_HANDLE: {
        key: 'drag_handle',
        type: 'special',
        label: '',
        width: 30,
        visible: true,
        fixed: 'left',
        align: 'center',
        resizable: false,
        sortable: false,
    },
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
    COMPANY: {
        key: 'company.name',
        type: 'text',
        label: 'Компания',
        minWidth: 130,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
    },
    TYPE: {
        key: 'type',
        type: 'tag',
        label: 'Тип',
        width: 80,
        visible: true,
        fixed: null,
        align: 'center',
        resizable: false,
        sortable: true,
    },
    TITLE: {
        key: 'title',
        type: 'editable',
        label: 'Название',
        minWidth: 150,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        maxLength: 255,
    },
    IDENTIFIER: {
        key: 'identifier',
        type: 'editable',
        label: 'Контакт',
        minWidth: 130,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        maxLength: 255,
    },
    URL: {
        key: 'url',
        type: 'editable',
        label: 'Ссылка',
        minWidth: 150,
        visible: true,
        fixed: null,
        align: 'left',
        resizable: true,
        sortable: true,
        maxLength: 2048,
    },
    ORDER: {
        key: 'order_column',
        type: 'text',
        label: 'Порядок',
        width: 50,
        visible: true,
        fixed: null,
        align: 'center',
        resizable: false,
        sortable: true,
    },
    ACTIVE: {
        key: 'is_active',
        type: 'switch',
        label: 'Активен',
        width: 35,
        visible: true,
        fixed: 'right',
        align: 'center',
        resizable: false,
        sortable: true,
    },
    ACTIONS: {
        key: 'actions',
        type: 'actions',
        label: 'Действия',
        width: 70,
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

export const CHANNEL_TABLE_UI = {
    // ✅ HEADER
    HEADER_BACKGROUND: '#f5f7fa',
    HEADER_COLOR: '#606266',
    HEADER_FONT_WEIGHT: '600',
    HEADER_FONT_SIZE: '8px',
    HEADER_HEIGHT: '18px',
    HEADER_PADDING: '0 2px',

    // ✅ CELLS
    CELL_FONT_SIZE: '8px',
    CELL_FONT_SIZE_MOBILE: '7px',
    CELL_FONT_SIZE_SMALL: '6px',
    CELL_PADDING: '1px 2px',
    CELL_HEIGHT: '22px',
    CELL_LINE_HEIGHT: '1.2',
    ROW_HEIGHT: '22px',

    // ✅ TABLE HEIGHT (КАК В COMPANIES!)
    TABLE_HEIGHT: 'calc(100vh - 290px)',
    TABLE_HEIGHT_MOBILE: 'calc(100vh - 310px)',
    TABLE_HEIGHT_SMALL: 'calc(100vh - 320px)',
    TABLE_HEIGHT_TOUCH: 'calc(100vh - 330px)',

    // ✅ TABLE PROPS
    HOVER_COLOR: '#f5f7fa',
    STRIPED_ROW_BACKGROUND: '#fafafa',
    LOADING_BACKGROUND: 'rgba(255, 255, 255, 0.9)',

    // ✅ SCROLLBAR
    SCROLLBAR_WIDTH: '6px',
    SCROLLBAR_TRACK_COLOR: '#f1f1f1',
    SCROLLBAR_THUMB_COLOR: '#c1c4cc',
    SCROLLBAR_BORDER_RADIUS: '3px',

    // ✅ EMPTY STATE
    EMPTY_ICON_SIZE: '24px',
    EMPTY_ICON_COLOR: '#909399',
    EMPTY_TEXT_COLOR: '#909399',
    EMPTY_TEXT_SIZE: '11px',
    EMPTY_PADDING: '20px 10px',
    EMPTY_GAP: '8px',
    EMPTY_CELL_TEXT: '—',

    // ✅ ACTION BUTTONS (КАК В COMPANIES!)
    ACTION_BTN_PADDING: '0',
    ACTION_BTN_WIDTH: '24px',
    ACTION_BTN_FONT_SIZE: '14px',
    ACTION_BTN_HOVER_SCALE: '1.1',

    // ✅ MAX LENGTH
    TITLE_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
    IDENTIFIER_MAX_LENGTH: 255,
    URL_MAX_LENGTH: 2048,
    LOGO_URL_MAX_LENGTH: 2048,

    // ✅ TABLE PROPS
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

    // ✅ OVERFLOW
    CELL_OVERFLOW: 'visible',
    CONTAINER_OVERFLOW: 'hidden !important',
    FIXED_COLUMN_Z_INDEX: 10,
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const CHANNEL_TABLE_PROPS_CONFIG = {
    data: { type: Array, required: true },
    companyId: { type: Number, default: null },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showEditButton: { type: Boolean, default: true },
    showDeleteButton: { type: Boolean, default: true },
    allowReorder: { type: Boolean, default: true },
    useStore: { type: Boolean, default: true },
};

// ============================================================================
// MESSAGES
// ============================================================================

export const CHANNEL_TABLE_MESSAGES = {
    TOOLTIP_EDIT: 'Редактировать',
    TOOLTIP_DELETE: 'Удалить',
    TOOLTIP_REFRESH: 'Обновить запись',
    TOOLTIP_REFRESH_LOADING: 'Обновление...',
    EMPTY_NO_DATA: 'Нет каналов',
    EMPTY_CELL_TEXT: '—',
    ACTION_EDIT: 'Редактировать',
    ACTION_DELETE: 'Удалить',
    CONFIRM_DELETE_TITLE: 'Удаление канала',
    CONFIRM_DELETE_MESSAGE: (title) => `Удалить канал "${title}"?`,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTableColumns() {
    return CHANNEL_TABLE_COLUMNS;
}

export function getVisibleColumns() {
    return Object.values(CHANNEL_TABLE_COLUMNS).filter(col => col.visible);
}

export function getColumnByKey(key) {
    return Object.values(CHANNEL_TABLE_COLUMNS).find(col => col.key === key);
}

export function getTableHeight() {
    return CHANNEL_TABLE_UI.TABLE_HEIGHT;
}

export function getTableProps() {
    return CHANNEL_TABLE_UI.TABLE_PROPS;
}

export function getFieldMaxLength(fieldName) {
    const column = getColumnByKey(fieldName.toUpperCase());
    return column?.maxLength || 255;
}

export function getChannelTypeTagType(type) {
    const typeMap = {
        social_network: 'primary',
        messenger: 'success',
        messenger_group: 'success',
        gis_map: 'warning',
        yandex_map: 'warning',
        email: 'info',
        phone_number: 'info',
        website: '',
    };
    return typeMap[type] || '';
}
