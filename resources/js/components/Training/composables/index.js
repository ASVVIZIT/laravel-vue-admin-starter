/**
 * ============================================================================
 * TRAINING COMPOSABLES INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { useExerciseFields } from './useExerciseFields.js';
export { useTrainingFilters } from './useTrainingFilters.js';
export { useTrainingForm } from './useTrainingForm.js';

export default {
    useExerciseFields: () => import('./useExerciseFields.js'),
    useTrainingFilters: () => import('./useTrainingFilters.js'),
    useTrainingForm: () => import('./useTrainingForm.js')
};
