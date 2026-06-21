/**
 * Конфиг статистики валидатора
 */
export const VALIDATOR_STATS_CONFIG = [
    { key: 'totalKeys',  icon: '📊', labelKey: 'i18nChecker.totalKeys',  class: '' },
    { key: 'duplicates', icon: '', labelKey: 'i18nChecker.duplicates', class: 'i18n-stat-warning' },
    { key: 'wrongPaths', icon: '⚠️', labelKey: 'i18nChecker.wrongPaths', class: 'i18n-stat-danger' },
    { key: 'flatKeys',   icon: '📝', labelKey: 'i18nChecker.flatKeys',   class: 'i18n-stat-info' }
];
