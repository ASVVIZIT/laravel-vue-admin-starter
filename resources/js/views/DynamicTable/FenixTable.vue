<!-- resources/js/views/DynamicTable/FenixTable.vue -->
<template>
  <div class="app-container scroll-y">
    <div class="dynamic-table__wrapper">
      <div class="dynamic-table__header">
        <h1>Система динамических таблиц</h1>

        <!-- Выбор шаблона -->
        <div class="template-selector">
          <label for="template-select">Выберите шаблон:</label>
          <el-select
              v-model="selectedTemplateId"
              id="template-select"
              placeholder="Выберите шаблон"
              @change="onTemplateChange"
              :loading="loadingTemplates"
          >
            <el-option
                v-for="template in templates"
                :key="template.id"
                :label="template.name"
                :value="template.id"
            >
              <span style="float: left">{{ template.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ template.columns_count }} колонок</span>
            </el-option>
          </el-select>

          <el-button
              type="primary"
              icon="el-icon-plus"
              @click="createNewTemplate"
              class="create-template-btn"
          >
            Создать шаблон
          </el-button>
        </div>
      </div>

      <!-- Отображаем таблицу только если выбран шаблон -->
      <div v-if="selectedTemplateId" class="table-container">
        <DynamicTable :template-id="selectedTemplateId" />
      </div>

      <!-- Сообщение, если шаблоны отсутствуют -->
      <div v-else-if="!loadingTemplates && templates.length === 0" class="no-templates">
        <el-empty description="У вас пока нет созданных шаблонов">
          <el-button type="primary" @click="createNewTemplate">Создать первый шаблон</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
// resources/js/views/DynamicTable/FenixTable.vue
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElNotification } from 'element-plus';
import DynamicTable from '@/components/DynamicTable/DynamicTable.vue';
import tableApi from '@/api/tableApi';

// Состояние
const route = useRoute();
const router = useRouter();
const templates = ref([]);
const loadingTemplates = ref(false);
const selectedTemplateId = ref(null);

// Загрузка списка шаблонов
const loadTemplates = async () => {
  try {
    loadingTemplates.value = true;
    const response = await tableApi.list({
      page: 1,
      per_page: 100
    });

    templates.value = response.data || [];

    // Если есть шаблоны, устанавливаем выбранный шаблон
    if (templates.value.length > 0) {
      // Пытаемся использовать шаблон из URL
      if (route.params.templateId) {
        const templateId = parseInt(route.params.templateId);
        const exists = templates.value.some(t => t.id === templateId);

        if (exists) {
          selectedTemplateId.value = templateId;
        } else {
          selectedTemplateId.value = templates.value[0].id;
          // Обновляем URL
          router.replace({
            name: 'DynamicTableWithTemplate',
            params: { templateId: selectedTemplateId.value }
          });
        }
      } else if (templates.value.length > 0) {
        // Выбираем первый шаблон по умолчанию
        selectedTemplateId.value = templates.value[0].id;
        // Обновляем URL
        router.replace({
          name: 'DynamicTableWithTemplate',
          params: { templateId: selectedTemplateId.value }
        });
      }
    } else {
      selectedTemplateId.value = null;
    }
  } catch (err) {
    ElMessage.error('Ошибка загрузки шаблонов: ' + (err.response?.data?.message || err.message));
    console.error('Load templates error:', err);
  } finally {
    loadingTemplates.value = false;
  }
};

// Обработка изменения выбора шаблона
const onTemplateChange = (templateId) => {
  // Обновляем URL
  router.push({
    name: 'DynamicTableWithTemplate',
    params: { templateId }
  });
};

// Создание нового шаблона
const createNewTemplate = () => {
  router.push({ name: 'TemplateCreate' });
};

// Хуки
onMounted(async () => {
  await loadTemplates();
});

// Следим за изменениями в списке шаблонов
watch(templates, (newTemplates) => {
  if (newTemplates.length === 0 && !loadingTemplates.value) {
    ElNotification({
      title: 'Внимание',
      message: 'У вас нет созданных шаблонов. Создайте первый шаблон для начала работы.',
      type: 'warning',
      duration: 5000
    });
  }
});

// Следим за параметром шаблона в URL
watch(() => route.params.templateId, (newId) => {
  if (newId) {
    const id = parseInt(newId);
    const exists = templates.value.some(t => t.id === id);

    if (exists) {
      selectedTemplateId.value = id;
    } else if (templates.value.length > 0) {
      // Если запрошенный шаблон не существует, переключаемся на первый доступный
      selectedTemplateId.value = templates.value[0].id;
      router.replace({
        name: 'DynamicTableWithTemplate',
        params: { templateId: selectedTemplateId.value }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.app-container {
  background-color: var(--el-color-info-light-9);

  .dynamic-table__wrapper {
    margin: 2px;
    padding: 2px 10px;

    .dynamic-table__header {
      margin: 2px;
      padding: 2px 10px;
      background-color: var(--el-color-info-light-7);
      border-radius: 4px;
      margin-bottom: 15px;

      h1 {
        margin: 0 0 12px 0;
        font-size: 20px;
        color: #333;
      }

      .template-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;

        label {
          font-weight: 500;
          color: #606266;
        }

        .el-select {
          width: 300px;
        }

        .create-template-btn {
          margin-left: auto;
        }
      }
    }

    .table-container {
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .no-templates {
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin-top: 20px;
    }
  }
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .app-container {
    .dynamic-table__wrapper {
      .dynamic-table__header {
        .template-selector {
          flex-direction: column;
          align-items: stretch;

          .el-select {
            width: 100%;
          }

          .create-template-btn {
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
