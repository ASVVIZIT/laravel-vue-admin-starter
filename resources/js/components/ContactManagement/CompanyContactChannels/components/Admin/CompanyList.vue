<template>
  <div class="company-list">
    <div class="header-actions">
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        Добавить Компанию
      </el-button>
    </div>

    <h3>Список Компаний</h3>

    <div class="table-wrapper" :style="{ 'max-height': tableHeight }">
      <el-table
          v-loading="companyStore.loading"
          :data="companyStore.companies"
          style="width: 100%"
          row-key="id"
          border
          :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column prop="id" label="ID" sortable width="60" fixed="left" />
        <el-table-column label="Иконка" width="56" fixed="left">
          <template #default="{ row }">
            <component :is="getIconComponent(row.settings?.icon)" class="table-icon" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Название" sortable min-width="140">
          <template #default="{ row }">
            <editable-cell
                v-model="row.name"
                :validator="(val) => val.trim().length > 0 && val.length <= 255"
                @save="(val) => updateCompanyField(row.id, 'name', val)"
                :disabled="row._updating || formLoading"
            />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Описание" min-width="180">
          <template #default="{ row }">
            <editable-cell
                v-model="row.description"
                type="textarea"
                :rows="2"
                :validator="(val) => val === null || val === '' || (typeof val === 'string' && val.length <= 1000)"
                @save="(val) => updateCompanyField(row.id, 'description', val)"
                :disabled="row._updating || formLoading"
            />
          </template>
        </el-table-column>
        <el-table-column prop="address" label="Адрес" min-width="150">
          <template #default="{ row }">
            <editable-cell
                v-model="row.address"
                :validator="(val) => val === null || val === '' || (typeof val === 'string' && val.length <= 500)"
                @save="(val) => updateCompanyField(row.id, 'address', val)"
                :disabled="row._updating || formLoading"
            />
          </template>
        </el-table-column>

        <el-table-column label="Действия" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEditDialog(row)" :disabled="row._updating || formLoading">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button size="small" type="danger" @click="showDeleteConfirm(row)" :disabled="row._updating || formLoading">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ПАГИНАЦИЯ -->
    <el-pagination
        v-if="companyStore.totalPages > 1"
        class="pagination"
        background
        layout="prev, pager, next, jumper, sizes, ->, total"
        :current-page="companyStore.currentPage"
        :page-size="companyStore.pageSize"
        :page-sizes="[5, 10, 15, 20, 25, 50]"
        :total="companyStore.totalItems"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :hide-on-single-page="false"
    />

    <!-- Диалог создания/редактирования -->
    <el-dialog
        v-model="dialogVisible"
        :title="editingCompany ? 'Редактировать компанию' : 'Создать компанию'"
        width="50%"
        @closed="resetForm"
        destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="formLoading">
        <el-form-item label="Название" prop="name">
          <el-input v-model="form.name" maxlength="255" show-word-limit :disabled="formLoading" />
        </el-form-item>
        <el-form-item label="Иконка" prop="settings.icon">
          <el-select v-model="form.settings.icon" clearable filterable placeholder="Выберите иконку" :disabled="formLoading">
            <el-option
                v-for="iconOption in iconOptions"
                :key="iconOption.value"
                :label="iconOption.label"
                :value="iconOption.value"
            >
              <div class="icon-option">
                <component :is="getIconComponent(iconOption.value)" class="option-icon" />
                <span>{{ iconOption.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Описание" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="1000" show-word-limit :disabled="formLoading" />
        </el-form-item>
        <el-form-item label="Адрес" prop="address">
          <el-input v-model="form.address" maxlength="500" show-word-limit :disabled="formLoading" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="formLoading">Отмена</el-button>
          <el-button type="primary" @click="submitForm" :loading="formLoading">
            {{ editingCompany ? 'Сохранить' : 'Создать' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Диалог подтверждения удаления -->
    <el-dialog
        v-model="deleteConfirmDialogVisible"
        title="Подтверждение удаления"
        width="30%"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
      <p>Вы уверены, что хотите удалить компанию "<strong>{{ companyToDelete?.name }}</strong>"?</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteConfirmDialogVisible = false" :disabled="deletionLoading">Отмена</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deletionLoading">Удалить</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Plus, Edit, Delete, Check, Close,
  Link as DefaultIcon, OfficeBuilding, House,
  VideoCamera, ChatLineSquare, Position, Guide,
  Picture, Connection, Monitor
} from '@element-plus/icons-vue';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import EditableCell from '@/components/ContactManagement/CompanyContactChannels/components/Admin/EditableCell.vue';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';

const fenixIconStore = useFenixIconsStore();
const companyStore = useCompanyStore();

// --- Пропсы ---
const props = defineProps({
  tableHeight: {
    type: String,
    default: 'calc(100vh - 260px)'
  }
});

// --- Состояния UI ---
const dialogVisible = ref(false);
const editingCompany = ref(null);
const formRef = ref(null);
const formLoading = ref(false);
const deletionLoading = ref(false);
const deleteConfirmDialogVisible = ref(false);
const companyToDelete = ref(null);

const form = reactive({
  name: '',
  settings: { icon: 'el-icon-office-building' },
  description: '',
  address: '',
});

const iconOptions = [
  { value: 'el-icon-office-building', label: 'Офисное здание' },
  { value: 'el-icon-house', label: 'Дом' },
  { value: 'el-icon-fenix-custom', label: 'Fenix Custom' },
  { value: 'el-icon-link', label: 'Ссылка' },
  { value: 'el-icon-video-camera', label: 'Видеокамера' },
  { value: 'el-icon-chat-line-square', label: 'Чат' },
  { value: 'el-icon-position', label: 'Позиция' },
  { value: 'el-icon-guide', label: 'Гид' },
  { value: 'el-icon-picture', label: 'Картинка' },
  { value: 'el-icon-connection', label: 'Соединение' },
  { value: 'el-icon-monitor', label: 'Монитор' },
];

const rules = {
  name: [
    { required: true, message: 'Название компании обязательно', trigger: 'blur' },
    { max: 255, message: 'Название не должно превышать 255 символов', trigger: 'blur' },
  ],
  'settings.icon': [
    { required: true, message: 'Иконка обязательна', trigger: 'change' },
  ],
  description: [{ type: 'string', message: 'Описание должно быть строкой', trigger: 'blur' }],
  address: [{ max: 500, message: 'Адрес не должен превышать 500 символов', trigger: 'blur' }],
};

const iconMap = {
  'el-icon-office-building': OfficeBuilding,
  'el-icon-house': House,
  'el-icon-fenix-custom': fenixIconStore.getIconByName('FenixCustom') || DefaultIcon,
  'el-icon-link': DefaultIcon,
  'el-icon-video-camera': VideoCamera,
  'el-icon-chat-line-square': ChatLineSquare,
  'el-icon-position': Position,
  'el-icon-guide': Guide,
  'el-icon-picture': Picture,
  'el-icon-connection': Connection,
  'el-icon-monitor': Monitor,
  'default': DefaultIcon
};

const getIconComponent = (iconString) => {
  const mappedComponent = iconMap[iconString];
  if (mappedComponent) return mappedComponent;
  console.warn(`Иконка для '${iconString}' не найдена, используется резервная.`);
  return iconMap['default'];
};

// --- Обработчики пагинации ---
const handlePageChange = (newPage) => {
  console.log("COMPONENT: Page changed to:", newPage);
  companyStore.fetchCompanies(newPage, companyStore.pageSize);
};

const handleSizeChange = (newSize) => {
  console.log("COMPONENT: Page size changed to:", newSize);
  companyStore.fetchCompanies(1, newSize);
};

// --- Inline редактирование ---
const updateCompanyField = async (companyId, fieldName, newValue) => {
  const company = companyStore.companies.find(c => c.id === companyId);
  if (!company) {
    console.error('Company not found for inline edit:', companyId);
    return;
  }
  company._updating = true;
  try {
    let updateData = {};
    if (fieldName === 'settings.icon') {
      updateData = { settings: { ...company.settings, icon: newValue } };
    } else {
      updateData = { [fieldName]: newValue };
    }
    await companyStore.updateCompany(companyId, updateData);
    ElMessage.success(`Поле "${fieldName}" обновлено`);
  } catch (err) {
    console.error(err);
    ElMessage.warning(`Поле "${fieldName}" не обновлено`);
  } finally {
    company._updating = false;
  }
};

// --- Диалоги ---
const openCreateDialog = () => {
  editingCompany.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (company) => {
  editingCompany.value = company;
  form.name = company.name;
  form.settings.icon = company.settings?.icon || 'el-icon-office-building';
  form.description = company.description;
  form.address = company.address;
  dialogVisible.value = true;
};

const showDeleteConfirm = (company) => {
  companyToDelete.value = company;
  deleteConfirmDialogVisible.value = true;
};

const confirmDelete = async () => {
  if (!companyToDelete.value) return;
  deletionLoading.value = true;
  try {
    await companyStore.deleteCompany(companyToDelete.value.id);
    ElMessage.success(`Компания "${companyToDelete.value.name}" удалена успешно`);
    companyStore.fetchCompanies(companyStore.currentPage, companyStore.pageSize);
  } catch (err) {
    console.error(err);
  } finally {
    deletionLoading.value = false;
    companyToDelete.value = null;
    deleteConfirmDialogVisible.value = false;
  }
};

const submitForm = async () => {
  await formRef.value.validate();
  formLoading.value = true;
  try {
    const submitData = {
      name: form.name,
      description: form.description,
      address: form.address,
      settings: form.settings,
    };
    if (editingCompany.value) {
      await companyStore.updateCompany(editingCompany.value.id, submitData);
      ElMessage.success('Компания обновлена успешно');
    } else {
      await companyStore.createCompany(submitData);
      ElMessage.success('Компания создана успешно');
    }
    dialogVisible.value = false;
    companyStore.fetchCompanies(companyStore.currentPage, companyStore.pageSize);
  } catch (err) {
    console.error(err);
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.clearValidate();
  Object.assign(form, {
    name: '',
    settings: { icon: 'el-icon-office-building' },
    description: '',
    address: ''
  });
  editingCompany.value = null;
};

const totalPages = computed(() => companyStore.totalPages);

onMounted(() => {
  console.log("COMPONENT: Mounted, fetching companies...");
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
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}
.table-icon {
  width: 22px;
  height: 22px;
  color: #409EFF;
  text-align: center;
  vertical-align: middle;
}
.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
.option-icon {
  width: 16px;
  height: 16px;
}
.pagination {
  align-self: center;
}
</style>
