// ============================================================================
// APP CONFIG COMPANY FORM — COMPANY FORM COMPONENT
// ============================================================================
// 📁 Путь: config/companies/appConfigCompanyForm.js
// ✅ Используется: CompanyForm.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на форму компании
// ✅ Зависит от: config/global/index.js (COLORS, BREAKPOINTS)
// ============================================================================

import { COLORS, BREAKPOINTS } from '../global/index.js';

// ============================================================================
// UI CONFIGS (размеры и отступы)
// ============================================================================

export const COMPANY_FORM_UI = {
    // ✅ DIALOG
    DIALOG_WIDTH: '500px',
    DIALOG_WIDTH_TABLET: '450px',
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

    // ✅ FORM
    LABEL_WIDTH: '80px',
    LABEL_POSITION: 'top',
    FORM_SIZE: 'small',
    ICON_SELECT_WIDTH: '100%',
    FORM_LABEL_FONT_SIZE: '12px',
    FORM_LABEL_FONT_SIZE_MOBILE: '11px',
    FORM_LABEL_FONT_SIZE_SMALL: '10px',
    FORM_LABEL_FONT_WEIGHT: '500',
    FORM_LABEL_COLOR: '#606266',
    FORM_LABEL_MARGIN_BOTTOM: '4px',
    FORM_INPUT_FONT_SIZE: '13px',
    FORM_INPUT_FONT_SIZE_MOBILE: '12px',
    FORM_INPUT_FONT_SIZE_SMALL: '11px',
    FORM_TEXTAREA_MIN_HEIGHT: '60px',
    FORM_TEXTAREA_RESIZE: 'vertical',
    FORM_ROW_GAP: '16px',
    FORM_ROW_GAP_TABLET: '12px',
    FORM_ROW_GAP_MOBILE: '8px',
    FORM_ROW_MARGIN_BOTTOM: '16px',
    FORM_ITEM_MARGIN_BOTTOM: '16px',
    FORM_FOOTER_GAP: '12px',
    FORM_FOOTER_GAP_MOBILE: '8px',
    FORM_FOOTER_PADDING_TOP: '12px',
    FORM_FOOTER_BUTTON_MIN_WIDTH: '80px',

    // ✅ ID INPUT
    FORM_ID_INPUT_BACKGROUND: '#f5f7fa',
    FORM_ID_INPUT_COLOR: '#909399',
    FORM_ID_INPUT_FONT_WEIGHT: '600',

    // ✅ SELECT
    FORM_SELECT_HEIGHT: '20px',
    FORM_ICON_OPTION_GAP: '6px',
    FORM_DROPDOWN_ITEM_PADDING: '8px 12px',
    FORM_DROPDOWN_HOVER_BACKGROUND: '#f5f7fa',
    FORM_DROPDOWN_SELECTED_BACKGROUND: '#f0f9eb',

    // ✅ ERROR
    FORM_ERROR_FONT_SIZE: '10px',
    FORM_ERROR_PADDING_TOP: '2px',

    BUTTON_PADDING: '5px 10px',
};

// ============================================================================
// FORM FILTERS UI CONFIGS (настройки полей формы)
// ============================================================================

