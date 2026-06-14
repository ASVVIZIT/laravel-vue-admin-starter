<template>
  <el-button
      type="success"
      size="small"
      :icon="Download"
      :disabled="disabled"
      :loading="loading"
      @click="exportCsv.download"
      title="Скачать таблицу в CSV"
  >
    Экспорт CSV
  </el-button>
</template>

<script setup>
import { Download } from '@element-plus/icons-vue'
import { useTrainingCsvExport } from '@/components/Training/composables/useTrainingCsvExport.js'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

// 🔥 Вся логика теперь здесь
const exportCsv = useTrainingCsvExport()
</script>
