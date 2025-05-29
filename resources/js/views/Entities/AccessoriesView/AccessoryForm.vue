<template>
  <div class="accessory-form-container">
    <div class="form-header">
      <el-button
          type="text"
          @click="$router.go(-1)"
          :size="store.size"
          class="back-button"
      >
        <el-icon><ArrowLeft /></el-icon> Назад
      </el-button>
      <h2>{{ formTitle }}</h2>
    </div>

    <div class="scrollable-form">
      <el-form
          ref="formRef"
          :model="form"
          label-width="140px"
          label-position="top"
          :size="store.size"
          v-loading="loading"
      >
        <div class="form-section compact-section">
          <h3>Основная информация</h3>
          <el-row :gutter="8">
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Модель"
                  prop="model"
                  :rules="[{ required: true, message: 'Модель обязательна' }]"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.model"
                    placeholder="ARA iC60"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Название"
                  prop="name"
                  :rules="[{ required: true, message: 'Название обязательно' }]"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.name"
                    placeholder="Модуль ДУ"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                  label="Описание"
                  prop="description"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="2"
                    placeholder="Описание аксессуара"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section compact-section">
          <h3>Связи</h3>
          <el-row :gutter="8">
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Бренд"
                  prop="brand_id"
                  :rules="[{ required: true, message: 'Выберите бренд' }]"
                  class="compact-form-item"
              >
                <el-select
                    v-model="form.brand_id"
                    placeholder="Выберите бренд"
                    filterable
                    clearable
                    :size="store.size"
                >
                  <el-option
                      v-for="brand in brands"
                      :key="brand.id"
                      :label="brand.name"
                      :value="brand.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Тип устройства"
                  prop="type_id"
                  :rules="[{ required: true, message: 'Выберите тип' }]"
                  class="compact-form-item"
              >
                <el-select
                    v-model="form.type_id"
                    placeholder="Выберите тип"
                    filterable
                    clearable
                    :size="store.size"
                >
                  <el-option
                      v-for="type in deviceTypes"
                      :key="type.id"
                      :label="type.name"
                      :value="type.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section compact-section">
          <h3>Физические параметры</h3>
          <el-row :gutter="8">
            <el-col :xs="24" :sm="8">
              <el-form-item
                  label="Сечение кабеля"
                  class="compact-form-item"
              >
                <div class="compact-input-with-unit">
                  <el-input-number
                      v-model="form.cross_section"
                      :precision="0"
                      :min="0"
                      controls-position="right"
                      :size="store.size"
                  />
                  <el-select
                      v-model="form.cross_section_unit_id"
                      placeholder="Ед."
                      :size="store.size"
                      class="unit-select"
                  >
                    <el-option
                        v-for="unit in measurementUnits"
                        :key="unit.id"
                        :label="unit.symbol"
                        :value="unit.id"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="8">
              <el-form-item
                  label="Ном. ток"
                  class="compact-form-item"
              >
                <div class="compact-input-with-unit">
                  <el-input-number
                      v-model="form.current_rating"
                      :min="0"
                      controls-position="right"
                      :size="store.size"
                  />
                  <el-select
                      v-model="form.current_rating_unit_id"
                      placeholder="Ед."
                      :size="store.size"
                      class="unit-select"
                  >
                    <el-option
                        v-for="unit in measurementUnits"
                        :key="unit.id"
                        :label="unit.symbol"
                        :value="unit.id"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="8">
              <el-form-item
                  label="Толщина"
                  class="compact-form-item"
              >
                <div class="compact-input-with-unit">
                  <el-input-number
                      v-model="form.thickness"
                      :precision="2"
                      :min="0"
                      controls-position="right"
                      :size="store.size"
                  />
                  <el-select
                      v-model="form.thickness_unit_id"
                      placeholder="Ед."
                      :size="store.size"
                      class="unit-select"
                  >
                    <el-option
                        v-for="unit in measurementUnits"
                        :key="unit.id"
                        :label="unit.symbol"
                        :value="unit.id"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-section compact-section">
          <h3>Технические параметры</h3>
          <el-row :gutter="8">
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Серия"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.series"
                    placeholder="Acti9"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Совместимые модели"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.compatible_models"
                    placeholder="iC60, NG125"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Напряжение"
                  class="compact-form-item"
              >
                <div class="compact-input-with-unit">
                  <el-input
                      v-model="form.voltage"
                      placeholder="230"
                      :size="store.size"
                  />
                  <el-select
                      v-model="form.voltage_unit_id"
                      placeholder="Ед."
                      :size="store.size"
                      class="unit-select"
                  >
                    <el-option
                        v-for="unit in measurementUnits"
                        :key="unit.id"
                        :label="unit.symbol"
                        :value="unit.id"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Протокол связи"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.communication_protocol"
                    placeholder="Ti24"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Дистанционное Управление"
                  class="compact-form-item"
              >
                <el-switch
                    v-model="form.remote_control"
                    :size="store.size"
                />
                <div>
                  <span v-if="form.remote_control">есть</span>
                  <span v-else>нет</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Класс защиты"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.ip_rating"
                    placeholder="IP40"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Тип монтажа"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.mounting_type"
                    placeholder="Модульный"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Стандарты"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.standards"
                    placeholder="IEC 60947"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item
                  label="Материал"
                  class="compact-form-item"
              >
                <el-input
                    v-model="form.material"
                    placeholder="Термопласт"
                    :size="store.size"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- Фиксированные кнопки действий -->
    <div class="fixed-form-actions">
      <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          :size="store.size"
      >
        {{ isEditMode ? 'Сохранить' : 'Создать' }}
      </el-button>
      <el-button
          @click="$router.go(-1)"
          :size="store.size"
      >
        Отмена
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { appStore } from "@/store/app";
import { useAccessoryStore } from '@/store/accessoryStore';
import { useBrandStore } from '@/store/brandStore';
import { useDeviceTypeStore } from '@/store/deviceTypeStore';
import { useMeasurementUnitStore } from '@/store/measurementUnitStore';

