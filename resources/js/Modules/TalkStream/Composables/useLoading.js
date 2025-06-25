// composables/useLoading.js
import { ref } from 'vue'
import logger from '@/modules/TalkStream/utils/logger' // ✅ Импорт добавлен

const loadingStates = {}
const errorStates = {}

export function useLoading(key = 'global') {
    if (!loadingStates[key]) {
        loadingStates[key] = ref(false)
        errorStates[key] = ref(null)
        logger.debug(`Создана новая зона загрузки: ${key}`) // ✅ Логируем создание
    }

    const isLoading = loadingStates[key]

    const setLoading = (value) => {
        logger.info(`Установлено состояние для ${key}: ${value ? 'включено' : 'выключено'}`)
        isLoading.value = value
        if (!value) errorStates[key].value = null
    }

    const withLoading = async (promiseFn) => {
        try {
            setLoading(true)
            logger.info(`Загрузка начата для ${key}`)
            return await promiseFn()
        } catch (err) {
            logger.error(`Ошибка загрузки в зоне ${key}`, err)
            errorStates[key].value = err
            throw err
        } finally {
            setLoading(false)
            logger.info(`Загрузка завершена для ${key}`)
        }
    }

    return {
        isLoading,
        error: computed(() => errorStates[key].value),
        setLoading,
        withLoading
    }
}

export function getLoadingState(key = 'global') {
    const state = loadingStates[key]?.value ?? false
    logger.debug(`Получено состояние для ${key}: ${state ? 'в процессе' : 'остановлено'}`)
    return state
}
