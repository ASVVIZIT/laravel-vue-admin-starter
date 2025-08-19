<template>
  <div class="dynamic-table">
    <div class="table-header">
      <h2>{{ template?.name }}</h2>
      <div class="table-actions">
        <el-button @click="addFirstRow" type="primary" v-if="!hasRows">
          Добавить первую строку
        </el-button>
        <el-button @click="refreshData" icon="el-icon-refresh">
          Обновить
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="error" class="error">
      <el-alert :title="error" type="error" show-icon />
    </div>

    <div v-else-if="tableData && tableData.length > 0" class="table-wrapper">
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column
            v-for="column in visibleColumns"
            :key="column.id"
            :prop="column.label"
            :label="column.label"
            :width="column.width || 200"
        >
          <template #default="scope">
            <div v-if="column.type === 'reference'">
              <el-select
                  v-model="scope.row[column.label]"
                  @change="handleReferenceChange(scope.row, column)"
                  placeholder="Выберите значение"
                  style="width: 100%"
              >
                <el-option
                    v-for="item in getReferenceDataForColumn(column)"
                    :key="item.id"
                    :label="formatReferenceDisplay(item, column.reference?.displayFormat)"
                    :value="item.id"
                ></el-option>
              </el-select>
            </div>
            <div v-else-if="column.type === 'boolean'">
              <el-switch
                  v-model="scope.row[column.label]"
                  @change="handleBooleanChange(scope.row, column)"
              ></el-switch>
            </div>
            <div v-else-if="column.type === 'date'">
              <el-date-picker
                  v-model="scope.row[column.label]"
                  type="date"
                  placeholder="Выберите дату"
                  format="YYYY-MM-DD"
                  value-format="yyyy-MM-dd"
              ></el-date-picker>
            </div>
            <div v-else-if="column.type === 'datetime'">
              <el-date-picker
                  v-model="scope.row[column.label]"
                  type="datetime"
                  placeholder="Выберите дату и время"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
              ></el-date-picker>
            </div>
            <div v-else-if="column.type === 'select'">
              <el-select
                  v-model="scope.row[column.label]"
                  placeholder="Выберите значение"
                  style="width: 100%"
              >
                <el-option
                    v-for="option in parseOptions(column.options)"
                    :key="option"
                    :label="option"
                    :value="option"
                ></el-option>
              </el-select>
            </div>
            <div v-else-if="column.type === 'number'">
              <el-input-number
                  v-model="scope.row[column.label]"
                  controls-position="right"
                  :min="0"
                  style="width: 100%"
              ></el-input-number>
            </div>
            <div v-else>
              <el-input
                  v-model="scope.row[column.label]"
                  @blur="handleCellBlur(scope.row, column)"
              ></el-input>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="120">
          <template #default="scope">
            <el-button size="small" @click="deleteRow(scope.row)">Удалить</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="empty-state">
      <p>Нет данных для отображения</p>
      <el-button @click="addFirstRow" type="primary">Добавить первую строку</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { dataSource } from '@/components/DynamicTable/services/dataSource'
import { formatReferenceDisplay } from '@/components/DynamicTable/utils/referenceUtils'

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const loading = ref(false)
const error = ref(null)
const tableData = ref([])
const template = ref(null)
const referenceData = ref({})

// Вычисляемые свойства
const visibleColumns = computed(() => {
  return template.value?.columns?.filter(col => !col.hidden) || []
})

const hasRows = computed(() => {
  return tableData.value && tableData.value.length > 0
})

// Загрузка данных
onMounted(async () => {
  await loadTemplate()
  await loadTableData()
  await loadReferenceData()
})

// Загрузка шаблона
const loadTemplate = async () => {
  try {
    const response = await dataSource.get(props.templateId)
    template.value = response.data
  } catch (err) {
    error.value = 'Ошибка загрузки шаблона: ' + (err.response?.data?.message || err.message)
    console.error('Load template error:', err)
  }
}

