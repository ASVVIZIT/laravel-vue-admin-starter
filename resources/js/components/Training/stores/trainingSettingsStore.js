import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TrainingSettingsService } from '@/components/Training/services/TrainingSettingsService.js';
import { SETTINGS_DEFAULTS_CONFIG } from '@/components/Training/config/settingsDefaultsConfig.js';
import { deepClone } from '@/components/Training/utils/appSettingsHelpersUtils.js';

const service = new TrainingSettingsService();

export const useTrainingSettingsStore = defineStore('training-settings', () => {
    // Инициализация из единого источника дефолтов (DRY)
    const serverSettings = ref(deepClone({
        ...SETTINGS_DEFAULTS_CONFIG.display.server,
        ...SETTINGS_DEFAULTS_CONFIG.grouping.server,
        form_meta: deepClone(SETTINGS_DEFAULTS_CONFIG.meta)
    }));

    const frontendSettings = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.interface.frontend));

    const limits = ref(deepClone({
        ...SETTINGS_DEFAULTS_CONFIG.search.limits,
        ...SETTINGS_DEFAULTS_CONFIG.display.limits
    }));

    const columnsConfig = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.interface.columns));

    const groupingModes = ref({
        'mine': { mode: 'frontend', reason: 'Default' },
        'shared-with-me': { mode: 'frontend', reason: 'Default' },
        'shared-by-me': { mode: 'frontend', reason: 'Default' }
    });

    const loading = ref(false);
    const error = ref(null);
    const validationErrors = ref({});

    // ========================================================================
    // COMPUTED
    // ========================================================================

    const isGroupingToggleVisibleStore = computed(() => frontendSettings.value.show_grouping_toggle);

    const getGroupingModeForTabStore = (tab) => groupingModes.value[tab] || groupingModes.value['mine'];

    const isServerGroupingActiveStore = (tab) => getGroupingModeForTabStore(tab)?.mode === 'server';

    const getColumnsForTabStore = (tab) => columnsConfig.value[tab] || columnsConfig.value['mine'];

    // Снапшот всех настроек для панели отладки
    const settingsDebugSnapshot = computed(() => ({
        meta: serverSettings.value.form_meta || {},
        interface: {
            frontend: { ...frontendSettings.value },
            columns: { ...columnsConfig.value }
        },
        search: {
            limits: {
                search_min_length: limits.value.search_min_length,
                search_results_limit: limits.value.search_results_limit
            }
        },
        display: {
            server: {
                logs_per_page: serverSettings.value.logs_per_page,
                grouping_per_page: serverSettings.value.grouping_per_page,
                enable_stats: serverSettings.value.enable_stats,
                enable_sharing: serverSettings.value.enable_sharing
            },
            limits: {
                max_shared_with: limits.value.max_shared_with,
                max_sets: limits.value.max_sets,
                max_notes_length: limits.value.max_notes_length
            }
        },
        grouping: {
            server: {
                grouping_mode: serverSettings.value.grouping_mode,
                grouping_auto_threshold: serverSettings.value.grouping_auto_threshold,
                enable_min_groups_check: serverSettings.value.enable_min_groups_check,
                grouping_min_groups: serverSettings.value.grouping_min_groups,
                grouping_by: serverSettings.value.grouping_by
            }
        }
    }));

    // ========================================================================
    // ACTIONS
    // ========================================================================

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
                    // columns теперь вложенный объект, а не плоские ключи
                    const { columns, ...commonFrontend } = result.data.frontend;
                    frontendSettings.value = { ...frontendSettings.value, ...commonFrontend };
                }
                if (result.data.grouping) {
                    groupingModes.value[tab] = result.data.grouping;
                }
                if (result.data.columns) {
                    columnsConfig.value = { ...columnsConfig.value, ...result.data.columns };
                }
                if (result.data.limits) {
                    limits.value = { ...limits.value, ...result.data.limits };
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
                    ...SETTINGS_DEFAULTS_CONFIG.display.server,
                    ...SETTINGS_DEFAULTS_CONFIG.grouping.server,
                    form_meta: deepClone(SETTINGS_DEFAULTS_CONFIG.meta)
                },
                frontend: {
                    ...deepClone(SETTINGS_DEFAULTS_CONFIG.interface.frontend),
                    columns: deepClone(SETTINGS_DEFAULTS_CONFIG.interface.columns)
                },
                limits: {
                    ...SETTINGS_DEFAULTS_CONFIG.search.limits,
                    ...SETTINGS_DEFAULTS_CONFIG.display.limits
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
        serverSettings, frontendSettings, limits, columnsConfig, groupingModes, loading, error, validationErrors,
        isGroupingToggleVisibleStore, getGroupingModeForTabStore, isServerGroupingActiveStore, getColumnsForTabStore,
        settingsDebugSnapshot,
        fetchSettingsStore, updateSettingsStore, resetSettingsStore
    };
});

export default useTrainingSettingsStore;
