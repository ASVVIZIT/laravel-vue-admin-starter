/**
 * ============================================================================
 * MONITORING COMPONENTS — ЭКСПОРТ МОНИТОРИНГА
 * ============================================================================
 */

export { default as PowerMonitoring } from './PowerMonitoring.vue';
export { default as PowerMonitoringCompact } from './PowerMonitoringCompact.vue';
export { default as VoltageIndicatorMonitoring } from './VoltageIndicatorMonitoring.vue';

export default {
    PowerMonitoring: () => import('./PowerMonitoring.vue'),
    PowerMonitoringCompact: () => import('./PowerMonitoringCompact.vue'),
    VoltageIndicatorMonitoring: () => import('./VoltageIndicatorMonitoring.vue')
};
