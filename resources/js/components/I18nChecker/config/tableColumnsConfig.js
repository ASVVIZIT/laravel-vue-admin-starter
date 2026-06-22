/**
 * Конфиг колонок таблиц для всех режимов
 */

// Simple Mode
export const SIMPLE_TABLE_COLUMNS = [
    {
        prop: 'key',
        labelKey: 'i18nChecker.colKey',
        width: 320,
        fixed: true,
        type: 'code'
    },
    {
        prop: 'category',
        labelKey: 'i18nChecker.colCategory',
        width: 130,
        type: 'tag'
    },
    {
        prop: 'priority',
        labelKey: 'i18nChecker.colPriority',
        width: 110,
        align: 'center',
        type: 'priority'
    },
    {
        prop: 'value',
        labelKey: 'i18nChecker.colTranslation',
        minWidth: 200,
        type: 'translation'
    },
    {
        labelKey: 'i18nChecker.colStatus',
        width: 90,
        align: 'center',
        fixed: 'right',
        type: 'status'
    }
];

// Scanner Mode - Missing
export const SCANNER_MISSING_COLUMNS = [
    {
        prop: 'key',
        labelKey: 'i18nChecker.colKey',
        width: 320,
        fixed: true,
        type: 'code-highlight'
    },
    {
        labelKey: 'i18nChecker.files',
        minWidth: 180,
        type: 'files-list'
    },
    {
        labelKey: 'i18nChecker.colStatus',
        width: 80,
        align: 'center',
        fixed: 'right',
        type: 'status-missing'
    }
];

// Validator Mode - Duplicates
export const VALIDATOR_DUPLICATES_COLUMNS = [
    {
        prop: 'key',
        labelKey: 'i18nChecker.colKey',
        width: 200,
        type: 'code'
    },
    {
        labelKey: 'i18nChecker.paths',
        minWidth: 400,
        type: 'paths-list'
    }
];

// Validator Mode - Wrong Paths
export const VALIDATOR_WRONG_PATHS_COLUMNS = [
    {
        prop: 'wrongPath',
        labelKey: 'i18nChecker.wrongPath',
        width: 280,
        type: 'code-error'
    },
    {
        prop: 'correctPath',
        labelKey: 'i18nChecker.correctPath',
        width: 280,
        type: 'code-success'
    },
    {
        prop: 'usedIn',
        labelKey: 'i18nChecker.usedIn',
        minWidth: 200,
        type: 'files-list'
    }
];
