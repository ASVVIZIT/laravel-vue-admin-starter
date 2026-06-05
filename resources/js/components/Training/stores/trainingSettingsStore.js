import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TrainingSettingsService } from '@/components/Training/services/TrainingSettingsService.js';

const service = new TrainingSettingsService();

export const useTrainingSettingsStore = defineStore('training-settings', () => {
    const serverSettings = ref({
        grouping_mode: 'auto',
        grouping_auto_threshold: 500,
        grouping_by: 'user',
        grouping_per_page: 10,
        logs_per_page: 50,
        enable_stats: true,
        enable_sharing: true,
        // 🔥 Новые настройки умной группировки
        enable_min_groups_check: true,
        grouping_min_groups: 3
    });

    const frontendSettings = ref({
        default_tab: 'mine',
        show_grouping_toggle: true,
        filters_collapsed_mobile: true,
        compact_view: false
    });

    const columnsConfig = ref({
        'mine': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
        'shared-with-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: false },
        'shared-by-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true }
    });

    const groupingModes = ref({
        'mine': { mode: 'frontend', reason: 'Default' },
        'shared-with-me': { mode: 'frontend', reason: 'Default' },
        'shared-by-me': { mode: 'frontend', reason: 'Default' }
    });

    const loading = ref(false);
    const error = ref(null);
    const validationErrors = ref({});

    const isGroupingToggleVisibleStore = computed(() => frontendSettings.value.show_grouping_toggle);
    const getGroupingModeForTabStore = (tab) => groupingModes.value[tab] || groupingModes.value['mine'];
    const isServerGroupingActiveStore = (tab) => getGroupingModeForTabStore(tab)?.mode === 'server';
    const getColumnsForTabStore = (tab) => columnsConfig.value[tab] || columnsConfig.value['mine'];

    const fetchSettingsStore = async (tab = 'mine') => {
        loading.value = true;
        error.value = null;
        validationErrors.value = {};

        try {
            const result = await service.getSettingsService(tab);

            if (result.success && result.data) {
                if (result.data.server) {
                    serverSettings.value = { ...serverSettings.value, ...result.data.server };
                }
                if (result.data.frontend) {
                    const { 'columns.mine': _1, 'columns.shared-with-me': _2, 'columns.shared-by-me': _3, ...commonFrontend } = result.data.frontend;
                    frontendSettings.value = { ...frontendSettings.value, ...commonFrontend };
                }
                if (result.data.grouping) {
                    groupingModes.value[tab] = result.data.grouping;
                }
                if (result.data.columns) {
                    columnsConfig.value = { ...columnsConfig.value, ...result.data.columns };
                }
            }
            return result;
        } catch (err) {
            error.value = 'Не удалось загрузить настройки';
            console.error('[trainingSettingsStore] Fetch error:', err);
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    };

    const updateSettingsStore = async (settings) => {
        loading.value = true;
        try {
            const result = await service.updateSettingsService(settings);
            if (result.success) {
                await fetchSettingsStore();
            } else {
                if (result.errors) validationErrors.value = result.errors;
                error.value = result.message || 'Ошибка сохранения';
            }
            return result;
        } catch (err) {
            error.value = 'Не удалось сохранить настройки';
            console.error('[trainingSettingsStore] Update error:', err);
            return { success: false, message: error.value };
        } finally {
            loading.value = false;
        }
    };

    const resetSettingsStore = async () => {
        loading.value = true;
        try {
            const defaultPayload = {
                server: {
                    grouping_mode: 'auto',
                    grouping_auto_threshold: 500,
                    grouping_by: 'user',
                    grouping_per_page: 10,
                    logs_per_page: 50,
                    enable_stats: true,
                    enable_sharing: true,
                    enable_min_groups_check: true,
                    grouping_min_groups: 3
                },
                frontend: {
                    default_tab: 'mine',
                    show_grouping_toggle: true,
                    filters_collapsed_mobile: true,
                    compact_view: false
                },
                columns: {
                    'mine': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
                    'shared-with-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: false },
                    'shared-by-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true }
                }
            };

            const result = await service.updateSettingsService(defaultPayload);

            if (result.success) {
                await fetchSettingsStore();
                return { success: true, message: 'Настройки сброшены' };
            }
            return { success: false, message: result.message || 'Ошибка сброса' };
        } catch (err) {
            console.error('[trainingSettingsStore] Reset error:', err);
            return { success: false, message: 'Не удалось сбросить настройки' };
        } finally {
            loading.value = false;
        }
    };

    return {
        serverSettings, frontendSettings, columnsConfig, groupingModes, loading, error, validationErrors,
        isGroupingToggleVisibleStore, getGroupingModeForTabStore, isServerGroupingActiveStore, getColumnsForTabStore,
        fetchSettingsStore, updateSettingsStore, resetSettingsStore
    };
});

export default useTrainingSettingsStore;
