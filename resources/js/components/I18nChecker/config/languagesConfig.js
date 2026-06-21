/**
 * Конфиг языков и флагов
 */
export const LANGUAGE_FLAGS = {
    'ru': '🇷🇺',
    'en': '🇬🇧',
    'zh-cn': '🇨',
    'zh': '🇨🇳'
};

export const DEFAULT_LANGUAGE_FLAG = '🌍';

export const getFlagEmoji = (lang) =>
    LANGUAGE_FLAGS[lang] || DEFAULT_LANGUAGE_FLAG;
