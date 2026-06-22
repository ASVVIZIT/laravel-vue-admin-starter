/**
 * Конфиг фильтров для Simple Mode
 * Языки импортируются из languagesConfig — единый источник истины
 */
import { LANGUAGE_OPTIONS, DEFAULT_LANGUAGE } from './languagesConfig.js';

export const FILTER_DEFAULTS = {
    category: 'all',
    status: 'all',
    lang: DEFAULT_LANGUAGE
};

export const STATUS_OPTIONS = [
    { value: 'all', labelKey: 'i18nChecker.all' },
    { value: 'found', labelKey: 'i18nChecker.statusFound' },
    { value: 'missing', labelKey: 'i18nChecker.statusMissing' }
];

export const CATEGORY_OPTIONS = [
    { value: 'all', labelKey: 'i18nChecker.allCategories' }
];

// Реэкспорт — чтобы не импортировать из двух мест
export { LANGUAGE_OPTIONS };
