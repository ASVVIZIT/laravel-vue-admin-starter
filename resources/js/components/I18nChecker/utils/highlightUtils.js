/**
 * Утилита подсветки текста в поиске
 */
export const highlightText = (text, query, className = 'i18n-highlight') => {
    if (!query || !query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
};
