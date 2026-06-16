import { ref } from 'vue'
import request from '@/utils/request'

export function useSiteSettingsLandingList() {
    const landings = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchLandings() {
        loading.value = true
        error.value = null
        try {
            const { data } = await request.get('/landing/pages/list')
            landings.value = Array.isArray(data) ? data : (data.data || [])
        } catch (e) {
            error.value = 'Не удалось загрузить список лендингов'
            console.error('[useSiteSettingsLandingList] fetchLandings:', e)
        } finally {
            loading.value = false
        }
    }

    return { landings, loading, error, fetchLandings }
}