export const COMPANY_FORM_FILTERS_UI = {
    // ✅ WRAPPER (input/select)
    WRAPPER_HEIGHT: '32px',
    WRAPPER_HEIGHT_MOBILE: '32px',
    WRAPPER_HEIGHT_SMALL: '32px',
    WRAPPER_HEIGHT_TOUCH: '40px',
    WRAPPER_FONT_SIZE: '13px',
    WRAPPER_FONT_SIZE_MOBILE: '12px',
    WRAPPER_FONT_SIZE_SMALL: '11px',
    WRAPPER_FONT_SIZE_TOUCH: '14px',
    WRAPPER_PADDING: '0 10px',
    WRAPPER_PADDING_MOBILE: '0 8px',
    WRAPPER_PADDING_SMALL: '0 6px',
    WRAPPER_PADDING_TOUCH: '0 10px',
    WRAPPER_BORDER_RADIUS: '3px',

    // ✅ INNER (input/select)
    INNER_HEIGHT: '30px',
    INNER_HEIGHT_MOBILE: '30px',
    INNER_HEIGHT_SMALL: '30px',
    INNER_HEIGHT_TOUCH: '38px',
    INNER_FONT_SIZE: '13px',
    INNER_FONT_SIZE_MOBILE: '12px',
    INNER_FONT_SIZE_SMALL: '11px',
    INNER_FONT_SIZE_TOUCH: '14px',
    INNER_LINE_HEIGHT: '30px',
    INNER_LINE_HEIGHT_MOBILE: '30px',
    INNER_LINE_HEIGHT_SMALL: '30px',
    INNER_LINE_HEIGHT_TOUCH: '38px',

    // ✅ DROPDOWN
    DROPDOWN_HEIGHT: '32px',
    DROPDOWN_HEIGHT_MOBILE: '32px',
    DROPDOWN_HEIGHT_SMALL: '32px',
    DROPDOWN_HEIGHT_TOUCH: '40px',
    DROPDOWN_FONT_SIZE: '13px',
    DROPDOWN_FONT_SIZE_MOBILE: '12px',
    DROPDOWN_FONT_SIZE_SMALL: '11px',
    DROPDOWN_FONT_SIZE_TOUCH: '14px',
    DROPDOWN_PADDING: '0 10px',
    DROPDOWN_PADDING_MOBILE: '0 8px',
    DROPDOWN_PADDING_SMALL: '0 6px',
    DROPDOWN_PADDING_TOUCH: '0 10px',
    DROPDOWN_LINE_HEIGHT: '32px',
    DROPDOWN_LINE_HEIGHT_MOBILE: '32px',
    DROPDOWN_LINE_HEIGHT_SMALL: '32px',
    DROPDOWN_LINE_HEIGHT_TOUCH: '40px',

    // ✅ CARET / ARROW
    CARET_FONT_SIZE: '12px',
    CARET_HEIGHT: '30px',
    CARET_LINE_HEIGHT: '30px',

    // ✅ PREFIX / SUFFIX
    PREFIX_HEIGHT: '30px',
    PREFIX_FONT_SIZE: '13px',

    // ✅ ICON OPTION
    ICON_OPTION_GAP: '6px',
    ICON_OPTION_FONT_SIZE: '13px',
    ICON_OPTION_FONT_SIZE_MOBILE: '12px',
    ICON_OPTION_FONT_SIZE_SMALL: '11px',
    ICON_OPTION_FONT_SIZE_TOUCH: '14px',

    // ✅ ROW
    ROW_GAP: '16px',
    ROW_GAP_TABLET: '12px',
    ROW_GAP_MOBILE: '8px',

    // ✅ BUTTON
    BUTTON_HEIGHT: '32px',
    BUTTON_HEIGHT_TOUCH: '44px',
    BUTTON_FONT_SIZE: '13px',
    BUTTON_FONT_SIZE_TOUCH: '14px',
};

// ============================================================================
// MESSAGES (тексты интерфейса)
// ============================================================================

export const COMPANY_FORM_MESSAGES = {
    // ✅ ЗАГОЛОВКИ
    TITLE_CREATE: 'Добавить Компанию',
    TITLE_EDIT: 'Редактировать Компанию',

    // ✅ КНОПКИ
    SUBMIT_CREATE: 'Создать',
    SUBMIT_EDIT: 'Сохранить',
    CANCEL: 'Отмена',

    // ✅ ВАЛИДАЦИЯ
    FIELD_REQUIRED: (field) => `Поле "${field}" обязательно`,
    FIELD_MIN_LENGTH: (field, min) => `Минимум ${min} символов`,
    FIELD_MAX_LENGTH: (field, max) => `Максимум ${max} символов`,

    // ✅ УСПЕХ
    SUCCESS_COMPANY_CREATED: 'Компания создана',
    SUCCESS_COMPANY_UPDATED: 'Компания обновлена',
};

