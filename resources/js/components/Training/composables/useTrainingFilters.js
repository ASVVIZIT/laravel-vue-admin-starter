/**
 * ============================================================================
 * USE TRAINING FILTERS — КОМПОЗАБЛ УПРАВЛЕНИЯ ФИЛЬТРАМИ
 * ============================================================================
 */
import { ref, watch } from 'vue'

export const useTrainingFilters = (logStore) => {
    const date = ref(null)
    const range = ref([])
    const exerciseId = ref(null)
    const activeQuickDate = ref(null)
    const activeQuickRange = ref(null)
    const isSyncing = ref(false)

    // Взаимное исключение UI (не триггерит API)
    watch(date, (val) => {
        if (val && range.value?.length) range.value = []
    })
    watch(range, (val) => {
        if (val?.length === 2 && date.value) date.value = null
    })

    const init = () => {
        date.value = logStore.dateFilter
        range.value = [logStore.dateRange.from, logStore.dateRange.to].filter(Boolean)
        exerciseId.value = logStore.exerciseFilter || 'all'
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0]
        const tomorrow = new Date(Date.now() + 864e5).toISOString().split('T')[0]
        if (date.value === today) activeQuickDate.value = 'today'
        else if (date.value === yesterday) activeQuickDate.value = 'yesterday'
        else if (date.value === tomorrow) activeQuickDate.value = 'tomorrow'
    }

    const sync = async () => {
        if (isSyncing.value) return
        isSyncing.value = true
        try {
            await logStore.applyFilters({
                date: date.value,
                from: range.value?.[0] || null,
                to: range.value?.[1] || null,
                exercise_id: exerciseId.value === 'all' ? null : exerciseId.value
            })
        } finally {
            isSyncing.value = false
        }
    }

    const setQuickDate = async (id) => {
        activeQuickRange.value = null
        activeQuickDate.value = id
        const d = new Date(); d.setDate(d.getDate() + ({ today: 0, yesterday: -1, tomorrow: 1 }[id] || 0))
        date.value = d.toISOString().split('T')[0]
        range.value = []
        await sync()
    }

    const setQuickRange = async (type) => {
        activeQuickDate.value = null
        activeQuickRange.value = type
        const now = new Date(); let start = new Date()
        switch (type) {
            case 'week': start.setDate(now.getDate() - (now.getDay() || 7) + 1); break
            case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); break
            case 'quarter': { const q = Math.floor(now.getMonth() / 3); start = new Date(now.getFullYear(), q * 3, 1); break }
            case 'halfyear': { const h = now.getMonth() >= 6 ? 6 : 0; start = new Date(now.getFullYear(), h, 1); break }
        }
        const fmt = d => d.toISOString().split('T')[0]
        range.value = [fmt(start), fmt(now)]
        date.value = null
        await sync()
    }

    const clearAll = async () => {
        date.value = null; range.value = []; exerciseId.value = null
        activeQuickDate.value = null; activeQuickRange.value = null
        await logStore.clearFilters()
    }

    return { date, range, exerciseId, activeQuickDate, activeQuickRange, init, setQuickDate, setQuickRange, clearAll, sync }
}

export default useTrainingFilters
