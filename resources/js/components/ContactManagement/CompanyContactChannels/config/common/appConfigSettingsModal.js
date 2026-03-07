// ============================================================================
// APP CONFIG SETTINGS MODAL — SETTINGS MODAL COMPONENT
// ============================================================================
// 📁 Путь: config/common/appConfigSettingsModal.js
// ✅ Используется: SettingsModal.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на модалку настроек
// ✅ Зависит от: config/companies/index.js (COMPANY_LIST_MESSAGES)
// ============================================================================

import { COMPANY_LIST_MESSAGES } from '../companies/index.js';

// ============================================================================
// UI CONFIGS (размеры и отступы)
// ============================================================================

export const SETTINGS_UI = {
    // ✅ DIALOG
    DIALOG_WIDTH: '460px',
    DIALOG_WIDTH_TABLET: '440px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',
    DIALOG_BORDER_RADIUS: '6px',
    DIALOG_BOX_SHADOW: '0 4px 20px rgba(0, 0, 0, 0.15)',

    // ✅ LABEL (ПК)
    LABEL_WIDTH: '140px',
    LABEL_POSITION: 'right',
    LABEL_HEIGHT: '14px',
    LABEL_FONT_SIZE: '14px',
    LABEL_LINE_HEIGHT: '14px',
    LABEL_MARGIN_BOTTOM: '0px',
    LABEL_LETTER_SPACING: '0.2px',

    // ✅ LABEL (МОБИЛЬНЫЕ)
    LABEL_POSITION_MOBILE_BREAKPOINT: 768,
    LABEL_WIDTH_MOBILE: '100%',
    LABEL_HEIGHT_MOBILE: '12px',
    LABEL_FONT_SIZE_MOBILE: '11px',
    LABEL_LINE_HEIGHT_MOBILE: '12px',
    LABEL_MARGIN_BOTTOM_MOBILE: '2px',

    // ✅ FORM
    FORM_SIZE: 'small',
    FORM_ITEM_MARGIN: '6px',
    FORM_ITEM_MARGIN_MOBILE: '8px',
    FORM_ITEM_GAP: '3px',
    FORM_ITEM_GAP_MOBILE: '4px',

    // ✅ SELECT
    SELECT_HEIGHT: '20px',
    SELECT_HEIGHT_MOBILE: '22px',
    SELECT_HEIGHT_TOUCH: '32px',
    SELECT_FONT_SIZE: '11px',
    SELECT_FONT_SIZE_MOBILE: '12px',
    SELECT_PADDING: '0 6px',
    SELECT_PADDING_MOBILE: '0 8px',

    // ✅ BUTTONS
    BUTTON_HEIGHT: '30px',
    BUTTON_HEIGHT_MOBILE: '32px',
    BUTTON_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '10px',
    BUTTON_FONT_SIZE_MOBILE: '11px',
    BUTTON_MIN_WIDTH: '70px',
    BUTTON_PADDING: '5px 10px',
    BUTTON_PADDING_MOBILE: '6px 12px',

    // ✅ PADDING
    HEADER_PADDING: '8px 14px',
    BODY_PADDING: '10px',
    FOOTER_PADDING: '8px 14px',
    HEADER_PADDING_MOBILE: '8px 12px',
    BODY_PADDING_MOBILE: '8px',
    FOOTER_PADDING_MOBILE: '8px 12px',
    HEADER_PADDING_SMALL: '8px 10px',
    BODY_PADDING_SMALL: '8px',
    FOOTER_PADDING_SMALL: '8px 10px',

    // ✅ FONTS
    TITLE_FONT_SIZE: '12px',
    TITLE_FONT_SIZE_MOBILE: '11px',
    HINT_FONT_SIZE: '8px',
    HINT_FONT_SIZE_MOBILE: '7px',
    DIVIDER_FONT_SIZE: '10px',
    DIVIDER_FONT_SIZE_MOBILE: '9px',

    // ✅ MARGINS
    FOOTER_GAP: '5px',
    FOOTER_GAP_MOBILE: '3px',
    DIVIDER_MARGIN: '6px 0',
    DIVIDER_MARGIN_MOBILE: '4px 0',

    // ✅ SCROLLBAR
    SCROLLBAR_WIDTH: '4px',

    // ✅ ANIMATIONS
    MODAL_ANIMATION: 'dialogFadeIn 300ms ease-out',
    TRANSITION_NORMAL: 'all 0.2s ease',
};

