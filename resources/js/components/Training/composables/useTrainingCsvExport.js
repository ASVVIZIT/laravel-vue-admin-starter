import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { TrainingExportResource } from '@/components/Training/api/core/resource/TrainingExportResource.js'

export function useTrainingCsvExport() {
    const logStore = useTrainingLogStore()
    const exportResource = new TrainingExportResource()
    const loading = ref(false)

    //  Проверяем протокол один раз
    const isHttps = window.location.protocol === 'https:'

    /**
     * Основная функция скачивания файла
     * Вызывается из любого компонента
     */
    const download = async () => {
        if (loading.value) return

        loading.value = true
        try {
            // Собираем фильтры из стора (единый источник правды)
            const filters = {
                tab: logStore.activeTab,
                date_from: logStore.currentFilters.from || undefined,
                date_to: logStore.currentFilters.to || undefined,
                exercise_id: logStore.currentFilters.exercise_id || undefined
            }

            if (isHttps) {
                await downloadViaBlob(filters)
            } else {
                await downloadViaDirectLink(filters)
            }

            ElMessage.success('Отчет успешно скачан')
        } catch (error) {
            console.error('[TrainingCsvExport] Error:', error)
            ElMessage.error('Ошибка при скачивании отчета')
        } finally {
            loading.value = false
        }
    }

    /**
     * Метод для HTTPS (через Blob/Axios)
     */
    const downloadViaBlob = async (filters) => {
        const result = await exportResource.getCsvExportResource(filters)

        if (!result.success) {
            throw new Error(result.error || 'Сервер вернул ошибку')
        }

        const url = window.URL.createObjectURL(result.blob)
        triggerDownload(url, result.fileName)
        window.URL.revokeObjectURL(url)
    }

    /**
     * Метод для HTTP (прямая ссылка, чтобы избежать blob:http предупреждений)
     */
    const downloadViaDirectLink = (filters) => {
        const queryParams = new URLSearchParams()
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                queryParams.append(key, filters[key])
            }
        })

        const directUrl = `/api/training/export/csv?${queryParams.toString()}`
        const fileName = `training_logs_${filters.tab || 'mine'}_${new Date().toISOString().slice(0, 10)}.csv`

        // 🔥 Используем <a download> вместо window.open()
        const link = document.createElement('a')
        link.href = directUrl
        link.download = fileName
        link.style.display = 'none' // Скрываем ссылку
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    /**
     * Утилита для создания ссылки и клика
     */
    const triggerDownload = (url, fileName) => {
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return {
        loading,
        download
    }
}