const store = appStore();
const accessoryStore = useAccessoryStore();
const brandStore = useBrandStore();
const deviceTypeStore = useDeviceTypeStore();
const measurementUnitStore = useMeasurementUnitStore();
const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const form = ref({
  model: '',
  name: '',
  description: '',
  cross_section: null,
  cross_section_unit_id: null,
  current_rating: null,
  current_rating_unit_id: null,
  thickness: null,
  thickness_unit_id: null,
  brand_id: null,
  type_id: null,
  series: '',
  compatible_models: '',
  voltage: '',
  voltage_unit_id: null,
  communication_protocol: '',
  remote_control: false,
  ip_rating: '',
  mounting_type: '',
  standards: '',
  material: ''
});

const loading = ref(true);
const submitting = ref(false);
const brands = ref([]);
const deviceTypes = ref([]);
const measurementUnits = ref([]);

const isEditMode = computed(() => route.name === 'AccessoryEdit');
const formTitle = computed(() =>
    isEditMode.value ? 'Редактирование аксессуара' : 'Создание аксессуара'
);

// Загрузка необходимых данных
const loadRequiredData = async () => {
  try {
    await Promise.all([
      brandStore.fetchAll(),
      deviceTypeStore.fetchAll(),
      measurementUnitStore.fetchAll()
    ]);

    brands.value = brandStore.brands;
    deviceTypes.value = deviceTypeStore.deviceTypes;
    measurementUnits.value = measurementUnitStore.measurementUnits;

    if (isEditMode.value) {
      await accessoryStore.fetchById(route.params.id);
      form.value = { ...accessoryStore.currentAccessory };
    }

  } catch (error) {
    ElMessage.error('Ошибка загрузки данных: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Отправка формы
const submitForm = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEditMode.value) {
      await accessoryStore.update(route.params.id, form.value);
      ElMessage.success('Аксессуар обновлен');
    } else {
      await accessoryStore.create(form.value);
      ElMessage.success('Аксессуар создан');
    }

    router.push({ name: 'Accessories' });

  } catch (error) {
    let errorMessage = error.message || 'Ошибка при сохранении';

    if (error.errors) {
      errorMessage = Object.values(error.errors).flat().join('; ');
    } else if (error.details) {
      errorMessage = `${error.message}: ${error.details}`;
    }

    ElMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadRequiredData();
});
</script>

<style scoped>
.accessory-form-container {
  margin: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 16px);
  background: #fff;
  border-radius: 4px;
  position: relative;
  font-size: 13px; /* Унифицированный размер шрифта */
}

.form-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.form-header h2 {
  margin: 0;
  margin-left: 8px;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.back-button {
  padding: 0;
  margin-right: 8px;
  flex-shrink: 0;
}

.scrollable-form {
  flex: 1;
  overflow-y: auto;
  padding: 5px 5px 180px; /* Больше места для кнопок */
  margin: 0 -5px;
}

/* Стили секций */
.form-section {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e7ed;
  color: #409eff;
  font-size: 1.0rem;
}

/* Компактные стили элементов */
:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  padding-bottom: 2px !important;
  line-height: 1.3;
  font-size: 12px;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__inner) {
  height: 24px;
  padding: 0 8px;
  line-height: 30px;
  font-size: 13px;
}

:deep(.el-textarea__inner) {
  min-height: 50px !important;
  padding: 4px 6px;
  line-height: 1.4;
}

:deep(.el-input-number) {
  line-height: 28px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  height: 28px;
  line-height: 28px;
  width: 26px;
}

/* Блоки с единицами измерения */
.compact-input-with-unit {
  display: flex;
  gap: 5px;
}

.unit-select {
  width: 70px;
}

/* Фиксированные кнопки действий */
.fixed-form-actions {
  position: fixed;
  bottom: 10px;
  left: 15px;
  right: 15px;
  padding: 8px 15px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* Гарантируем видимость последних элементов */
.form-section:last-child {
  margin-bottom: 5px;
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .accessory-form-container {
    height: calc(100vh - 12px);
    margin: 4px;
    padding: 6px;
  }

  .form-header {
    margin-bottom: 8px;
  }

  .form-header h2 {
    font-size: 1.1rem;
  }

  .compact-input-with-unit {
    flex-direction: column;
  }

  .unit-select {
    width: 100%;
  }

  .el-col {
    margin-bottom: 4px;
  }

  .fixed-form-actions {
    bottom: 8px;
    left: 8px;
    right: 8px;
    padding: 6px 10px;
    gap: 8px;
  }

  .scrollable-form {
    padding-bottom: 75px;
  }

  .form-section {
    padding: 8px;
    margin-bottom: 8px;
  }

  .form-section h3 {
    font-size: 0.95rem;
  }

  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
}
</style>
