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
    <h3>Настройки панелей</h3>
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
  padding: 2px;
  margin-bottom: 2px;
  background-color: #f8f9fa;
  border-radius: 2px;

  h3 {
    margin-top: 2px;
    margin-bottom: 2px;
    color: #303133;
    width: 100%;
    text-align: center;
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
        margin-left: 2px;
        margin-right: 2px;
        width: 10px;
        height: 10px;
        accent-color: rgba(47, 83, 164, 0.89);
      }
    }
  }
}
</style>
