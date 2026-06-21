/**
 * Конфиг приоритетов ключей i18n
 */
export const PRIORITY_TYPE_MAP = {
    critical: 'danger',
    normal: 'warning',
    low: 'info'
};

export const PRIORITY_LABEL_KEYS = {
    critical: 'i18nChecker.priorityCritical',
    normal: 'i18nChecker.priorityNormal',
    low: 'i18nChecker.priorityLow'
};

export const getPriorityType = (priority) =>
    PRIORITY_TYPE_MAP[priority] || 'info';

export const getPriorityLabelKey = (priority) =>
    PRIORITY_LABEL_KEYS[priority] || priority;
