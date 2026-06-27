import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js';

export function useI18nSettings() {
    const settingsStore = useI18nSettingsStore();

    const {
        iconsSettings,
        displaySettings,
        behaviorSettings,
        metaSettings
    } = storeToRefs(settingsStore);

    const icons = computed(() => iconsSettings.value);
    const display = computed(() => displaySettings.value);
    const behavior = computed(() => behaviorSettings.value);
    const meta = computed(() => metaSettings.value);

    // Icons
    const iconSource = computed(() => iconsSettings.value?.source || 'bootstrap');
    const iconSize = computed(() => iconsSettings.value?.size || 20);
    const iconColor = computed(() => iconsSettings.value?.color || 'currentColor');
    const showLabels = computed(() => iconsSettings.value?.showLabels ?? true);
    const useGradients = computed(() => iconsSettings.value?.useGradients ?? false);

    // Display
    const tableHeight = computed(() => displaySettings.value?.tableHeight || 350);
    const maxFilesPerRow = computed(() => displaySettings.value?.maxFilesPerRow || 3);
    const maxUnusedKeys = computed(() => displaySettings.value?.maxUnusedKeys || 500);
    const maxFlatKeys = computed(() => displaySettings.value?.maxFlatKeys || 200);
    const fontSize = computed(() => displaySettings.value?.fontSize || 13);
    const compactMode = computed(() => displaySettings.value?.compactMode || false);

    // Behavior
    const autoRunScanner = computed(() => behaviorSettings.value?.autoRunScanner || false);
    const autoRunValidator = computed(() => behaviorSettings.value?.autoRunValidator || false);
    const cacheResults = computed(() => behaviorSettings.value?.cacheResults ?? true);
    const cacheTTL = computed(() => behaviorSettings.value?.cacheTTL || 300);
    const confirmBeforeExport = computed(() => behaviorSettings.value?.confirmBeforeExport ?? true);
    const highlightSearch = computed(() => behaviorSettings.value?.highlightSearch ?? true);
    const highlightColor = computed(() => behaviorSettings.value?.highlightColor || '#fff3b0'); // 🔥 НОВОЕ

    return {
        icons, display, behavior, meta,
        iconSource, iconSize, iconColor, showLabels, useGradients,
        tableHeight, maxFilesPerRow, maxUnusedKeys, maxFlatKeys, fontSize, compactMode,
        autoRunScanner, autoRunValidator, cacheResults, cacheTTL, confirmBeforeExport,
        highlightSearch, highlightColor
    };
}
