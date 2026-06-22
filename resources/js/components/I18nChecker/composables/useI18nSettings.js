import { computed } from 'vue';
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js';

export function useI18nSettings() {
    const settingsStore = useI18nSettingsStore();

    // Инициализация при первом вызове
    if (!settingsStore.initialized) {
        settingsStore.loadFromStorage();
    }

    // ========================================================================
    // 🔥 ОБЪЕКТЫ ЦЕЛИКОМ (для тех, кому нужны все поля сразу)
    // ========================================================================
    const icons = computed(() => settingsStore.iconsSettings || {});
    const display = computed(() => settingsStore.displaySettings || {});
    const behavior = computed(() => settingsStore.behaviorSettings || {});
    const meta = computed(() => settingsStore.metaSettings || {});

    // ========================================================================
    // 🔥 ОТДЕЛЬНЫЕ ПОЛЯ (для точечного использования)
    // ========================================================================

    // Icons
    const iconSource = computed(() => settingsStore.iconsSettings?.source || 'bootstrap');
    const iconSize = computed(() => settingsStore.iconsSettings?.size || 20);
    const iconColor = computed(() => settingsStore.iconsSettings?.color || 'currentColor');
    const showLabels = computed(() => settingsStore.iconsSettings?.showLabels ?? true);

    // Display
    const tableHeight = computed(() => settingsStore.displaySettings?.tableHeight || 350);
    const maxFilesPerRow = computed(() => settingsStore.displaySettings?.maxFilesPerRow || 3);
    const maxUnusedKeys = computed(() => settingsStore.displaySettings?.maxUnusedKeys || 500);
    const maxFlatKeys = computed(() => settingsStore.displaySettings?.maxFlatKeys || 200);
    const fontSize = computed(() => settingsStore.displaySettings?.fontSize || 13);
    const compactMode = computed(() => settingsStore.displaySettings?.compactMode || false);

    // Behavior
    const autoRunScanner = computed(() => settingsStore.behaviorSettings?.autoRunScanner || false);
    const autoRunValidator = computed(() => settingsStore.behaviorSettings?.autoRunValidator || false);
    const cacheResults = computed(() => settingsStore.behaviorSettings?.cacheResults ?? true);
    const cacheTTL = computed(() => settingsStore.behaviorSettings?.cacheTTL || 300);
    const confirmBeforeExport = computed(() => settingsStore.behaviorSettings?.confirmBeforeExport ?? true);
    const highlightSearch = computed(() => settingsStore.behaviorSettings?.highlightSearch ?? true);

    return {
        // Объекты целиком
        icons,
        display,
        behavior,
        meta,

        // Icons
        iconSource,
        iconSize,
        iconColor,
        showLabels,

        // Display
        tableHeight,
        maxFilesPerRow,
        maxUnusedKeys,
        maxFlatKeys,
        fontSize,
        compactMode,

        // Behavior
        autoRunScanner,
        autoRunValidator,
        cacheResults,
        cacheTTL,
        confirmBeforeExport,
        highlightSearch
    };
}
