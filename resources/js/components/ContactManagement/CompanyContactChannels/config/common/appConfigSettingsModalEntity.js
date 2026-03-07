// ============================================================================
// APP CONFIG SETTINGS MODAL ENTITY — НАСТРОЙКИ СУЩНОСТЕЙ
// ============================================================================
// 📁 Путь: config/common/appConfigSettingsModalEntity.js
// ✅ Используется: SettingsModalEntity.vue
// ✅ Безопасно менять — влияет только на форму настроек
// ✅ Зависит от: config/global/index.js (COLORS)
// ============================================================================

import { COLORS } from '../global/index.js';
import { CHANNEL_TABLE_COLUMNS } from '../channels/appConfigChannelTable.js';
import { COMPANY_TABLE_COLUMNS } from '../companies/appConfigCompanyTable.js';

// ============================================================================
// ТИПЫ ПОЛЕЙ НАСТРОЕК
// ============================================================================

export const SETTINGS_FIELD_TYPES = {
    NUMBER: 'number',
    SELECT: 'select',
    SWITCH: 'switch',
    SLIDER: 'slider',
    CHECKBOX_GROUP: 'checkbox-group',
    TEXT: 'text',
};

// ============================================================================
// КОНФИГ НАСТРОЕК — КОМПАНИИ
// ============================================================================

export const COMPANY_SETTINGS_CONFIG = {
    STORAGE_KEY: 'company_user_settings',
    TITLE: 'Настройки компаний',
    FIELDS: {
        CHUNK_SIZE: {
            key: 'chunkSize',
            label: 'Размер чанка загрузки',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 500,
            hint: 'Количество записей загружаемых за один раз',
            options: [
                { value: 100, label: '100 записей' },
                { value: 250, label: '250 записей' },
                { value: 500, label: '500 записей (по умолчанию)' },
                { value: 1000, label: '1000 записей' },
            ],
            tooltip: 'Количество записей загружаемых за один раз',
            icon: 'DataLine',
        },
        PAGE_SIZE: {
            key: 'pageSize',
            label: 'Записей на страницу',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 15,
            hint: 'Количество записей на странице таблицы',
            options: [
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15 (по умолчанию)' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
            ],
            tooltip: 'Количество записей на странице таблицы',
            icon: 'Document',
        },
        DEFAULT_SORT_BY: {
            key: 'defaultSortBy',
            label: 'Сортировка по умолчанию',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 'id_asc',
            hint: 'Порядок сортировки при загрузке',
            options: [
                { value: 'id_asc', label: 'ID ↑' },
                { value: 'id_desc', label: 'ID ↓' },
                { value: 'name_asc', label: 'Название А-Я' },
                { value: 'name_desc', label: 'Название Я-А' },
                { value: 'created_at_desc', label: 'Сначала новые' },
                { value: 'created_at_asc', label: 'Сначала старые' },
            ],
            tooltip: 'Порядок сортировки при загрузке',
            icon: 'Sort',
        },
        DEFAULT_FILTER_HAS_ICON: {
            key: 'defaultFilterHasIcon',
            label: 'Фильтр по иконке',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: '',
            hint: 'Показывать компании с иконкой или без',
            options: [
                { value: '', label: 'Все' },
                { value: 'with', label: 'С иконкой' },
                { value: 'without', label: 'Без иконки' },
            ],
            tooltip: 'Фильтр по иконке',
            icon: 'Picture',
        },
        VISIBLE_COLUMNS: {
            key: 'visibleColumns',
            label: 'Видимые колонки',
            type: SETTINGS_FIELD_TYPES.CHECKBOX_GROUP,
            defaultValue: [],
            hint: 'Колонки для отображения',
            options: [],
            tooltip: 'Видимость колонок',
            icon: 'View',
        },
    },
    BUTTONS: { SAVE: 'Сохранить', CANCEL: 'Отмена', RESET: 'Сбросить' },
    MESSAGES: {
        SUCCESS: 'Настройки сохранены',
        RESET_CONFIRM: 'Сбросить настройки?',
        RESET_SUCCESS: 'Настройки сброшены',
    },
};

