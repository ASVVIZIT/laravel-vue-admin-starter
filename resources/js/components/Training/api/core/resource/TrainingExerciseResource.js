/**
 * ============================================================================
 * EXERCISE RESOURCE — СПРАВОЧНИК УПРАЖНЕНИЙ
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingExerciseResource.js
 * ✅ Эндпоинт: GET /api/training/exercises
 * ============================================================================
 */

import { TrainingBaseResource } from './TrainingBaseResource.js'
// ✅ Исправленный импорт
import { logDebugUtils } from '../utils/coreApiLoggerUtils.js'

export class TrainingExerciseResource extends TrainingBaseResource {
    constructor() {
        super('/training')
    }

    async getListResource() {
        logDebugUtils('TrainingExerciseResource', 'getListResource')
        return this.getBase('/exercises')
    }
}

export default TrainingExerciseResource
