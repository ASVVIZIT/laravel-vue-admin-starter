/**
 * ============================================================================
 * TRAINING RESOURCE INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { TrainingBaseResource } from './TrainingBaseResource.js'
export { TrainingExerciseResource } from './TrainingExerciseResource.js'
export { TrainingLogResource } from './TrainingLogResource.js'

export default {
    TrainingBaseResource: () => import('./TrainingBaseResource.js'),
    TrainingExerciseResource: () => import('./TrainingExerciseResource.js'),
    TrainingLogResource: () => import('./TrainingLogResource.js')
}
