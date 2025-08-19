<!-- resources/js/components/DynamicTable/TemplateList.vue -->
<template>
  <div class="template-list">
    <div class="page-header">
      <h1>Шаблоны таблиц</h1>
      <el-button
          type="primary"
          icon="el-icon-plus"
          @click="createNewTemplate"
      >
        Создать шаблон
      </el-button>
    </div>

    <el-card class="box-card">
      <div slot="header" class="card-header">
        <span>Список шаблонов</span>
        <el-input
            v-model="searchQuery"
            placeholder="Поиск шаблонов..."
            style="width: 300px; margin-left: 20px;"
            clearable
        />
      </div>

      <el-table
          :data="filteredTemplates"
          v-loading="loading"
          row-key="id"
          :default-sort="{prop: 'name', order: 'ascending'}"
      >
        <el-table-column prop="name" label="Название" sortable>
          <template #default="{row}">
            <router-link
                :to="{name: 'DynamicTableWithTemplate', params: {templateId: row.id}}"
                class="template-link"
            >
              {{ row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="columns_count" label="Колонки" width="100" align="center">
          <template #default="{row}">
            <el-tag size="small">{{ row.columns_count }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Действия" width="200" align="center">
          <template #default="{row}">
            <el-button
                size="mini"
                type="primary"
                @click="editTemplate(row.id)"
            >
              Редактировать
            </el-button>
            <el-button
                size="mini"
                type="danger"
                @click="deleteTemplate(row)"
            >
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-if="pagination.total > pagination.per_page"
          class="pagination"
          @current-change="handlePageChange"
          :current-page="pagination.current_page"
          :page-size="pagination.per_page"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { dataSource } from './services/dataSource';

// Состояние
const router = useRouter();
const loading = ref(false);
const templates = ref([]);
const searchQuery = ref('');
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0
});

// Вычисляемые свойства
const filteredTemplates = computed(() => {
  if (!searchQuery.value) return templates.value;

  const query = searchQuery.value.toLowerCase();
  return templates.value.filter(template =>
      template.name.toLowerCase().includes(query)
  );
});

// Методы
const fetchTemplates = async () => {
  try {
    loading.value = true;
    const response = await dataSource.list({
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      search: searchQuery.value
    });

    templates.value = response.data;
    pagination.value = {
      current_page: response.meta.current_page,
      per_page: response.meta.per_page,
      total: response.meta.total
    };
  } catch (error) {
    ElMessage.error('Ошибка загрузки шаблонов');
    console.error('Fetch templates error:', error);
  } finally {
    loading.value = false;
  }
};

const createNewTemplate = () => {
  router.push({ name: 'TemplateCreate' });
};

const editTemplate = (id) => {
  router.push({ name: 'TemplateEdit', params: { id } });
};

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
        `Вы действительно хотите удалить шаблон "${template.name}"?`,
        'Подтверждение удаления',
        {
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
          type: 'warning'
        }
    );

    await dataSource.destroy(template.id);
    ElMessage.success(`Шаблон "${template.name}" успешно удален`);
    fetchTemplates();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка при удалении шаблона');
      console.error('Delete template error:', error);
    }
  }
};

const handlePageChange = (page) => {
  pagination.value.current_page = page;
  fetchTemplates();
};

// Хуки
onMounted(() => {
  fetchTemplates();
});
</script>

<style lang="scss" scoped>
.template-list {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
      font-size: 24px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .template-link {
    color: #409EFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
