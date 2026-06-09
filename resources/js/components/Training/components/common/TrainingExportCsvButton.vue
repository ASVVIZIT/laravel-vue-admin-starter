<template>
  <el-button
      type="success"
      size="small"
      :icon="Download"
      :disabled="disabled"
      :loading="loading"
      @click="handleExport"
      title="Скачать текущую таблицу в CSV"
  >
    Экспорт CSV
  </el-button>
</template>

<script setup>
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'
import { exportLogsToCsvUtils } from '@components/Training/utils/trainingHelpersUtils.js'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const logStore = useTrainingLogStore()
const settingsStore = useTrainingSettingsStore()
const loading = ref(false)

const handleExport = async () => {
  if (props.disabled) return

  loading.value = true
  try {
    const success = exportLogsToCsvUtils(
        logStore.currentLogs,
        settingsStore.columnsConfig,
        logStore.activeTab
    )

    if (success) {
      ElMessage.success(`Экспортировано ${logStore.currentLogs.length} записей`)
    } else {
      ElMessage.warning('Нет данных для экспорта')
    }
  } catch (error) {
    console.error('Export error:', error)
    ElMessage.error('Ошибка при создании файла')
  } finally {
    loading.value = false
  }
}
</script>
