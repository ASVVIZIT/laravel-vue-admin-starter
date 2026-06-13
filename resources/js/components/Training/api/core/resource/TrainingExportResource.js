/**
 * ============================================================================
 * TRAINING EXPORT RESOURCE — РЕСУРС ДЛЯ ЭКСПОРТА ОТЧЕТОВ
 * ============================================================================
 * 📁 Путь: @/components/Training/api/core/resource/TrainingExportResource.js
 * ✅ Назначение: Потоковая выгрузка CSV/отчетов с сервера
 * ============================================================================
 */
import { TrainingBaseResource } from './TrainingBaseResource.js'
import { logDebugUtils, logErrorUtils } from '../utils/coreApiLoggerUtils.js'

export class TrainingExportResource extends TrainingBaseResource {
    constructor() {
        super('/training')
    }

    /**
     * Запрашивает CSV-файл с бэкенда
     *
     * @param {Object} filters - фильтры (tab, date_from, date_to, exercise_id)
     * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
     */
    async getCsvExportResource(filters = {}) {
        try {
            logDebugUtils('TrainingExportResource', 'getCsvExportResource', { filters })

            // 🔥 Используем метод getBlobBase из базового класса
            // request.js автоматически возвращает { blob, headers, status, statusText }
            const result = await this.getBlobBase('/export/csv', filters, {
                'Accept': 'text/csv'
            })

            const blob = result.blob
            const headers = result.headers || {}

            // Извлекаем имя файла из заголовка Content-Disposition
            const disposition = headers['content-disposition'] || ''
            let fileName = `training_logs_${filters.tab || 'mine'}_${new Date().toISOString().slice(0, 10)}.csv`

            const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?([^;\n]+)|filename="?([^";\n]+)"?/)
            if (fileNameMatch) {
                fileName = decodeURIComponent(fileNameMatch[1] || fileNameMatch[2])
            }

            logDebugUtils('TrainingExportResource', 'CSV received successfully', {
                fileName,
                size: blob?.size
            })

            return {
                success: true,
                blob,
                fileName
            }
        } catch (error) {
            logErrorUtils('TrainingExportResource', 'Export failed', error)

            // Если бэкенд вернул ошибку (например, 422 валидация), она будет в blob
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text()
                    return { success: false, error: text || 'Ошибка экспорта' }
                } catch {
                    return { success: false, error: 'Не удалось прочитать ошибку сервера' }
                }
            }

            return { success: false, error: error.message || 'Ошибка экспорта' }
        }
    }
}

export default TrainingExportResource
