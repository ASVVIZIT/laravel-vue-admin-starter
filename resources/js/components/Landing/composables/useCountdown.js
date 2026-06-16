/**
 * Composable для обратного отсчёта
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useCountdown(targetDate) {
    const target = new Date(targetDate)
    const now = ref(new Date())
    let timer = null

    const timeLeft = computed(() => {
        const diff = target - now.value
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        }
    })

    const formattedDate = computed(() =>
        target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    )

    onMounted(() => {
        timer = setInterval(() => { now.value = new Date() }, 1000)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
    })

    return { timeLeft, formattedDate }
}
