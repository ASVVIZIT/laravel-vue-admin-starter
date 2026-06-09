/**
 * ============================================================================
 * TRAINING STATES CONFIG — КОНСТАНТЫ СОСТОЯНИЙ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/config/trainingStatesConfig.js
 * ✅ Назначение: Единый источник истины для всех состояний модуля
 * ============================================================================
 */

/**
 * Состояния изменения типа упражнения (Type Change Guard)
 */
export const TYPE_CHANGE_STATE = {
    NORMAL: 'normal',      // Нет замороженных данных
    PENDING: 'pending',    // Есть замороженные данные, таймер активен (можно отменить)
    EXPIRED: 'expired'     // Есть замороженные данные, таймер истёк (нельзя отменить)
}

/**
 * В будущем можно добавить сюда другие состояния модуля:
 *
 * export const FORM_STATE = {
 *     IDLE: 'idle',
 *     LOADING: 'loading',
 *     SAVING: 'saving',
 *     ERROR: 'error'
 * }
 *
 * export const FILTER_STATE = {
 *     ACTIVE: 'active',
 *     INACTIVE: 'inactive',
 *     MODIFIED: 'modified'
 * }
 */

export default {
    TYPE_CHANGE_STATE
}
