/**
 * Store для управления лендингами
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { landingApi } from '@/api/landingApi'

export const useLandingStore = defineStore('landing', () => {
    const landings = ref([])
    const currentLanding = ref(null)
    const loading = ref(false)

    async function fetchLandings() {
        loading.value = true
        try {
            const response = await landingApi.getList()
            landings.value = response.data || response
        } catch (error) {
            console.error('Ошибка загрузки лендингов:', error)
        } finally {
            loading.value = false
        }
    }

    async function fetchLanding(id) {
        loading.value = true
        try {
            const response = await landingApi.getById(id)
            currentLanding.value = response.data || response
        } catch (error) {
            console.error('Ошибка загрузки лендинга:', error)
        } finally {
            loading.value = false
        }
    }

    async function createLanding(data) {
        const response = await landingApi.create(data)
        await fetchLandings()
        return response.data || response
    }

    async function updateLanding(id, data) {
        const response = await landingApi.update(id, data)
        await fetchLandings()
        return response.data || response
    }

    async function deleteLanding(id) {
        await landingApi.delete(id)
        await fetchLandings()
    }

    async function togglePublish(id) {
        await landingApi.publish(id)
        await fetchLandings()
    }

    return {
        landings,
        currentLanding,
        loading,
        fetchLandings,
        fetchLanding,
        createLanding,
        updateLanding,
        deleteLanding,
        togglePublish
    }
})
