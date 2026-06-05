/**
 * ============================================================================
 * TRAINING RESOURCE INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export { TrainingBaseResource } from './TrainingBaseResource.js'
export { TrainingExerciseResource } from './TrainingExerciseResource.js'
export { TrainingLogResource } from './TrainingLogResource.js'
export { TrainingSettingsResource } from './TrainingSettingsResource.js'
export { TrainingUserResource } from './TrainingUserResource.js'

export default {
    TrainingBaseResource: () => import('./TrainingBaseResource.js'),
    TrainingExerciseResource: () => import('./TrainingExerciseResource.js'),
    TrainingLogResource: () => import('./TrainingLogResource.js'),
    TrainingSettingsResource: () => import('./TrainingSettingsResource.js'),
    TrainingUserResource: () => import('./TrainingUserResource.js')
}
