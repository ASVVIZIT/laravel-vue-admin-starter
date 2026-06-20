import request from '@/utils/request';

/**
 * Сканировать код и найти все i18n ключи
 */
export const scanI18n = () => {
    return request({
        url: '/i18n/scan',
        method: 'get',
    });
};

/**
 * Получить все ключи из кода
 */
export const getI18nKeys = () => {
    return request({
        url: '/i18n/keys',
        method: 'get',
    });
};

/**
 * Получить все ключи из переводов
 */
export const getI18nTranslations = (lang) => {
    return request({
        url: `/i18n/translations/${lang}`,
        method: 'get',
    });
};

/**
 * 🔍 Проверить пути ключей (Validator Mode)
 * Находит дубликаты, неправильные пути и плоские ключи
 */
export const validateI18nPaths = () => {
    return request({
        url: '/i18n/validate-paths',
        method: 'get',
    });
};
