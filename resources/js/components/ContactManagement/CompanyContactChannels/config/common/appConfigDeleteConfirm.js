// ============================================================================
// APP CONFIG DELETE CONFIRM — DELETE CONFIRM DIALOG
// ============================================================================
// 📁 Путь: config/common/appConfigDeleteConfirm.js
// ✅ Используется: DeleteConfirm.vue, CompanyList.vue
// ✅ Безопасно менять — влияет только на диалог подтверждения удаления
// ============================================================================

// ============================================================================
// UI CONFIGS (размеры и стили)
// ============================================================================

export const DELETE_CONFIRM_UI = {
    // ✅ DIALOG WIDTH
    DIALOG_WIDTH: '400px',
    DIALOG_WIDTH_TABLET: '450px',
    DIALOG_WIDTH_MOBILE: '90%',
    DIALOG_WIDTH_SMALL: '95%',

    // ✅ ICON
    ICON_SIZE: '48px',
    ICON_SIZE_TABLET: '42px',
    ICON_SIZE_MOBILE: '36px',
    ICON_SIZE_SMALL: '32px',
    ICON_COLOR: '#f56c6c',

    // ✅ CONTENT
    CONTENT_PADDING: '8px 0',
    MESSAGE_FONT_SIZE: '14px',
    MESSAGE_FONT_SIZE_TABLET: '13px',
    MESSAGE_FONT_SIZE_MOBILE: '12px',
    MESSAGE_FONT_SIZE_SMALL: '11px',
    MESSAGE_COLOR: '#606266',
    MESSAGE_LINE_HEIGHT: '1.6',
    MESSAGE_MAX_WIDTH: '400px',
    ITEM_NAME_FONT_WEIGHT: '600',
    ITEM_NAME_COLOR: '#303133',

    // ✅ HINT
    HINT_GAP: '6px',
    HINT_GAP_MOBILE: '12px',
    HINT_FONT_SIZE: '12px',
    HINT_FONT_SIZE_MOBILE: '11px',
    HINT_FONT_SIZE_SMALL: '10px',
    HINT_COLOR: '#909399',
    HINT_PADDING: '4px 8px',
    HINT_BACKGROUND: '#f5f7fa',
    HINT_BORDER_RADIUS: '4px',

    // ✅ FOOTER
    FOOTER_GAP: '12px',
    FOOTER_GAP_MOBILE: '8px',
    FOOTER_PADDING_TOP: '12px',
    BUTTON_MIN_WIDTH: '80px',

    // ✅ HEADER
    HEADER_PADDING: '16px 20px',
    HEADER_BORDER: '1px solid #EBEEF5',
    HEADER_BACKGROUND: '#FFFFFF',
    TITLE_FONT_SIZE: '16px',
    TITLE_FONT_WEIGHT: '600',
    TITLE_COLOR: '#303133',

    // ✅ BODY
    BODY_PADDING: '24px 20px',
    BODY_PADDING_SMALL: '16px 12px',

    // ✅ FOOTER
    FOOTER_PADDING: '12px 20px 16px',
    FOOTER_BORDER: '1px solid #EBEEF5',
    FOOTER_BACKGROUND: '#FFFFFF',
};

// ============================================================================
// MESSAGES (тексты интерфейса)
// ============================================================================

export const DELETE_CONFIRM_MESSAGES = {
    TITLE: 'Подтверждение удаления',
    MESSAGE: (itemName, entityLabel) =>
        `Вы действительно хотите удалить <strong>${itemName || entityLabel}</strong>?`,
    CONFIRM: 'Удалить',
    CANCEL: 'Отмена',
    HINT_TEXT: 'Это действие нельзя отменить',
};

// ============================================================================
// PROPS CONFIG (для DeleteConfirm.vue)
// ============================================================================

export const DELETE_CONFIRM_PROPS_CONFIG = {
    visible: { type: Boolean, default: false },
    item: { type: [Object, null], default: null },
    itemName: { type: String, default: '' },
    entityLabel: { type: String, default: 'запись' },
    loading: { type: Boolean, default: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ✅ Получить сообщение об удалении
export function getDeleteMessage(itemName, entityLabel) {
    return DELETE_CONFIRM_MESSAGES.MESSAGE(itemName, entityLabel);
}

// ✅ Получить заголовок диалога
export function getDeleteTitle() {
    return DELETE_CONFIRM_MESSAGES.TITLE;
}

// ✅ Получить текст кнопки подтверждения
export function getConfirmText() {
    return DELETE_CONFIRM_MESSAGES.CONFIRM;
}

// ✅ Получить текст кнопки отмены
export function getCancelText() {
    return DELETE_CONFIRM_MESSAGES.CANCEL;
}
