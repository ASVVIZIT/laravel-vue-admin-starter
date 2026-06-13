<template>
  <el-button
      type="success"
      size="small"
      :icon="Download"
      :disabled="disabled"
      :loading="loading"
      @click="handleExport"
      title="Скачать таблицу в CSV"
  >
    Экспорт CSV
  </el-button>
</template>

<script setup>
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTrainingLogStore } from '@/components/Training/stores/trainingLogStore.js'
import { TrainingExportResource } from '@/components/Training/api/core/resource/TrainingExportResource.js'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const logStore = useTrainingLogStore()
const exportResource = new TrainingExportResource()
const loading = ref(false)

const handleExport = async () => {
  if (props.disabled) return

  loading.value = true
  try {
    // 🔥 Формируем фильтры из текущего состояния стора
    const filters = {
      tab: logStore.activeTab,
      date_from: logStore.currentFilters.from || undefined,
      date_to: logStore.currentFilters.to || undefined,
      exercise_id: logStore.currentFilters.exercise_id || undefined
    }

    const result = await exportResource.getCsvExportResource(filters)

    if (!result.success) {
      ElMessage.error(result.error || 'Не удалось сформировать отчет')
      return
    }

    // 🔥 Создаем blob URL и инициируем скачивание
    const url = window.URL.createObjectURL(result.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success(`Отчет "${result.fileName}" успешно скачан`)
  } catch (error) {
    console.error('[ExportButton] Error:', error)
    ElMessage.error('Непредвиденная ошибка при экспорте')
  } finally {
    loading.value = false
  }
}
</script>