// ============================================================================
// КОНФИГ НАСТРОЕК — КАНАЛЫ (С ДОБАВЛЕННЫМИ ПОЛЯМИ!)
// ============================================================================

export const CHANNEL_SETTINGS_CONFIG = {
    STORAGE_KEY: 'channel_user_settings',
    TITLE: 'Настройки каналов',
    FIELDS: {
        CHUNK_SIZE: {
            key: 'chunkSize',
            label: 'Размер чанка загрузки',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 500,
            hint: 'Количество каналов загружаемых за один раз',
            options: [
                { value: 100, label: '100 каналов' },
                { value: 250, label: '250 каналов' },
                { value: 500, label: '500 каналов (по умолчанию)' },
                { value: 1000, label: '1000 каналов' },
            ],
            tooltip: 'Количество каналов загружаемых за один раз',
            icon: 'DataLine',
        },
        PAGE_SIZE: {
            key: 'pageSize',
            label: 'Каналов на страницу',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 15,
            hint: 'Количество каналов на странице таблицы',
            options: [
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15 (по умолчанию)' },
                { value: 30, label: '30' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
            ],
            tooltip: 'Количество каналов на странице таблицы',
            icon: 'Document',
        },
        DEFAULT_SORT_BY: {
            key: 'defaultSortBy',
            label: 'Сортировка по умолчанию',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: 'order_asc',
            hint: 'Порядок сортировки при загрузке',
            options: [
                { value: 'order_asc', label: 'Порядок ↑' },
                { value: 'order_desc', label: 'Порядок ↓' },
                { value: 'id_asc', label: 'ID ↑' },
                { value: 'id_desc', label: 'ID ↓' },
                { value: 'title_asc', label: 'Название А-Я' },
                { value: 'title_desc', label: 'Название Я-А' },
                { value: 'created_at_desc', label: 'Сначала новые' },
            ],
            tooltip: 'Порядок сортировки при загрузке',
            icon: 'Sort',
        },
        DEFAULT_FILTER_TYPE: {
            key: 'defaultFilterType',
            label: 'Фильтр по типу',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: null,
            hint: 'Фильтровать каналы по типу',
            options: [
                { value: null, label: 'Все типы' },
                { value: 'social_network', label: 'Соцсети' },
                { value: 'messenger', label: 'Мессенджеры' },
                { value: 'email', label: 'Email' },
                { value: 'phone_number', label: 'Телефон' },
                { value: 'website', label: 'Сайт' },
            ],
            tooltip: 'Фильтр по типу',
            icon: 'Connection',
        },
        DEFAULT_FILTER_IS_ACTIVE: {
            key: 'defaultFilterIsActive',
            label: 'Фильтр по статусу',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: null,
            hint: 'Активные, неактивные или все',
            options: [
                { value: null, label: 'Все' },
                { value: true, label: 'Активные' },
                { value: false, label: 'Неактивные' },
            ],
            tooltip: 'Фильтр по статусу',
            icon: 'CircleCheck',
        },
        DEFAULT_FILTER_COMPANY_ID: {
            key: 'defaultFilterCompanyId',
            label: 'Фильтр по компании',
            type: SETTINGS_FIELD_TYPES.SELECT,
            defaultValue: null,
            hint: 'Фильтровать каналы по компании',
            options: [],
            tooltip: 'Фильтр по компании',
            icon: 'OfficeBuilding',
        },
        DEFAULT_SEARCH: {
            key: 'defaultSearch',
            label: 'Поиск по умолчанию',
            type: SETTINGS_FIELD_TYPES.TEXT,
            defaultValue: '',
            hint: 'Поисковый запрос при загрузке',
            tooltip: 'Поиск',
            icon: 'Search',
        },
        VISIBLE_COLUMNS: {
            key: 'visibleColumns',
            label: 'Видимые колонки',
            type: SETTINGS_FIELD_TYPES.CHECKBOX_GROUP,
            defaultValue: [],
            hint: 'Колонки для отображения',
            options: [],
            tooltip: 'Видимость колонок',
            icon: 'View',
        },
    },
    BUTTONS: { SAVE: 'Сохранить', CANCEL: 'Отмена', RESET: 'Сбросить' },
    MESSAGES: {
        SUCCESS: 'Настройки сохранены',
        RESET_CONFIRM: 'Сбросить настройки?',
        RESET_SUCCESS: 'Настройки сброшены',
    },
};

// ============================================================================
// UI CONFIGS — ПЕРЕИМЕНОВАНО!
// ============================================================================

export const SETTINGS_MODAL_ENTITY_UI = {
    DIALOG_WIDTH: '500px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    FIELD_GAP: '12px',
    LABEL_WIDTH: '50%',
    LABEL_FONT_SIZE: '12px',
    LABEL_FONT_WEIGHT: '500',
    ICON_SIZE: 14,
    HINT_FONT_SIZE: '10px',
    HINT_COLOR: '#909399',
    HINT_MARGIN_TOP: '4px',
    HINT_LINE_HEIGHT: '1.3',
    CHECKBOX_GAP: '4px',
    CHECKBOX_FONT_SIZE: '11px',
    BUTTON_GAP: '7px',
    BUTTON_MIN_WIDTH: '70px',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEntitySettingsConfig(entityType) {
    const configs = {
        company: COMPANY_SETTINGS_CONFIG,
        channel: CHANNEL_SETTINGS_CONFIG,
    };
    return configs[entityType] || COMPANY_SETTINGS_CONFIG;
}

export function getDefaultEntitySettings(entityType) {
    const config = getEntitySettingsConfig(entityType);
    const defaults = {};
    Object.values(config.FIELDS).forEach(field => {
        defaults[field.key] = field.defaultValue;
    });
    return defaults;
}

export function loadEntitySettings(entityType) {
    const config = getEntitySettingsConfig(entityType);
    const defaults = getDefaultEntitySettings(entityType);
    try {
        const saved = localStorage.getItem(config.STORAGE_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            return { ...defaults, ...settings };
        }
    } catch (e) {
        console.error('🔴 [EntitySettings] Error loading settings:', e);
    }
    return defaults;
}

export function saveEntitySettings(entityType, settings) {
    const config = getEntitySettingsConfig(entityType);
    try {
        localStorage.setItem(config.STORAGE_KEY, JSON.stringify(settings));
        console.log('🟢 [EntitySettings] Settings saved:', settings);
        return true;
    } catch (e) {
        console.error('🔴 [EntitySettings] Error saving settings:', e);
        return false;
    }
}

export function resetEntitySettings(entityType) {
    const config = getEntitySettingsConfig(entityType);
    try {
        localStorage.removeItem(config.STORAGE_KEY);
        console.log('🟢 [EntitySettings] Settings reset to defaults');
        return true;
    } catch (e) {
        console.error('🔴 [EntitySettings] Error resetting settings:', e);
        return false;
    }
}

export function getFieldOptions(entityType, fieldKey) {
    const config = getEntitySettingsConfig(entityType);
    const field = Object.values(config.FIELDS).find(f => f.key === fieldKey);
    return field?.options || [];
}

export function getVisibleColumnsOptions(entityType) {
    const tableColumns = entityType === 'company' ? COMPANY_TABLE_COLUMNS : CHANNEL_TABLE_COLUMNS;
    if (!tableColumns) return [];
    return Object.values(tableColumns)
        .filter(col => col.visible !== false)
        .map(col => ({ value: col.key, label: col.label }));
}

export function initializeVisibleColumnsOptions(entityType) {
    const config = getEntitySettingsConfig(entityType);
    const visibleColumnsField = Object.values(config.FIELDS).find(f => f.key === 'visibleColumns');
    if (visibleColumnsField) {
        visibleColumnsField.options = getVisibleColumnsOptions(entityType);
        visibleColumnsField.defaultValue = visibleColumnsField.options.map(opt => opt.value);
    }
}

export function initializeCompanyFilterOptions(entityType, companies) {
    if (entityType !== 'channel') return;
    const config = getEntitySettingsConfig(entityType);
    const companyFilterField = Object.values(config.FIELDS).find(f => f.key === 'defaultFilterCompanyId');
    if (companyFilterField && companies && companies.length > 0) {
        companyFilterField.options = [
            { value: null, label: 'Все компании' },
            ...companies.map(c => ({ value: c.id, label: c.name })),
        ];
    }
}
