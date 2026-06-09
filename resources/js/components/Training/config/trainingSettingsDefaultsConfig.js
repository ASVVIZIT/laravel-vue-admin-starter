/**
 * ============================================================================
 * TRAINING SETTINGS DEFAULTS CONFIG — КОНФИГУРАЦИЯ ПО УМОЛЧАНИЮ
 * ============================================================================
 * 📁 Путь: @/components/Training/config/settingsDefaultsConfig.js
 * ✅ Отвечает исключительно за хранение дефолтных значений.
 * ============================================================================
 */

export const TRAINING_SETTINGS_DEFAULTS_CONFIG = {
    meta: {
        layout: 'horizontal',
        visible_tabs: ['interface', 'search', 'display', 'grouping'],
        tabs_order: ['interface', 'search', 'display', 'grouping'],
    },
    interface: {
        frontend: {
            default_tab: 'mine',
            show_grouping_toggle: true,
            filters_collapsed_mobile: true,
            compact_view: false,
        },
        columns: {
            'mine': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
            'shared-with-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: false },
            'shared-by-me': { date: true, time: true, exercise: true, sharing: true, sets: true, reps: true, volume: true, rating: true, actions: true },
        },
    },
    search: {
        limits: {
            search_min_length: 2,
            search_results_limit: 100,
        }
    },
    display: {
        server: {
            logs_per_page: 50,
            grouping_per_page: 10,
            enable_stats: true,
            enable_sharing: true,
        },
        limits: {
            max_shared_with: 100,
            max_sets: 50,
            max_notes_length: 1000,
        }
    },
    grouping: {
        server: {
            grouping_mode: 'auto',
            grouping_auto_threshold: 500,
            enable_min_groups_check: true,
            grouping_min_groups: 3,
            grouping_by: 'user',
        }
    }
}

export default TRAINING_SETTINGS_DEFAULTS_CONFIG
