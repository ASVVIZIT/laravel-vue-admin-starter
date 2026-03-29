/**
 * ============================================================================
 * EDITABLE CELL CONFIG — КОНФИГУРАЦИЯ ДЛЯ INLINE РЕДАКТИРОВАНИЯ
 * ============================================================================
 * 📁 Путь: config/common/appConfigEditableCell.js
 * ✅ Используется: EditableCell.vue, CompanyTable.vue, ChannelTable.vue
 * ✅ Безопасно менять — влияет только на inline редактирование
 * ============================================================================
 */

import { COLORS } from '../global/index.js';

// ============================================================================
// UI CONFIGS
// ============================================================================

export const EDITABLE_CELL_UI = {
    INPUT_HEIGHT: '22px',
    FONT_SIZE: '8px',
    LINE_HEIGHT: '1.2',
    BUTTON_FONT_SIZE: '14px',
    ERROR_COLOR: COLORS.DANGER,
};

// ============================================================================
// PROPS CONFIG
// ============================================================================

export const EDITABLE_CELL_PROPS_CONFIG = {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },  // text, textarea, select
    placeholder: { type: String, default: '' },
    maxLength: { type: Number, default: 255 },
    min: { type: Number, default: null },
    rows: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    showEditButton: { type: Boolean, default: true },
    showActionButtons: { type: Boolean, default: false },
    emptyText: { type: String, default: '—' },
    fieldName: { type: String, default: null },  // ✅ ДЛЯ ВАЛИДАЦИИ
    channelType: { type: String, default: null },  // ✅ ДЛЯ ВАЛИДАЦИИ
    validator: { type: Function, default: null }, // ✅ КАСТОМНАЯ ВАЛИДАЦИЯ
    fieldAvailable: { type: Boolean, default: true },  // Доступно ли поле
    unavailableReason: { type: String, default: '' },  // Причина недоступности
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
    EDITABLE_CELL_UI,
    EDITABLE_CELL_PROPS_CONFIG,
};