// ============================================================================
// SETTINGS FILTERS UI CONFIGS (настройки полей формы)
// ============================================================================

export const SETTINGS_FILTERS_UI = {
    // ✅ WRAPPER (select)
    WRAPPER_HEIGHT: '20px',
    WRAPPER_HEIGHT_MOBILE: '22px',
    WRAPPER_HEIGHT_SMALL: '20px',
    WRAPPER_HEIGHT_TOUCH: '32px',
    WRAPPER_FONT_SIZE: '11px',
    WRAPPER_FONT_SIZE_MOBILE: '12px',
    WRAPPER_FONT_SIZE_SMALL: '11px',
    WRAPPER_FONT_SIZE_TOUCH: '14px',
    WRAPPER_PADDING: '0 6px',
    WRAPPER_PADDING_MOBILE: '0 8px',
    WRAPPER_PADDING_SMALL: '0 6px',
    WRAPPER_PADDING_TOUCH: '0 10px',
    WRAPPER_BORDER_RADIUS: '3px',

    // ✅ INNER (select)
    INNER_HEIGHT: '18px',
    INNER_HEIGHT_MOBILE: '20px',
    INNER_HEIGHT_SMALL: '18px',
    INNER_HEIGHT_TOUCH: '30px',
    INNER_FONT_SIZE: '11px',
    INNER_FONT_SIZE_MOBILE: '12px',
    INNER_FONT_SIZE_SMALL: '11px',
    INNER_FONT_SIZE_TOUCH: '14px',
    INNER_LINE_HEIGHT: '18px',
    INNER_LINE_HEIGHT_MOBILE: '20px',
    INNER_LINE_HEIGHT_SMALL: '18px',
    INNER_LINE_HEIGHT_TOUCH: '30px',

    // ✅ DROPDOWN
    DROPDOWN_HEIGHT: '18px',
    DROPDOWN_HEIGHT_MOBILE: '20px',
    DROPDOWN_HEIGHT_SMALL: '18px',
    DROPDOWN_HEIGHT_TOUCH: '32px',
    DROPDOWN_FONT_SIZE: '11px',
    DROPDOWN_FONT_SIZE_MOBILE: '12px',
    DROPDOWN_FONT_SIZE_SMALL: '11px',
    DROPDOWN_FONT_SIZE_TOUCH: '14px',
    DROPDOWN_PADDING: '0 6px',
    DROPDOWN_PADDING_MOBILE: '0 8px',
    DROPDOWN_PADDING_SMALL: '0 6px',
    DROPDOWN_PADDING_TOUCH: '0 10px',
    DROPDOWN_LINE_HEIGHT: '18px',
    DROPDOWN_LINE_HEIGHT_MOBILE: '20px',
    DROPDOWN_LINE_HEIGHT_SMALL: '18px',
    DROPDOWN_LINE_HEIGHT_TOUCH: '32px',

    // ✅ CARET / ARROW
    CARET_FONT_SIZE: '10px',
    CARET_HEIGHT: '18px',
    CARET_LINE_HEIGHT: '18px',

    // ✅ HINT
    HINT_FONT_SIZE: '8px',
    HINT_FONT_SIZE_MOBILE: '7px',
    HINT_FONT_SIZE_TOUCH: '10px',

    // ✅ SWITCH
    SWITCH_HEIGHT: '18px',
    SWITCH_HEIGHT_TOUCH: '24px',
    SWITCH_FONT_SIZE: '10px',
    SWITCH_FONT_SIZE_TOUCH: '12px',

    // ✅ BUTTON
    BUTTON_HEIGHT: '30px',
    BUTTON_HEIGHT_MOBILE: '32px',
    BUTTON_HEIGHT_TOUCH: '36px',
    BUTTON_FONT_SIZE: '10px',
    BUTTON_FONT_SIZE_MOBILE: '11px',
    BUTTON_FONT_SIZE_TOUCH: '14px',
};

