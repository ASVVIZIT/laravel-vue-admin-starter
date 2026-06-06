import { ref, computed, watch } from 'vue'
import { useExerciseFields } from './useExerciseFields.js'

/**
 * Состояния защиты от потери данных при смене типа
 */
export const TYPE_CHANGE_STATE = {
    NORMAL: 'normal',     // Обычный режим
    PENDING: 'pending',   // Есть замороженные данные, таймер идёт
    EXPIRED: 'expired'    // Таймер истёк, но данные ещё можно вернуть
}

/**
 * Composable для защиты данных при смене типа упражнения
 *
 * @param {Ref} form - ссылка на форму из useTrainingForm
 * @param {Ref} exerciseType - реактивный тип упражнения
 * @param {Object} exerciseStore - стор упражнений
 * @param {Object} options - настройки
 * @param {number} options.undoTimeout - время таймера в секундах (по умолчанию 20)
 *
 * @returns {Object} методы и состояние
 */
export const useTypeChangeGuard = (form, exerciseType, exerciseStore, options = {}) => {
    const { undoTimeout = 20 } = options

    // ============================================================================
    // СОСТОЯНИЕ
    // ============================================================================
    const state = ref(TYPE_CHANGE_STATE.NORMAL)
    const frozenSets = ref([])
    const frozenType = ref(null)
    const frozenExerciseId = ref(null)
    const originalData = ref(null)
    const undoTimeLeft = ref(0)

    let undoTimer = null
    let isProcessing = false  // Защита от рекурсии в watch

    // ============================================================================
    // COMPUTED
    // ============================================================================
    const canUndo = computed(() =>
        state.value === TYPE_CHANGE_STATE.PENDING ||
        state.value === TYPE_CHANGE_STATE.EXPIRED
    )

    const hasFrozenData = computed(() => frozenSets.value.length > 0)

    // ============================================================================
    // ТАЙМЕР
    // ============================================================================
    const clearTimer = () => {
        if (undoTimer) {
            clearInterval(undoTimer)
            undoTimer = null
        }
    }

    const startTimer = () => {
        clearTimer()
        state.value = TYPE_CHANGE_STATE.PENDING
        undoTimeLeft.value = undoTimeout

        undoTimer = setInterval(() => {
            undoTimeLeft.value--
            if (undoTimeLeft.value <= 0) {
                clearTimer()
                state.value = TYPE_CHANGE_STATE.EXPIRED
            }
        }, 1000)
    }

    // ============================================================================
    // ОСНОВНЫЕ МЕТОДЫ
    // ============================================================================

    /**
     * Вызывается при смене типа упражнения
     * Замораживает текущие данные и создаёт одну пустую строку нового типа
     */
    const freezeAndApplyNewType = (newType, oldExerciseId) => {
        if (isProcessing) return

        // Проверяем есть ли данные для заморозки
        const hadData = form.value.sets.some(s =>
            s.reps || s.weight || s.duration || s.distance || (s.notes && s.notes.trim())
        )

        if (!hadData) {
            // Пустая форма — просто создаём одну строку нового типа
            form.value.sets = [createEmptySet(newType)]
            return
        }

        isProcessing = true

        // Замораживаем текущие данные
        frozenSets.value = JSON.parse(JSON.stringify(form.value.sets))
        frozenType.value = exerciseType.value
        frozenExerciseId.value = oldExerciseId

        // Создаём одну пустую строку нового типа
        form.value.sets = [createEmptySet(newType)]

        // Запускаем таймер
        startTimer()

        isProcessing = false
    }

    /**
     * Откат к предыдущему типу
     */
    const undoTypeChange = () => {
        if (!canUndo.value || !frozenExerciseId.value) return

        isProcessing = true

        // Восстанавливаем упражнение
        form.value.exercise_id = frozenExerciseId.value

        // Восстанавливаем подходы из замороженных
        form.value.sets = JSON.parse(JSON.stringify(frozenSets.value))

        // Сбрасываем состояние
        resetState()

        isProcessing = false
    }

    /**
     * Сброс к исходным данным из БД
     */
    const resetToOriginal = () => {
        if (!originalData.value) return
        // Возвращаемся к исходным данным
        // Фактическая загрузка происходит в форме через loadFormData
        resetState()
        return originalData.value
    }

    /**
     * Подтверждение сохранения — очищает замороженные данные
     */
    const confirmTypeChange = () => {
        resetState()
    }

    /**
     * Сброс состояния заморозки
     */
    const resetState = () => {
        clearTimer()
        state.value = TYPE_CHANGE_STATE.NORMAL
        frozenSets.value = []
        frozenType.value = null
        frozenExerciseId.value = null
        undoTimeLeft.value = 0
    }

    /**
     * Установка исходных данных (вызывается при загрузке формы)
     */
    const setOriginalData = (data) => {
        originalData.value = data ? JSON.parse(JSON.stringify(data)) : null
    }

    // ============================================================================
    // WATCH: СЛЕДИМ ЗА СМЕНОЙ ТИПА
    // ============================================================================
    watch(exerciseType, (newType, oldType) => {
        if (isProcessing) return
        if (!newType || !oldType || newType === oldType) return

        // Находим ID старого упражнения
        const oldExercise = exerciseStore.exercises.find(e => e.type === oldType)
        const oldId = oldExercise?.id || frozenExerciseId.value

        freezeAndApplyNewType(newType, oldId)
    })

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ
    // ============================================================================
    const createEmptySet = (type) => {
        const { defaultSet } = useExerciseFields(type || 'bodyweight')
        return { ...defaultSet }
    }

    // ============================================================================
    // ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ
    // ============================================================================
    const dispose = () => {
        clearTimer()
    }

    return {
        // Состояние
        state,
        frozenSets,
        frozenType,
        frozenExerciseId,
        originalData,
        undoTimeLeft,

        // Computed
        canUndo,
        hasFrozenData,

        // Методы
        freezeAndApplyNewType,
        undoTypeChange,
        resetToOriginal,
        confirmTypeChange,
        resetState,
        setOriginalData,
        dispose
    }
}

export default useTypeChangeGuard
