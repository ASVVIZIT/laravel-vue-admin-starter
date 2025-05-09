<script setup>
import { useAccordionStore } from '@/store/accordionStore'

const store = useAccordionStore()
const modes = [
    { value: 'single', label: 'Только одна панель' },
    { value: 'multiple', label: 'Несколько панелей' },
    { value: 'all', label: 'Все открыты' },
    { value: 'none', label: 'Все закрыты' }
]

const handleModeChange = (mode) => {
    console.log('Обработчик изменения режима:', mode)
    store.setMode(mode)
}

</script>

<template>
    <div class="settings-panel">
        <h2>Настройки аккордеона</h2>
        <div class="mode-selector">
            <label v-for="mode in modes" :key="mode.value">
                <input
                    type="radio"
                    :value="mode.value"
                    :checked="store.accordionMode === mode.value"
                    @change="handleModeChange(mode.value)"
                />
                {{ mode.label }}
            </label>
        </div>
    </div>
</template>

<style lang="scss">
.settings-panel {
    padding: 5px;
    margin-bottom: 10px;
    background-color: #f8f9fa;
    border-radius: 2px;

    h2 {
        margin-bottom: 3px;
        color: #303133;
    }

    .mode-selector {
        display: flex;
        flex-direction: column;
        gap: 1px;

        label {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 2px;
            border-radius: 2px;
            transition: background-color 0.7s;

            &:hover {
                background-color: #ebeef5;
            }

            input[type="radio"] {
                margin-right: 4px;
                width: 16px;
                height: 16px;
                accent-color: #409eff;
            }
        }
    }
}
</style>
