// ============================================================================
// APP CONFIG FILTERS ENTITY — УНИВЕРСАЛЬНЫЕ ФИЛЬТРЫ СУЩНОСТЕЙ
// ============================================================================
// 📁 Путь: config/common/appConfigFiltersEntity.js
// ✅ Используется: FiltersEntity.vue (универсальный компонент)
// ✅ Безопасно менять — влияет только на фильтрацию
// ✅ Зависит от: config/global/index.js (COLORS)
// ============================================================================

import { COLORS } from '../global/index.js';

// ============================================================================
// ТИПЫ ПОЛЕЙ ФИЛЬТРОВ
// ============================================================================

export const FILTER_FIELD_TYPES = {
    SEARCH: 'search',
    SELECT: 'select',
    MULTI_SELECT: 'multi-select',
    SWITCH: 'switch',
    DATE_RANGE: 'date-range',
    NUMBER_RANGE: 'number-range',
};

// ============================================================================
// КОНФИГ ФИЛЬТРОВ — КОМПАНИИ
// ============================================================================

export const COMPANY_FILTERS_CONFIG = {
    ENTITY_TYPE: 'company',
    FIELDS: {
        SEARCH: {
            key: 'searchQuery',
            label: 'Поиск',
            type: FILTER_FIELD_TYPES.SEARCH,
            placeholder: 'Название, адрес, описание...',
            defaultValue: '',
            debounce: 500,
            icon: 'Search',
            width: '180px',
            widthFocused: '240px',
        },
        FILTER_HAS_ICON: {
            key: 'filterHasIcon',
            label: 'Иконка',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Все',
            defaultValue: '',
            options: [
                { value: '', label: 'Все' },
                { value: 'with', label: 'С иконкой' },
                { value: 'without', label: 'Без иконки' },
            ],
            icon: 'Picture',
            width: '100px',
        },
        SORT_BY: {
            key: 'sortBy',
            label: 'Сортировка',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Сортировка',
            defaultValue: 'id_asc',
            options: [],
            icon: 'Sort',
            width: '140px',
        },
    },
    BUTTONS: { RESET: 'Сбросить' },
    MESSAGES: { FOUND: 'Найдено', OF: 'из', NO_RESULTS: 'Ничего не найдено' },
    UI: {
        HEIGHT: '20px',
        GAP: '6px',
        INFO_BADGE_SHOW: true,
        RESET_BUTTON_SHOW: true,
    },
};

// ============================================================================
// КОНФИГ ФИЛЬТРОВ — КАНАЛЫ
// ============================================================================

export const CHANNEL_FILTERS_CONFIG = {
    ENTITY_TYPE: 'channel',
    FIELDS: {
        SEARCH: {
            key: 'search',
            label: 'Поиск',
            type: FILTER_FIELD_TYPES.SEARCH,
            placeholder: 'Название, контакт, URL...',
            defaultValue: '',
            debounce: 500,
            icon: 'Search',
            width: '160px',
            widthFocused: '220px',
        },
        COMPANY_ID: {
            key: 'company_id',
            label: 'Компания',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Все компании',
            defaultValue: null,
            options: [],  // ✅ ЗАПОЛНЯЕТСЯ ДИНАМИЧЕСКИ (companies)
            icon: 'OfficeBuilding',
            width: '140px',
            clearable: true,
            filterable: true,
        },
        TYPE: {
            key: 'type',
            label: 'Тип',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Все типы',
            defaultValue: null,
            options: [],  // ✅ ЗАПОЛНЯЕТСЯ ДИНАМИЧЕСКИ (CHANNEL_TYPE_LABELS)
            icon: 'Connection',
            width: '120px',
            clearable: true,
        },
        IS_ACTIVE: {
            key: 'is_active',
            label: 'Статус',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Все статусы',
            defaultValue: null,
            options: [
                { value: null, label: 'Все' },
                { value: true, label: 'Активные' },
                { value: false, label: 'Неактивные' },
            ],
            icon: 'CircleCheck',
            width: '110px',
            clearable: true,
        },
        SORT_BY: {
            key: 'sort_by',
            label: 'Сортировка',
            type: FILTER_FIELD_TYPES.SELECT,
            placeholder: 'Сортировка',
            defaultValue: 'order_asc',
            options: [],  // ✅ ЗАПОЛНЯЕТСЯ ДИНАМИЧЕСКИ (CHANNEL_SORT_OPTIONS)
            icon: 'Sort',
            width: '140px',
        },
    },
    BUTTONS: { RESET: 'Сбросить' },
    MESSAGES: { FOUND: 'Найдено', OF: 'из', NO_RESULTS: 'Ничего не найдено' },
    UI: {
        HEIGHT: '20px',
        GAP: '6px',
        INFO_BADGE_SHOW: true,
        RESET_BUTTON_SHOW: true,
    },
};

