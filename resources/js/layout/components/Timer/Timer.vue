<template>
    <div class="app-timer">
        <h2>{{ title }}</h2>
        <div class="timer">{{ formattedTime }}</div>
        <div class="controls">
            <button @click="startTimer" :disabled="isRunning">Start Slacking</button>
            <button @click="pauseTimer" :disabled="!isRunning">Pause (As If You Need It)</button>
            <button @click="resetTimer">Back to "Work"</button>
        </div>
        <div class="achievement" v-if="currentAchievement">
            <p>Achievement Unlocked: {{ currentAchievement }}</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
    name: 'Timer',
    setup() {
        const title = ref('Timer: Because Productivity is Overrated')
        const time = ref(0)
        const isRunning = ref(false)
        const interval = ref(null)
        const currentAchievement = ref('')

        const achievements = [
            { time: 10, message: "Coffee Break Master" },
            { time: 900, message: "Social Media Guru" },
            { time: 1800, message: "Netflix Episode Completionist" },
            { time: 3600, message: "Professional Time Waster" }
        ]

        const formattedTime = computed(() => {
            const hours = Math.floor(time.value / 3600)
            const minutes = Math.floor((time.value % 3600) / 60)
            const seconds = time.value % 60
            return `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })

        const startTimer = () => {
            if (!isRunning.value) {
                isRunning.value = true
                interval.value = setInterval(() => {
                    time.value++
                }, 1000)
            }
        }

        const pauseTimer = () => {
            clearInterval(interval.value)
            isRunning.value = false
        }

        const resetTimer = () => {
            pauseTimer()
            time.value = 0
            currentAchievement.value = ''
        }

        watch(time, (newValue) => {
            const achievement = achievements.find(a => a.time === newValue)
            if (achievement) {
                currentAchievement.value = achievement.message
            }
        })

        return {
            title,
            formattedTime,
            isRunning,
            currentAchievement,
            startTimer,
            pauseTimer,
            resetTimer
        }
    }
}
</script>

<style scoped>
.app-timer {
    text-align: center;
    font-family: 'Comic Sans MS', cursive; /* Because we're serious about not being serious */
}

.timer {
    font-size: 2em;
    margin: 20px 0;
}

.controls button {
    margin: 0 10px;
    padding: 10px 20px;
    font-size: 1em;
    background-color: #f0f0f0;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.controls button:hover {
    background-color: #e0e0e0;
}

.achievement {
    margin-top: 20px;
    font-style: italic;
    color: #4a4a4a;
}
</style>
