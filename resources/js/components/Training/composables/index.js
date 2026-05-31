/**
 * ============================================================================
 * TRAINING COMPOSABLES INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { useExerciseFields } from './useExerciseFields.js';
export { useTrainingForm } from './useTrainingForm.js';

export default {
    useExerciseFields: () => import('./useExerciseFields.js'),
    useTrainingForm: () => import('./useTrainingForm.js')
};
