<!-- resources/js/components/DynamicTable/TemplateBuilder/TablePreview/TestModePreviewControls.vue -->
<template>
  <div class="test-mode-preview-controls">
    <el-radio-group v-model="localTestMode" size="small" @change="onTestModeChange">
      <el-radio-button label="auto">Авто</el-radio-button>
      <el-radio-button label="manual">Ручной</el-radio-button>
    </el-radio-group>
    <el-button
        v-if="localTestMode === 'manual'"
        @click="resetTestMode"
        size="small"
        type="warning"
        style="margin-left: 10px;"
    >
      Сбросить тестовые данные
    </el-button>
  </div>
</template>

<script setup>
/**
 * @component TestModePreviewControls
 *
 * Компонент управления тестовым режимом предпросмотра.
 * Позволяет переключаться между автоматическим и ручным режимами тестирования.
 *
 * @props {string} testMode - Текущий режим тестирования ('auto' | 'manual')
 *
 * @emits {Event} test-mode-change - Событие изменения режима тестирования
 * @param {string} mode - Новый режим тестирования ('auto' | 'manual')
 * @emits {Event} reset-test-mode - Событие сброса тестовых данных
 */
import { ref, watch } from 'vue';
import { ElMessage, ElIcon, ElAlert } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { usePreviewStore } from '../../stores/previewStore';

const props = defineProps({
  /**
   * Текущий режим тестирования
   * @type {string}
   */
  testMode: {
    type: String,
    default: 'auto'
  }
});

const emit = defineEmits([
  /**
   * Событие изменения режима тестирования
   * @param {string} mode - Новый режим тестирования ('auto' | 'manual')
   */
  'test-mode-change',
  /**
   * Событие сброса тестовых данных
   */
  'reset-test-mode'
]);

// === Состояния ===
const previewStore = usePreviewStore();
const localTestMode = ref(props.testMode);
const showTestControls = ref(true);

// === Методы ===
const onTestModeChange = (newMode) => {
  console.log(`[TestModePreviewControls.onTestModeChange] Mode changed to: ${newMode}`);
  previewStore.setTestMode(newMode);
  localTestMode.value = newMode;
  emit('test-mode-change', newMode);
  console.log(`[TestModePreviewControls.onTestModeChange] FINISHED`);
};

const resetTestMode = () => {
  console.log(`[TestModePreviewControls.resetTestMode] Resetting manual test data`);
  previewStore.resetManualTestData();
  emit('reset-test-mode');
  ElMessage.success('Тестовые данные сброшены');
  console.log(`[TestModePreviewControls.resetTestMode] FINISHED`);
};

// === Watchers ===
watch(() => props.testMode, (newMode) => {
  console.log(`[TestModePreviewControls.watch.props.testMode] Mode changed from ${localTestMode.value} to ${newMode}`);
  localTestMode.value = newMode;
  console.log(`[TestModePreviewControls.watch.props.testMode] localTestMode.value SET to ${newMode}`);
  console.log(`[TestModePreviewControls.watch.props.testMode] FINISHED`);
});

watch(() => previewStore.testMode, (newMode) => {
  console.log(`[TestModePreviewControls.watch.previewStore.testMode] Store mode changed to: ${newMode}`);
  localTestMode.value = newMode;
  console.log(`[TestModePreviewControls.watch.previewStore.testMode] localTestMode.value SET to ${newMode}`);
  console.log(`[TestModePreviewControls.watch.previewStore.testMode] FINISHED`);
});
// === Конец Watchers ===
</script>

<style lang="scss" scoped>
.test-mode-preview-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  .el-radio-group {
    :deep(.el-radio-button) {
      .el-radio-button__inner {
        padding: 0 8px;
        height: 24px;
        line-height: 24px;
        font-size: 11px;
      }
    }
  }

  .el-button {
    height: 24px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
}
</style>
