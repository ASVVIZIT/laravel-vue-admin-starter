/**
 * ============================================================================
 * I18N SETTINGS DEFAULTS CONFIG — КОНФИГУРАЦИЯ ПО УМОЛЧАНИЮ
 * ============================================================================
 */
export const I18N_SETTINGS_DEFAULTS_CONFIG = {
    meta: {
        layout: 'horizontal',
        visible_tabs: ['icons', 'display', 'behavior'],
        tabs_order: ['icons', 'display', 'behavior'],
    },
    icons: {
        source: 'bootstrap',
        size: 20,
        color: 'currentColor',
        showLabels: true,
        useGradients: false,
    },
    display: {
        tableHeight: 350,
        fontSize: 13,
        maxFilesPerRow: 3,
        maxUnusedKeys: 500,
        maxFlatKeys: 200,
        compactMode: false,
    },
    behavior: {
        autoRunScanner: false,
        autoRunValidator: false,
        cacheResults: true,
        cacheTTL: 300,
        confirmBeforeExport: true,
        highlightSearch: true,
        highlightColor: '#fff3b0',
    },
}

export default I18N_SETTINGS_DEFAULTS_CONFIG