// ============================================================================
// PROPS CONFIG (для CompanyForm.vue)
// ============================================================================

export const COMPANY_FORM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    company: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    iconOptions: { type: Array, default: () => [] },
    iconMap: { type: Object, default: () => ({}) },
    useStore: { type: Boolean, default: true },
};

// ============================================================================
// VALIDATION (правила валидации)
// ============================================================================

export const COMPANY_FORM_VALIDATION = {
    NAME: { required: true, min: 2, max: 255, trigger: ['blur', 'change'] },
    DESCRIPTION: { required: false, max: 1000, trigger: ['blur', 'change'] },
    ADDRESS: { required: false, max: 500, trigger: ['blur', 'change'] },
};

// ============================================================================
// DEFAULT VALIDATION RULES (правила по умолчанию)
// ============================================================================

export function getDefaultCompanyFormValidation() {
    return {
        name: [
            { required: COMPANY_FORM_VALIDATION.NAME.required, message: COMPANY_FORM_MESSAGES.FIELD_REQUIRED('Название'), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { min: COMPANY_FORM_VALIDATION.NAME.min, message: COMPANY_FORM_MESSAGES.FIELD_MIN_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.min), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
            { max: COMPANY_FORM_VALIDATION.NAME.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Название', COMPANY_FORM_VALIDATION.NAME.max), trigger: COMPANY_FORM_VALIDATION.NAME.trigger },
        ],
        description: [
            { max: COMPANY_FORM_VALIDATION.DESCRIPTION.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Описание', COMPANY_FORM_VALIDATION.DESCRIPTION.max), trigger: COMPANY_FORM_VALIDATION.DESCRIPTION.trigger },
        ],
        address: [
            { max: COMPANY_FORM_VALIDATION.ADDRESS.max, message: COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH('Адрес', COMPANY_FORM_VALIDATION.ADDRESS.max), trigger: COMPANY_FORM_VALIDATION.ADDRESS.trigger },
        ],
        'settings.icon': [],
    };
}

// ============================================================================
// FIELD CONFIGS (конфигурация полей)
// ============================================================================

export const COMPANY_FORM_FIELDS = {
    NAME: { key: 'name', label: 'Название', placeholder: 'Введите название компании', maxLength: 255 },
    DESCRIPTION: { key: 'description', label: 'Описание', placeholder: 'Введите описание компании', maxLength: 1000, rows: 3 },
    ADDRESS: { key: 'address', label: 'Адрес', placeholder: 'Введите адрес компании', maxLength: 500 },
    ICON: { key: 'settings.icon', label: 'Иконка', placeholder: 'Выберите иконку', clearable: true },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Получить начальное состояние формы
export function getInitialCompanyFormState() {
    return {
        id: '',
        name: '',
        description: '',
        address: '',
        settings: {
            icon: '',
        },
    };
}

// ✅ Получить правила валидации по умолчанию
export function getFormValidationRules() {
    return getDefaultCompanyFormValidation();
}

// ✅ Получить конфигурацию поля
export function getFieldConfig(fieldName) {
    return COMPANY_FORM_FIELDS[fieldName.toUpperCase()] || null;
}

// ✅ Получить сообщение об ошибке валидации
export function getValidationErrorMessage(field, type, value) {
    if (type === 'required') {
        return COMPANY_FORM_MESSAGES.FIELD_REQUIRED(field);
    }
    if (type === 'min') {
        return COMPANY_FORM_MESSAGES.FIELD_MIN_LENGTH(field, value);
    }
    if (type === 'max') {
        return COMPANY_FORM_MESSAGES.FIELD_MAX_LENGTH(field, value);
    }
    return '';
}
