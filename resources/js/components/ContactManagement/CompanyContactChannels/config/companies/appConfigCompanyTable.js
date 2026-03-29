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
// ✅ ИМПОРТ ИЗ COMMON (вместо дубля!)
import { EDITABLE_CELL_UI, EDITABLE_CELL_PROPS_CONFIG } from '../common/appConfigEditableCell.js';

// ============================================================================
// TABLE COLUMN CONFIG
// ============================================================================

export const COMPANY_TABLE_COLUMNS = {
    // ... (остальное без изменений)
};

// ============================================================================
// UI CONFIGS
// ============================================================================

export const COMPANY_TABLE_UI = {
    // ... (остальное без изменений)
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
