import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTableSettingsStore } from '@/store/tableSettingsStore';

export function useTableSettings() {
    const settingsStore = useTableSettingsStore();
    const { displaySettings, behaviorSettings } = storeToRefs(settingsStore);

    // Display
    const defaultPageSize = computed(() => displaySettings.value?.defaultPageSize || 20);
    const pageSizes = computed(() => displaySettings.value?.pageSizes || [5, 10, 20, 50, 100]);
    const compactMode = computed(() => displaySettings.value?.compactMode || false);
    const showRowIndex = computed(() => displaySettings.value?.showRowIndex || false);
    const stripeRows = computed(() => displaySettings.value?.stripeRows ?? true);
    const borderTable = computed(() => displaySettings.value?.borderTable || false);
    const highlightCurrentRow = computed(() => displaySettings.value?.highlightCurrentRow ?? true);
    const highlightHoverRow = computed(() => displaySettings.value?.highlightHoverRow ?? true);

    // Behavior
    const preserveFilters = computed(() => behaviorSettings.value?.preserveFilters ?? true);
    const preservePagination = computed(() => behaviorSettings.value?.preservePagination ?? true);
    const preserveSorting = computed(() => behaviorSettings.value?.preserveSorting ?? true);
    const autoSaveOnChange = computed(() => behaviorSettings.value?.autoSaveOnChange ?? true);
    const confirmBeforeClear = computed(() => behaviorSettings.value?.confirmBeforeClear || false);

    return {
        // Display
        defaultPageSize,
        pageSizes,
        compactMode,
        showRowIndex,
        stripeRows,
        borderTable,
        highlightCurrentRow,
        highlightHoverRow,
        // Behavior
        preserveFilters,
        preservePagination,
        preserveSorting,
        autoSaveOnChange,
        confirmBeforeClear,
        // Store methods
        updateSettings: settingsStore.updateSettings,
        resetSettings: settingsStore.resetSettings
    };
}