// ============================================================================
// MESSAGES (тексты интерфейса)
// ============================================================================

export const SETTINGS_MESSAGES = {
    TITLE_MAIN: 'Настройки',

    get TITLE() {
        return `${this.TITLE_MAIN} — ${COMPANY_LIST_MESSAGES.ENTITY_LABEL}`;
    },

    // ✅ РАЗДЕЛЫ
    SECTION_DATA_LOAD: 'Загрузка данных',
    SECTION_DISPLAY: 'Отображение',
    SECTION_DEFAULT_FILTERS: 'Фильтры по умолчанию',

    // ✅ CHUNK SIZE
    LABEL_CHUNK_SIZE: 'Размер порции:',
    PLACEHOLDER_CHUNK_SIZE: 'Выберите размер',
    HINT_CHUNK_SIZE: 'Количество записей загружаемых за один раз',

    // ✅ CONFIRM LOAD ALL
    LABEL_CONFIRM_LOAD_ALL: 'Подтверждение загрузки всех:',
    HINT_CONFIRM_LOAD_ALL: 'Запрашивать подтверждение перед загрузкой всех записей',

    // ✅ PAGE SIZE
    LABEL_PAGE_SIZE: 'Записей на страницу:',
    PLACEHOLDER_PAGE_SIZE: 'Выберите количество',
    HINT_PAGE_SIZE: 'Количество записей отображаемых на странице',

    // ✅ SHOW LOAD BUTTONS
    LABEL_SHOW_LOAD_BUTTONS: 'Показывать кнопки загрузки:',
    HINT_SHOW_LOAD_BUTTONS: 'Отображать кнопки "Загрузить ещё" и "Загрузить все"',

    // ✅ DEFAULT SORT
    LABEL_DEFAULT_SORT: 'Сортировка по умолчанию:',
    PLACEHOLDER_DEFAULT_SORT: 'Выберите сортировку',
    HINT_DEFAULT_SORT: 'Сортировка применяемая при загрузке страницы',

    // ✅ DEFAULT ICON FILTER
    LABEL_DEFAULT_ICON_FILTER: 'Фильтр по иконке:',
    PLACEHOLDER_DEFAULT_ICON_FILTER: 'Выберите фильтр',
    HINT_DEFAULT_ICON_FILTER: 'Фильтр по иконкам применяемый при загрузке',

    // ✅ SWITCH
    SWITCH_ON: 'Вкл',
    SWITCH_OFF: 'Выкл',

    // ✅ BUTTONS
    BTN_SAVE: 'Сохранить',
    BTN_CANCEL: 'Отмена',
    BTN_RESET_DEFAULTS: 'Сбросить',
};

// ============================================================================
// PROPS CONFIG (для SettingsModal.vue)
// ============================================================================

export const SETTINGS_MODAL_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    isSaving: { type: Boolean, default: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Получить заголовок модалки
export function getSettingsTitle() {
    return SETTINGS_MESSAGES.TITLE;
}

// ✅ Получить опции разделов
export function getSettingsSections() {
    return [
        SETTINGS_MESSAGES.SECTION_DATA_LOAD,
        SETTINGS_MESSAGES.SECTION_DISPLAY,
        SETTINGS_MESSAGES.SECTION_DEFAULT_FILTERS,
    ];
}
