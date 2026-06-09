/**
 * ============================================================================
 * TRAINING COMPOSABLES INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { useTrainingExerciseFields } from './useTrainingExerciseFields.js';
export { useTrainingLogFilters } from './useTrainingLogFilters.js';
export { useTrainingLogForm } from './useTrainingLogForm.js';
export { useTrainingTypeChangeGuard, TYPE_CHANGE_STATE } from './useTrainingTypeChangeGuard.js';

export default {
    useTrainingExerciseFields: () => import('./useTrainingExerciseFields.js'),
    useTrainingLogFilters: () => import('./useTrainingLogFilters.js'),
    useTrainingLogForm: () => import('./useTrainingLogForm.js'),
    useTrainingTypeChangeGuard: () => import('./useTrainingTypeChangeGuard.js')
};
