/**
 * ============================================================================
 * TRAINING COMPOSABLES INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { useExerciseFields } from './useExerciseFields.js';
export { useTrainingFilters } from './useTrainingFilters.js';
export { useTrainingForm } from './useTrainingForm.js';
export { useTypeChangeGuard, TYPE_CHANGE_STATE } from './useTypeChangeGuard.js';

export default {
    useExerciseFields: () => import('./useExerciseFields.js'),
    useTrainingFilters: () => import('./useTrainingFilters.js'),
    useTrainingForm: () => import('./useTrainingForm.js'),
    useTypeChangeGuard: () => import('./useTypeChangeGuard.js')
};
