import { ref } from 'vue'
import request from '@/utils/request'

export function useSiteSettingsMode() {
    const currentMode = ref('maintenance')
    const activeLandingId = ref(null)
    const isSaving = ref(false)
    const error = ref(null)

    const fetchCurrentSettings = async () => {
        try {
            const response = await request.get('/landing/settings/public-mode')
            const data = response.data || response

            currentMode.value = data.mode || 'maintenance'
            activeLandingId.value = data.active_landing_id || null
        } catch (err) {
            console.error('[useSiteSettingsMode] Ошибка загрузки настроек:', err)
            error.value = 'Не удалось загрузить текущие настройки'
        }
    }

    const updateMode = async (mode, landingId = null) => {
        isSaving.value = true
        error.value = null

        try {
            await request.post('/landing/settings/public-mode', {
                mode: mode,
                active_landing_id: landingId
            })

            currentMode.value = mode
            if (landingId !== null) {
                activeLandingId.value = landingId
            }
        } catch (err) {
            console.error('[useSiteSettingsMode] Ошибка сохранения режима:', err)
            error.value = err.response?.data?.message || 'Не удалось сохранить настройки'
            throw err // Пробрасываем ошибку выше, чтобы компонент мог показать уведомление
        } finally {
            isSaving.value = false
        }
    }

    return {
        currentMode,
        activeLandingId,
        isSaving,
        error,
        fetchCurrentSettings,
        updateMode
    }
}
