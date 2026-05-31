/**
 * ============================================================================
 * TRAINING COMPONENTS INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { default as SetRow } from './SetRow.vue';
export { default as StatsCard } from './StatsCard.vue';
export { default as TrainingLogForm } from './TrainingLogForm.vue';
export { default as TrainingLogTable } from './TrainingLogTable.vue';

export default {
    SetRow: () => import('./SetRow.vue'),
    StatsCard: () => import('./StatsCard.vue'),
    TrainingLogForm: () => import('./TrainingLogForm.vue'),
    TrainingLogTable: () => import('./TrainingLogTable.vue')
};
