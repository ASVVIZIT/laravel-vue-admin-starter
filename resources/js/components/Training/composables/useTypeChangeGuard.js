import { ref, computed, watch } from 'vue'
import { useExerciseFields } from './useExerciseFields.js'

export const useTypeChangeGuard = (form, exerciseType, exerciseStore, options = {}) => {
    const { undoTimeout = 20 } = options

    const frozenSets = ref([])
    const frozenType = ref(null)
    const frozenExerciseId = ref(null)
    const frozenExerciseName = ref(null)
    const originalData = ref(null)
    const undoTimeLeft = ref(0)
    let timer = null

    const state = computed(() => frozenSets.value.length > 0 ? (undoTimeLeft.value > 0 ? 'pending' : 'expired') : 'normal')
    const canUndo = computed(() => frozenSets.value.length > 0)
    const hasFrozenData = computed(() => frozenSets.value.length > 0)

    const clearTimer = () => { if (timer) clearInterval(timer) }
    const pauseTimer = () => clearTimer()
    const resumeTimer = () => { if (canUndo.value && undoTimeLeft.value > 0) startTimer() }

    const startTimer = () => {
        clearTimer()
        undoTimeLeft.value = undoTimeout
        timer = setInterval(() => {
            undoTimeLeft.value--
            if (undoTimeLeft.value <= 0) clearTimer()
        }, 1000)
    }

    const freeze = (oldId, oldName, newType) => {
        const f = form.value ?? form
        const hasData = f.sets.some(s => s.reps || s.weight || s.duration || s.distance || s.notes?.trim())
        if (!hasData) {
            f.sets = [{ ...useExerciseFields(newType).defaultSet }]
            return
        }
        frozenSets.value = f.sets.map(s => ({ ...s }))
        frozenType.value = exerciseType.value
        frozenExerciseId.value = oldId
        frozenExerciseName.value = oldName
        f.sets = [{ ...useExerciseFields(newType).defaultSet }]
        startTimer()
    }

    // 🔥 ЧИСТЫЙ WATCH без блокировок
    watch(() => (form.value ?? form).exercise_id, (newId, oldId) => {
        if (!newId || newId === oldId) return
        const list = exerciseStore.exercises?.value || exerciseStore.exercises || []
        if (!list.length) return
        const old = list.find(e => String(e.id) === String(oldId))
        const curr = list.find(e => String(e.id) === String(newId))
        if (old?.type !== curr?.type) freeze(oldId, old?.name, curr?.type)
    })

    return {
        state, canUndo, hasFrozenData, undoTimeLeft,
        frozenSets, frozenType, frozenExerciseId, frozenExerciseName, originalData,
        pauseTimer, resumeTimer,
        undoTypeChange: () => {
            if (!canUndo.value) return
            const f = form.value ?? form
            f.exercise_id = frozenExerciseId.value
            f.sets = frozenSets.value.map(s => ({ ...s }))
            reset()
        },
        resetToOriginal: () => { reset(); return originalData.value ? { ...originalData.value } : null },
        confirmTypeChange: reset,
        setOriginalData: (d) => { originalData.value = d ? { ...d } : null },
        reset: () => { clearTimer(); frozenSets.value = []; frozenType.value = null; frozenExerciseId.value = null; frozenExerciseName.value = null; undoTimeLeft.value = 0 },
        dispose: clearTimer
    }
}
