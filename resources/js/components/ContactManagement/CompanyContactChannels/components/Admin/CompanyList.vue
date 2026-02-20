<template>
  <div class="company-list">
    <div class="header-actions">
      <el-button
          type="primary"
          @click="openCreateDialog"
          :disabled="companyStore.loading || formLoading || deletionLoading"
      >
        <el-icon><Plus /></el-icon>
        Добавить Компанию
      </el-button>
    </div>

    <h3>Список Компаний</h3>

    <div class="table-wrapper" :style="tableStyle">
      <CompanyTable
          :data="companyStore.companies"
          :loading="companyStore.loading"
          :icon-map="iconMap"
          @edit="openEditDialog"
          @delete="showDeleteConfirm"
          @update-field="updateCompanyField"
      />
    </div>

    <CompanyPagination
        :current-page="companyStore.currentPage"
        :page-size="companyStore.pageSize"
        :total-items="companyStore.totalItems"
        :total-pages="companyStore.totalPages"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
    />

    <CompanyForm
        v-model:visible="dialogVisible"
        :company="editingCompany"
        :loading="formLoading"
        :icon-options="iconOptions"
        @submit="submitForm"
    />

    <CompanyDeleteConfirm
        v-model:visible="deleteConfirmDialogVisible"
        :company="companyToDelete"
        :loading="deletionLoading"
        @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import CompanyTable from './CompanyTable.vue';
import CompanyPagination from './CompanyPagination.vue';
import CompanyForm from './CompanyForm.vue';
import CompanyDeleteConfirm from './CompanyDeleteConfirm.vue';
import { getIconMap, getIconOptions } from '../../utils/iconConfig.js';
import { getFieldLabel } from '../../utils/fieldLabels.js';

const companyStore = useCompanyStore();
const fenixIconStore = useFenixIconsStore();

const props = defineProps({
  tableMaxHeight: { type: String, default: 'calc(100vh - 320px)' },
  tableMinHeight: { type: String, default: 'calc(100vh - 320px)' }
});

// ============================================================================
// СОСТОЯНИЯ UI
// ============================================================================

const dialogVisible = ref(false);
const editingCompany = ref(null);
const formLoading = ref(false);
const deletionLoading = ref(false);
const deleteConfirmDialogVisible = ref(false);
const companyToDelete = ref(null);

const iconMap = getIconMap(fenixIconStore);
const iconOptions = getIconOptions();

const tableStyle = computed(() => ({
  'max-height': props.tableMaxHeight,
  'min-height': props.tableMinHeight
}));

// ============================================================================
// ОТЛАДКА: СЛЕДИМ ЗА СОСТОЯНИЕМ STORE
// ============================================================================

watch(() => companyStore.loading, (newVal) => {
  console.log('[CompanyList] Store loading changed:', newVal);
});

watch(() => companyStore.totalItems, (newVal, oldVal) => {
  console.log('[CompanyList] totalItems changed:', oldVal, '→', newVal);
});

// ============================================================================
// ОБРАБОТЧИКИ ПАГИНАЦИИ
// ============================================================================

const handlePageChange = (newPage) => {
  console.log('[CompanyList] handlePageChange:', newPage);

  // Принудительный сброс состояний перед пагинацией
  formLoading.value = false;
  deletionLoading.value = false;
  dialogVisible.value = false;
  deleteConfirmDialogVisible.value = false;

  companyStore.fetchCompanies(newPage, companyStore.pageSize);
};

const handleSizeChange = (newSize) => {
  console.log('[CompanyList] handleSizeChange:', newSize);

  // Принудительный сброс состояний перед изменением размера
  formLoading.value = false;
  deletionLoading.value = false;
  dialogVisible.value = false;
  deleteConfirmDialogVisible.value = false;

  companyStore.fetchCompanies(1, newSize);
};

// ============================================================================
// INLINE РЕДАКТИРОВАНИЕ
// ============================================================================

