/**
 * Конфиг статистики сканера
 * Порядок, иконки, классы — всё настраивается здесь
 */
export const SCANNER_STATS_CONFIG = [
    { key: 'totalKeys',  icon: '📊', labelKey: 'i18nChecker.totalKeys',  class: '' },
    { key: 'coverage',   icon: '📈', labelKey: 'i18nChecker.coverage',   class: 'i18n-stat-info' },
    { key: 'usedInCode', icon: '✅', labelKey: 'i18nChecker.usedInCode', class: 'i18n-stat-info' },
    { key: 'missing',    icon: '❌', labelKey: 'i18nChecker.missingKeys', class: 'i18n-stat-danger' },
    { key: 'unused',     icon: '️', labelKey: 'i18nChecker.unusedKeys',  class: 'i18n-stat-warning' }
];
