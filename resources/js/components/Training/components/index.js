/**
 * ============================================================================
 * TRAINING COMPONENTS INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { default as TrainingLogSetRowForm } from './TrainingLogSetRowForm.vue';
export { default as TrainingStatsCard } from './TrainingStatsCard.vue';
export { default as TrainingLogForm } from './TrainingLogForm.vue';
export { default as TrainingLogTable } from './TrainingLogTable.vue';

export default {
    TrainingLogSetRowForm: () => import('./TrainingLogSetRowForm.vue'),
    TrainingStatsCard: () => import('./TrainingStatsCard.vue'),
    TrainingLogForm: () => import('./TrainingLogForm.vue'),
    TrainingLogTable: () => import('./TrainingLogTable.vue')
};
