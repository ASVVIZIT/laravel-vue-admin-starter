/**
 * Конфиг лимитов отображения
 * Магические числа вынесены сюда
 */
export const DISPLAY_LIMITS = {
    filesPerRow: 3,
    unusedKeysLimit: 500,
    flatKeysLimit: 200,
    usedInFilesLimit: 2
};

export const getFilesSlice = (files, limit = DISPLAY_LIMITS.filesPerRow) =>
    (files || []).slice(0, limit);

export const getRemainingCount = (files, limit = DISPLAY_LIMITS.filesPerRow) =>
    Math.max(0, (files || []).length - limit);