// Загрузка данных таблицы
const loadTableData = async () => {
  try {
    loading.value = true
    const response = await dataSource.fetchTableData({
      template_id: props.templateId,
      page: 1,
      per_page: 100
    })

    tableData.value = response.data || []
  } catch (err) {
    error.value = 'Ошибка загрузки данных: ' + (err.response?.data?.message || err.message)
    console.error('Load table data error:', err)
  } finally {
    loading.value = false
  }
}

// Загрузка данных справочников
const loadReferenceData = async () => {
  if (!template.value || !template.value.columns) return

  try {
    const referenceColumns = template.value.columns.filter(col => col.type === 'reference')
    for (const column of referenceColumns) {
      if (column.reference?.entityType) {
        try {
          const response = await dataSource.loadReferenceData(column.reference.entityType)
          referenceData.value[column.reference.entityType] = response || []
        } catch (error) {
          console.error(`Ошибка загрузки данных справочника (${column.reference.entityType}):`, error)
          referenceData.value[column.reference.entityType] = []
        }
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки данных справочников:', error)
  }
}

// Получение данных справочника для конкретной колонки
const getReferenceDataForColumn = (column) => {
  if (column.reference?.entityType) {
    return referenceData.value[column.reference.entityType] || []
  }
  return []
}

// Парсинг опций для select
const parseOptions = (optionsString) => {
  if (!optionsString) return []
  return optionsString.split(',').map(opt => opt.trim()).filter(opt => opt)
}

// Обработка изменения значения справочника
const handleReferenceChange = async (row, column) => {
  try {
    await dataSource.updateRow(row.id, {
      [column.label]: row[column.label]
    })
    ElNotification.success({ title: 'Успех', message: 'Значение обновлено' })
  } catch (error) {
    ElMessage.error('Ошибка обновления значения: ' + error.message)
  }
}

// Обработка изменения boolean значения
const handleBooleanChange = async (row, column) => {
  try {
    await dataSource.updateRow(row.id, {
      [column.label]: row[column.label]
    })
    ElNotification.success({ title: 'Успех', message: 'Значение обновлено' })
  } catch (error) {
    ElMessage.error('Ошибка обновления значения: ' + error.message)
  }
}

// Обработка изменения ячейки
const handleCellBlur = async (row, column) => {
  try {
    await dataSource.updateRow(row.id, {
      [column.label]: row[column.label]
    })
    ElNotification.success({ title: 'Успех', message: 'Значение обновлено' })
  } catch (error) {
    ElMessage.error('Ошибка обновления значения: ' + error.message)
  }
}

// Добавление первой строки
const addFirstRow = async () => {
  try {
    loading.value = true
    const rowData = {}

    template.value.columns.forEach(column => {
      if (column.type === 'reference') {
        rowData[column.label] = ''
      } else if (column.type === 'boolean') {
        rowData[column.label] = false
      } else if (column.type === 'number') {
        rowData[column.label] = 0
      } else {
        rowData[column.label] = ''
      }
    })

    await dataSource.createRow({
      template_id: props.templateId,
      rowData,
      order: 0
    })

    await loadTableData()
    ElNotification.success({ title: 'Успех', message: 'Первая строка добавлена' })
  } catch (err) {
    ElMessage.error('Ошибка добавления строки: ' + (err.response?.data?.message || err.message))
    console.error('Add first row error:', err)
  } finally {
    loading.value = false
  }
}

// Удаление строки
const deleteRow = async (row) => {
  try {
    await dataSource.deleteRow(row.id)
    await loadTableData()
    ElNotification.success({ title: 'Успех', message: 'Строка удалена' })
  } catch (error) {
    ElMessage.error('Ошибка удаления строки: ' + error.message)
  }
}

// Обновление данных
const refreshData = async () => {
  await loadTableData()
}

// Следим за изменением templateId
watch(() => props.templateId, async (newId) => {
  if (newId) {
    await loadTemplate()
    await loadTableData()
    await loadReferenceData()
  }
})
</script>

<style scoped>
.dynamic-table {
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 40px;
}

.error {
  color: #f56c6c;
}
</style>
