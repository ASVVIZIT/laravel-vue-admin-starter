/**
 * ============================================================================
 * TRAINING COMPOSABLES INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { useTrainingCsvExport } from './useTrainingCsvExport.js';
export { useTrainingExerciseFields } from './useTrainingExerciseFields.js';
export { useTrainingLogFilters } from './useTrainingLogFilters.js';
export { useTrainingLogForm } from './useTrainingLogForm.js';
export { useTrainingSetValidation } from './useTrainingSetValidation.js';
export { useTrainingTypeChangeGuard } from './useTrainingTypeChangeGuard.js';

export default {
    useTrainingCsvExport: () => import('./useTrainingCsvExport.js'),
    useTrainingExerciseFields: () => import('./useTrainingExerciseFields.js'),
    useTrainingLogFilters: () => import('./useTrainingLogFilters.js'),
    useTrainingLogForm: () => import('./useTrainingLogForm.js'),
    useTrainingSetValidation: () => import('./useTrainingSetValidation.js'),
    useTrainingTypeChangeGuard: () => import('./useTrainingTypeChangeGuard.js')
};
