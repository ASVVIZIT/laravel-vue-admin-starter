/**
 * Конфиг языков — ЕДИНСТВЕННЫЙ источник истины о языках
 * Все остальные конфиги импортируют отсюда
 */
export const LANGUAGE_FLAGS = {
    'ru': '🇷🇺',
    'en': '🇬🇧',
    'zh-cn': '🇨',
    'zh': '🇨🇳'
};

export const DEFAULT_LANGUAGE_FLAG = '🌍';

export const DEFAULT_LANGUAGE = 'ru';

export const getFlagEmoji = (lang) =>
    LANGUAGE_FLAGS[lang] || DEFAULT_LANGUAGE_FLAG;

// Генерируем опции для фильтров на основе флагов
export const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_FLAGS)
    .filter(lang => lang !== 'zh') // zh — алиас для zh-cn, не дублируем
    .map(lang => ({
        value: lang,
        label: `${getFlagEmoji(lang)} ${lang.toUpperCase()}`
    }));

export const getLanguageLabel = (lang) => {
    const option = LANGUAGE_OPTIONS.find(o => o.value === lang);
    return option ? option.label : `${getFlagEmoji(lang)} ${lang.toUpperCase()}`;
};
