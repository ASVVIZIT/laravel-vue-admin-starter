import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable для обратного отсчёта до целевой даты
 *
 * @param {String|Date} targetDate - Целевая дата
 * @returns {Object} - { timeLeft, formattedDate, isExpired }
 *
 * @example
 * const { timeLeft, formattedDate } = useCountdown('2026-07-15')
 */
export function useCountdown(targetDate) {
    const target = new Date(targetDate)
    const now = ref(new Date())
    let timer = null

    const timeLeft = computed(() => {
        const diff = target - now.value
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            total: diff
        }
    })

    const formattedDate = computed(() => {
        return target.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    })

    const isExpired = computed(() => timeLeft.value.total <= 0)

    onMounted(() => {
        timer = setInterval(() => {
            now.value = new Date()
        }, 1000)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    return { timeLeft, formattedDate, isExpired }
}