// ============================================================================
// UI CONFIGS (визуальные настройки фильтров)
// ============================================================================

export const FILTERS_ENTITY_UI = {
    // ✅ CONTAINER
    CONTAINER_PADDING: '1px',
    CONTAINER_GAP: '6px',
    CONTAINER_MIN_HEIGHT: '20px',

    // ✅ WRAPPER
    WRAPPER_HEIGHT: '20px',
    WRAPPER_HEIGHT_MOBILE: '20px',
    WRAPPER_HEIGHT_SMALL: '20px',
    WRAPPER_HEIGHT_TOUCH: '32px',
    WRAPPER_FONT_SIZE: '11px',
    WRAPPER_PADDING: '0 3px',
    WRAPPER_BORDER_RADIUS: '2px',

    // ✅ INNER
    INNER_HEIGHT: '18px',
    INNER_FONT_SIZE: '11px',
    INNER_LINE_HEIGHT: '18px',

    // ✅ DROPDOWN
    DROPDOWN_HEIGHT: '18px',
    DROPDOWN_FONT_SIZE: '11px',
    DROPDOWN_PADDING: '0 6px',
    DROPDOWN_LINE_HEIGHT: '18px',

    // ✅ ICONS
    ICON_SIZE: '14px',
    ICON_COLOR: COLORS.INFO,

    // ✅ INFO BADGE
    INFO_BADGE_FONT_SIZE: '10px',
    INFO_BADGE_COLOR: COLORS.INFO,
    INFO_BADGE_GAP: '8px',

    // ✅ BUTTONS
    BUTTON_HEIGHT: '20px',
    BUTTON_WIDTH: '24px',
    BUTTON_ICON_SIZE: '14px',

    // ✅ COLORS
    PRIMARY_COLOR: COLORS.PRIMARY,
    INFO_COLOR: COLORS.INFO,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Получить конфиг фильтров для сущности
export function getEntityFiltersConfig(entityType) {
    const configs = {
        company: COMPANY_FILTERS_CONFIG,
        channel: CHANNEL_FILTERS_CONFIG,
    };
    return configs[entityType] || COMPANY_FILTERS_CONFIG;
}

// ✅ Получить значения фильтров по умолчанию
export function getDefaultEntityFilters(entityType) {
    const config = getEntityFiltersConfig(entityType);
    const defaults = {};
    Object.values(config.FIELDS).forEach(field => {
        defaults[field.key] = field.defaultValue;
    });
    return defaults;
}

// ✅ Получить опции поля фильтра
export function getFilterFieldOptions(entityType, fieldKey) {
    const config = getEntityFiltersConfig(entityType);
    const field = Object.values(config.FIELDS).find(f => f.key === fieldKey);
    return field?.options || [];
}

// ✅ Инициализировать опции фильтров (для динамических данных)
export function initializeFilterOptions(entityType, optionsMap) {
    const config = getEntityFiltersConfig(entityType);
    Object.keys(optionsMap).forEach(fieldKey => {
        const field = Object.values(config.FIELDS).find(f => f.key === fieldKey);
        if (field && field.type === FILTER_FIELD_TYPES.SELECT) {
            field.options = optionsMap[fieldKey];
        }
    });
    return config;
}

// ✅ Получить поле фильтра по ключу
export function getFilterFieldByKey(entityType, fieldKey) {
    const config = getEntityFiltersConfig(entityType);
    return Object.values(config.FIELDS).find(f => f.key === fieldKey);
}

// ✅ Проверить есть ли активные фильтры
export function hasActiveFilters(entityType, filters) {
    const defaults = getDefaultEntityFilters(entityType);
    return Object.keys(filters).some(key => {
        const currentValue = filters[key];
        const defaultValue = defaults[key];
        if (defaultValue === null || defaultValue === '') {
            return currentValue !== null && currentValue !== '';
        }
        return currentValue !== defaultValue;
    });
}

// ✅ Получить количество активных фильтров
export function getActiveFiltersCount(entityType, filters) {
    const defaults = getDefaultEntityFilters(entityType);
    let count = 0;
    Object.keys(filters).forEach(key => {
        const currentValue = filters[key];
        const defaultValue = defaults[key];
        if (defaultValue === null || defaultValue === '') {
            if (currentValue !== null && currentValue !== '') {
                count++;
            }
        } else if (currentValue !== defaultValue) {
            count++;
        }
    });
    return count;
}