const updateCompanyField = async (companyId, fieldName, newValue) => {
  console.log('[CompanyList] updateCompanyField:', { companyId, fieldName, newValue });

  const company = companyStore.companies.find(c => c.id === companyId);
  if (!company) {
    console.error('[CompanyList] Company not found:', companyId);
    return;
  }

  company._updating = true;

  try {
    const updateData = fieldName === 'settings.icon'
        ? { settings: { ...company.settings, icon: newValue } }
        : { [fieldName]: newValue };

    await companyStore.updateCompany(companyId, updateData);

    const fieldLabel = getFieldLabel(fieldName, 'company');
    ElMessage.success({
      message: `Поле "${fieldLabel}" обновлено`,
      type: 'success',
      duration: 2000,
    });

  } catch (err) {
    console.error('[CompanyList] updateCompanyField error:', err);

    const fieldLabel = getFieldLabel(fieldName, 'company');
    ElMessage.warning({
      message: `Поле "${fieldLabel}" не обновлено`,
      type: 'warning',
      duration: 3000,
    });

  } finally {
    company._updating = false;
    console.log('[CompanyList] updateCompanyField finished');
  }
};

// ============================================================================
// ДИАЛОГИ
// ============================================================================

const openCreateDialog = () => {
  console.log('[CompanyList] openCreateDialog called');
  console.log('[CompanyList] dialogVisible before:', dialogVisible.value);
  console.log('[CompanyList] companyStore.loading:', companyStore.loading);
  console.log('[CompanyList] formLoading:', formLoading.value);
  console.log('[CompanyList] deletionLoading:', deletionLoading.value);

  editingCompany.value = null;
  dialogVisible.value = true;

  console.log('[CompanyList] dialogVisible after:', dialogVisible.value);
};

const openEditDialog = (company) => {
  console.log('[CompanyList] openEditDialog called:', company);
  editingCompany.value = company;
  dialogVisible.value = true;
};

const showDeleteConfirm = (company) => {
  console.log('[CompanyList] showDeleteConfirm called:', company);
  companyToDelete.value = company;
  deleteConfirmDialogVisible.value = true;
};

const confirmDelete = async () => {
  if (!companyToDelete.value) {
    console.error('[CompanyList] No company to delete');
    return;
  }

  console.log('[CompanyList] confirmDelete called:', companyToDelete.value);
  deletionLoading.value = true;

  try {
    await companyStore.deleteCompany(companyToDelete.value.id);
    ElMessage.success({
      message: `Компания "${companyToDelete.value.name}" удалена успешно`,
      type: 'success',
      duration: 2000,
    });
    await companyStore.fetchCompanies(companyStore.currentPage, companyStore.pageSize);

  } catch (err) {
    console.error('[CompanyList] confirmDelete error:', err);
    ElMessage.error({
      message: 'Ошибка при удалении компании',
      type: 'error',
      duration: 3000,
    });

  } finally {
    deletionLoading.value = false;
    companyToDelete.value = null;
    deleteConfirmDialogVisible.value = false;
    console.log('[CompanyList] confirmDelete finished, deletionLoading:', deletionLoading.value);
  }
};

// ============================================================================
// ОТПРАВКА ФОРМЫ (СОЗДАНИЕ / РЕДАКТИРОВАНИЕ)
// ============================================================================

const submitForm = async (formData) => {
  console.log('[CompanyList] submitForm called:', formData);
  formLoading.value = true;

  try {
    if (editingCompany.value) {
      await companyStore.updateCompany(editingCompany.value.id, formData);
      ElMessage.success({
        message: 'Компания обновлена успешно',
        type: 'success',
        duration: 2000,
      });
    } else {
      await companyStore.createCompany(formData);
      ElMessage.success({
        message: 'Компания создана успешно',
        type: 'success',
        duration: 2000,
      });
    }
    dialogVisible.value = false;

    // Ждём завершения fetchCompanies перед закрытием
    await companyStore.fetchCompanies(companyStore.currentPage, companyStore.pageSize);

    // Принудительная перерисовка после обновления totalItems
    await nextTick();
    console.log('[CompanyList] After fetch, totalItems:', companyStore.totalItems);

  } catch (err) {
    console.error('[CompanyList] submitForm error:', err);
    ElMessage.error({
      message: 'Ошибка при сохранении компании',
      type: 'error',
      duration: 3000,
    });

  } finally {
    formLoading.value = false;
    console.log('[CompanyList] submitForm finished, formLoading:', formLoading.value);
  }
};

// ============================================================================
// МОНТИРОВАНИЕ КОМПОНЕНТА
// ============================================================================

onMounted(() => {
  console.log('[CompanyList] Component mounted');
  companyStore.fetchCompanies(1, companyStore.pageSize);
});
</script>

<style scoped>
.company-list {
  padding: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-actions {
  margin-bottom: 10px;
}

.company-list h3 {
  margin: 0 0 10px 0;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 0.01rem solid #e9e9e9;
  border-radius: 2px;
}
</style>
