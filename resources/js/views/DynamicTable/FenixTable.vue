<template>
  <div class="app-container scroll-y">
    <div class="dynamic-table__wrapper">
      <!-- Список таблиц (отображается когда не указан templateId) -->
      <div v-if="!selectedTemplateId" class="tables-list-container">
        <div class="page-header">
          <h1>Список таблиц</h1>
          <el-button type="primary" icon="el-icon-plus" @click="createNewTemplate">
            Создать шаблон
          </el-button>
        </div>

        <el-card class="box-card">
          <div slot="header" class="card-header">
            <span>Доступные таблицы</span>
            <el-input
                v-model="searchQuery"
                placeholder="Поиск таблиц..."
                style="width: 300px; margin-left: 20px;"
            ></el-input>
          </div>

          <el-table :data="filteredTemplates" style="width: 100%" @row-click="viewTable">
            <el-table-column prop="name" label="Название" width="300"></el-table-column>
            <el-table-column prop="description" label="Описание"></el-table-column>
            <el-table-column label="Количество записей" width="150">
              <template #default="scope">
                {{ scope.row.row_count || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="Действия" width="200">
              <template #default="scope">
                <el-button size="small" @click="editTable(scope.row.id)">Редактировать</el-button>
                <el-button size="small" type="primary" @click="viewTable(scope.row.id)">Просмотр</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- Отображение таблицы -->
      <div v-else class="table-view">
        <div class="table-header">
          <el-button @click="backToList" icon="el-icon-arrow-left">
            Назад к списку
          </el-button>
          <h2>{{ currentTemplate?.name }}</h2>
        </div>

        <DynamicTable :template-id="selectedTemplateId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DynamicTable from '@/components/DynamicTable/DynamicTable.vue'
import { dataSource } from '@/components/DynamicTable/services/dataSource'

const route = useRoute()
const router = useRouter()
const templates = ref([])
const loadingTemplates = ref(false)
const loadingTable = ref(false)
const tableError = ref(null)
const searchQuery = ref('')
const selectedTemplateId = ref(null)
const currentTemplate = ref(null)

// Вычисляемые свойства
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value
  const query = searchQuery.value.toLowerCase()
  return templates.value.filter(template =>
      template.name.toLowerCase().includes(query)
  )
})

// Загрузка списка таблиц
const loadTemplates = async () => {
  try {
    loadingTemplates.value = true
    const response = await dataSource.list({ page: 1, per_page: 100 })

    // Клонируем данные, чтобы не мутировать оригинальный ответ
    templates.value = JSON.parse(JSON.stringify(response.data || []))

    // Добавляем подсчет записей для каждого шаблона
    for (const template of templates.value) {
      try {
        // Здесь можно добавить логику получения количества записей
        template.row_count = 0
      } catch (error) {
        console.error('Ошибка получения количества записей:', error)
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки шаблонов:', error)
    ElMessage.error('Ошибка загрузки списка шаблонов')
  } finally {
    loadingTemplates.value = false
  }
}

// Просмотр таблицы
const viewTable = (templateId) => {
  router.push({ name: 'DynamicTableWithTemplate', params: { templateId } })
}

// Редактирование таблицы
const editTable = (templateId) => {
  router.push({ name: 'TemplateEdit', params: { id: templateId } })
}

// Возврат к списку таблиц
const backToList = () => {
  router.push({ name: 'DynamicTable' })
}

// Создание нового шаблона
const createNewTemplate = () => {
  router.push({ name: 'TemplateCreate' })
}

// Хуки
onMounted(async () => {
  await loadTemplates()

  // Проверяем, есть ли templateId в URL
  if (route.params.templateId) {
    const templateId = parseInt(route.params.templateId)
    selectedTemplateId.value = templateId

    // Загружаем информацию о шаблоне
    try {
      currentTemplate.value = await dataSource.get(templateId)
      // Загружаем данные таблицы
      // loadTableData()
    } catch (err) {
      console.error('Ошибка загрузки шаблона:', err)
      let errorMessage = 'Не удалось загрузить шаблон'
      if (err.response && err.response.status === 404) {
        errorMessage = 'Шаблон не найден'
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      }
      ElMessage.error(errorMessage)

      // Перенаправляем к списку только если шаблон не найден
      if (err.response && err.response.status === 404) {
        router.push({ name: 'DynamicTable' })
      }
    }
  }
})

// Следим за изменениями в URL
watch(() => route.params.templateId, async (newId) => {
  if (newId) {
    const templateId = parseInt(newId)
    selectedTemplateId.value = templateId
    tableError.value = null

    // Проверяем, существует ли шаблон
    const exists = templates.value.some(t => t.id === templateId)
    if (!exists && templates.value.length > 0) {
      // Если шаблон не найден, но есть другие шаблоны, перенаправляем к списку
      router.push({ name: 'DynamicTable' })
      return
    }

    // Загружаем информацию о шаблоне
    try {
      currentTemplate.value = await dataSource.get(templateId)
      // Загружаем данные таблицы
      // loadTableData()
    } catch (err) {
      console.error('Ошибка загрузки шаблона:', err)
      let errorMessage = 'Не удалось загрузить шаблон'
      if (err.response && err.response.status === 404) {
        errorMessage = 'Шаблон не найден'
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      }
      ElMessage.error(errorMessage)
      selectedTemplateId.value = null
      currentTemplate.value = null

      // Перенаправляем к списку только если шаблон не найден
      if (err.response && err.response.status === 404) {
        router.push({ name: 'DynamicTable' })
      }
    }
  } else {
    selectedTemplateId.value = null
    currentTemplate.value = null
    tableError.value = null
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  background-color: var(--el-color-info-light-9);

  .dynamic-table__wrapper {
    margin: 2px;
    padding: 2px 10px;

    .tables-list-container {
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .box-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }

    .table-view {
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
    }
  }
}
</style>
