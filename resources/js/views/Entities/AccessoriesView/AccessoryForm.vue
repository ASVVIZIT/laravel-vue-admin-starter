<template>
  <div class="accessory-form-container">
    <!-- Шапка с кнопками действий -->
    <div class="form-header">
      <div class="header-left">
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

      <div class="header-actions">
        <el-button-group>
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
          <el-button
              type="info"
              :size="store.size"
              @click="openSettings"
              class="settings-button"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Вкладки с индикаторами прогресса -->
    <el-tabs
        v-model="activeTab"
        :tab-position="tabPosition"
        type="border-card"
        class="tabs-style"
        @tab-change="handleTabChange"
    >
      <!-- Вкладка: Основная информация -->
      <el-tab-pane name="main">
        <template #label>
          <span class="tab-label">
            <b>Основная информация</b>
            <ProgressStars
                :total="mainTabFields.total"
                :filled="mainTabFields.filled"
                :required="mainTabFields.required"
                :filled-required="mainTabFields.filledRequired"
            />
          </span>
        </template>
        <div class="scrollable-form">
          <el-form
              ref="formRef"
              :model="form"
              label-width="140px"
              label-position="top"
              :size="store.size"
              v-loading="loading"
          >
            <el-collapse v-model="activeCollapseItems">
              <!-- Критически важные поля -->
              <el-collapse-item name="critical" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Критически важные поля</b>
                    <ProgressStars
                        :total="criticalFields.total"
                        :filled="criticalFields.filled"
                        :required="criticalFields.required"
                        :filled-required="criticalFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <el-form-item
                      label="Название"
                      prop="name"
                      :rules="[{ required: true, message: 'Название обязательно' }]"
                      :class="{'highlight-field': !form.name}"
                  >
                    <el-input
                        v-model="form.name"
                        placeholder="Модуль дистанционного управления"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Модель"
                      prop="model"
                      :rules="[{ required: true, message: 'Модель обязательна' }]"
                      :class="{'highlight-field': !form.model}"
                  >
                    <el-input
                        v-model="form.model"
                        placeholder="ARA iC60"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Тип устройства"
                      prop="type_id"
                      :rules="[{ required: true, message: 'Выберите тип' }]"
                      :class="{'highlight-field': !form.type_id}"
                  >
                    <el-select
                        v-model="form.type_id"
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
                </div>
              </el-collapse-item>

              <!-- Основные технические данные -->
              <el-collapse-item name="basicTech" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Основные технические данные</b>
                    <ProgressStars
                        :total="basicTechFields.total"
                        :filled="basicTechFields.filled"
                        :required="basicTechFields.required"
                        :filled-required="basicTechFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <el-form-item
                      label="Бренд"
                      prop="brand_id"
                      :rules="[{ required: true, message: 'Выберите бренд' }]"
                      :class="{'highlight-field': !form.brand_id}"
                  >
                    <el-select
                        v-model="form.brand_id"
                        filterable
                        clearable
                        @change="autoFillBrandInfo"
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
                  <el-form-item
                      label="Серия"
                  >
                    <el-input
                        v-model="form.series"
                        placeholder="Acti9"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Описание"
                  >
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 5 }"
                        placeholder="Подробное описание аксессуара"
                        :size="store.size"
                    />
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Вкладка: Технические характеристики -->
      <el-tab-pane name="technical">
        <template #label>
          <span class="tab-label">
            <b>Технические характеристики</b>
            <ProgressStars
                :total="technicalTabFields.total"
                :filled="technicalTabFields.filled"
                :required="technicalTabFields.required"
                :filled-required="technicalTabFields.filledRequired"
            />
          </span>
        </template>
        <div class="scrollable-form">
          <el-form
              ref="formRef"
              :model="form"
              label-width="140px"
              label-position="top"
              :size="store.size"
              v-loading="loading"
          >
            <el-collapse v-model="activeCollapseItems">
              <!-- Электрические параметры -->
              <el-collapse-item name="electrical" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Электрические параметры</b>
                    <ProgressStars
                        :total="electricalFields.total"
                        :filled="electricalFields.filled"
                        :required="electricalFields.required"
                        :filled-required="electricalFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <!-- Номинальный ток с единицей -->
                  <el-form-item
                      label="Номинальный ток"
                  >
                    <div class="input-with-unit">
                      <el-input-number
                          v-model="form.current_rating"
                          :min="0"
                          controls-position="right"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.current_rating_unit_id"
                          placeholder="A"
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('current')"
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>

                  <!-- Напряжение с единицей -->
                  <el-form-item
                      label="Напряжение"
                  >
                    <div class="input-with-unit">
                      <el-input
                          v-model="form.voltage"
                          clearable
                          placeholder="230/400"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.voltage_unit_id"
                          clearable
                          placeholder="V"
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('voltage')"
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>
                </div>
              </el-collapse-item>

              <!-- Конструктивные характеристики -->
              <el-collapse-item name="construction" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Конструктивные характеристики</b>
                    <ProgressStars
                        :total="constructionFields.total"
                        :filled="constructionFields.filled"
                        :required="constructionFields.required"
                        :filled-required="constructionFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <!-- Сечение кабеля с единицей -->
                  <el-form-item
                      label="Сечение кабеля"
                  >
                    <div class="input-with-unit">
                      <el-input-number
                          v-model="form.cross_section"
                          :min="0"
                          controls-position="right"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.cross_section_unit_id"
                          clearable
                          placeholder="мм²"
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('area')"
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>

                  <!-- Толщина с единицей -->
                  <el-form-item
                      label="Толщина"
                  >
                    <div class="input-with-unit">
                      <el-input-number
                          v-model="form.thickness"
                          :min="0"
                          controls-position="right"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.thickness_unit_id"
                          clearable
                          placeholder="мм"
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('length')"
                            clearable
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>

                  <!-- Дифференциальный ток с единицей -->
                  <el-form-item
                      label="Дифференциальный ток"
                  >
                    <div class="input-with-unit">
                      <el-input-number
                          v-model="form.rated_diff_current"
                          :min="0"
                          controls-position="right"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.rated_diff_current_unit_id"
                          placeholder="мА"
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('current')"
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>

                  <!-- Количество в упаковке с единицей -->
                  <el-form-item
                      label="Количество в упаковке"
                  >
                    <div class="input-with-unit">
                      <el-input-number
                          v-model="form.quantity_per_pack"
                          :min="1"
                          controls-position="right"
                          :size="store.size"
                          class="field-data"
                      />
                      <el-select
                          v-model="form.quantity_per_pack_unit_id"
                          placeholder="шт."
                          :size="store.size"
                          class="field-unit"
                      >
                        <el-option
                            v-for="unit in getUnitsForCategory('quantity')"
                            :key="unit.id"
                            :label="unit.display_symbol"
                            :value="unit.id"
                        />
                      </el-select>
                    </div>
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Вкладка: Эксплуатационные параметры -->
      <el-tab-pane name="operational">
        <template #label>
          <span class="tab-label">
            <b>Эксплуатационные параметры</b>
            <ProgressStars
                :total="operationalTabFields.total"
                :filled="operationalTabFields.filled"
                :required="operationalTabFields.required"
                :filled-required="operationalTabFields.filledRequired"
            />
          </span>
        </template>
        <div class="scrollable-form">
          <el-form
              ref="formRef"
              :model="form"
              label-width="140px"
              label-position="top"
              :size="store.size"
              v-loading="loading"
          >
            <el-collapse v-model="activeCollapseItems">
              <!-- Безопасность и условия эксплуатации -->
              <el-collapse-item name="safety" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Безопасность и условия эксплуатации</b>
                    <ProgressStars
                        :total="safetyFields.total"
                        :filled="safetyFields.filled"
                        :required="safetyFields.required"
                        :filled-required="safetyFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <el-form-item
                      label="Класс защиты IP"
                  >
                    <el-input
                        v-model="form.ip_rating"
                        placeholder="IP40"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Тип монтажа"
                  >
                    <el-input
                        v-model="form.mounting_type"
                        placeholder="Модульный"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Стандарты"
                  >
                    <el-input
                        v-model="form.standards"
                        placeholder="IEC 60947"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Материал"
                  >
                    <el-input
                        v-model="form.material"
                        placeholder="Термопласт"
                        :size="store.size"
                    />
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Вкладка: Дополнительное оборудование -->
      <el-tab-pane name="additional">
        <template #label>
          <span class="tab-label">
            <b>Дополнительное оборудование</b>
            <ProgressStars
                :total="additionalTabFields.total"
                :filled="additionalTabFields.filled"
                :required="additionalTabFields.required"
                :filled-required="additionalTabFields.filledRequired"
            />
          </span>
        </template>
        <div class="scrollable-form">
          <el-form
              ref="formRef"
              :model="form"
              label-width="140px"
              label-position="top"
              :size="store.size"
              v-loading="loading"
          >
            <el-collapse v-model="activeCollapseItems">
              <!-- Совместимость и управление -->
              <el-collapse-item name="compatibility" class="collapse-card">
                <template #title>
                  <div class="collapse-header">
                    <b>Совместимость и управление</b>
                    <ProgressStars
                        :total="compatibilityFields.total"
                        :filled="compatibilityFields.filled"
                        :required="compatibilityFields.required"
                        :filled-required="compatibilityFields.filledRequired"
                    />
                  </div>
                </template>
                <div class="fields-container">
                  <el-form-item
                      label="Совместимые модели"
                  >
                    <el-input
                        v-model="form.compatible_models"
                        placeholder="iC60, NG125"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Протокол связи"
                  >
                    <el-input
                        v-model="form.communication_protocol"
                        placeholder="Ti24"
                        :size="store.size"
                    />
                  </el-form-item>
                  <el-form-item
                      label="Поддержка дистанционного управления"
                  >
                    <div class="remote-control-container">
                      <el-switch
                          v-model="form.remote_control"
                          :size="store.size"
                      />
                      <span>{{ form.remote_control ? 'есть' : 'нет' }}</span>
                    </div>
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Setting } from '@element-plus/icons-vue';
import { appStore } from "@/store/app";
import { useAccessoryStore } from '@/store/accessoryStore';
import { useBrandStore } from '@/store/brandStore';
import { useDeviceTypeStore } from '@/store/deviceTypeStore';
import { useMeasurementUnitStore } from '@/store/measurementUnitStore';
import { useMeasurementCategoryStore } from '@/store/measurementCategoryStore';

// Компонент ProgressStars вынесен в отдельный файл
import ProgressStars from '@/components/ProgressStars/ProgressStars.vue';

const store = appStore();
const accessoryStore = useAccessoryStore();
const brandStore = useBrandStore();
const deviceTypeStore = useDeviceTypeStore();
const measurementUnitStore = useMeasurementUnitStore();
const measurementCategoryStore = useMeasurementCategoryStore();

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const activeTab = ref('main');
const activeCollapseItems = ref(['critical', 'basicTech', 'electrical', 'construction', 'safety', 'compatibility']);
const windowWidth = ref(window.innerWidth);

// Полная форма с учетом модели
const form = ref({
  model: '',
  name: '',
  brand_id: null,
  type_id: null,
  series: '',
  description: '',
  cross_section: null,
  cross_section_unit_id: null,
  current_rating: null,
  current_rating_unit_id: null,
  quantity_per_pack: null,
  quantity_per_pack_unit_id: null,
  thickness: null,
  thickness_unit_id: null,
  rated_diff_current: null,
  rated_diff_current_unit_id: null,
  voltage: '',
  voltage_unit_id: null,
  ip_rating: '',
  mounting_type: '',
  standards: '',
  material: '',
  compatible_models: '',
  communication_protocol: '',
  remote_control: false
});

const loading = ref(true);
const submitting = ref(false);
const brands = ref([]);
const deviceTypes = ref([]);
const measurementUnits = ref([]);
const measurementCategories = ref([]);
const categoryMap = ref({});

const isEditMode = computed(() => route.name === 'AccessoryEdit');
const formTitle = computed(() =>
    isEditMode.value ? 'Редактирование аксессуара' : 'Создание аксессуара'
);

const tabPosition = computed(() => {
  return windowWidth.value >= 992 ? 'left' : 'top';
});

// Карта соответствия полей категориям измерений
const fieldCategoryMap = {
  current_rating_unit_id: 'current',
  voltage_unit_id: 'voltage',
  cross_section_unit_id: 'area',
  rated_diff_current_unit_id: 'current',
  quantity_per_pack_unit_id: 'quantity',
  thickness_unit_id: 'length'
};

// Обработчик смены вкладки
const handleTabChange = () => {
  nextTick(() => {
    const scrollableForms = document.querySelectorAll('.scrollable-form');
    scrollableForms.forEach(form => {
      form.scrollTop = 0;
    });
  });
};

const openSettings = () => {
  console.log('Открыть настройки формы');
  // Реализация настроек формы
};

// Функция для проверки заполненности поля
const isFieldFilled = (value, key) => {
  if (typeof value === 'boolean') {
    return value === true;
  }

  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  if (Array.isArray(value) && value.length === 0) return false;

  return true;
};

// Конфигурация полей для вкладок
const tabFieldsConfig = {
  main: [
    { key: 'model', required: true },
    { key: 'brand_id', required: true },
    { key: 'type_id', required: true },
    { key: 'name', required: true },
    { key: 'series', required: false },
    { key: 'description', required: false },
  ],
  technical: [
    { key: 'current_rating', required: false },
    { key: 'current_rating_unit_id', required: false },
    { key: 'voltage', required: false },
    { key: 'voltage_unit_id', required: false },
    { key: 'cross_section', required: false },
    { key: 'cross_section_unit_id', required: false },
    { key: 'thickness', required: false },
    { key: 'thickness_unit_id', required: false },
    { key: 'rated_diff_current', required: false },
    { key: 'rated_diff_current_unit_id', required: false },
    { key: 'quantity_per_pack', required: false },
    { key: 'quantity_per_pack_unit_id', required: false },
  ],
  operational: [
    { key: 'ip_rating', required: false },
    { key: 'mounting_type', required: false },
    { key: 'standards', required: false },
    { key: 'material', required: false },
  ],
  additional: [
    { key: 'compatible_models', required: false },
    { key: 'communication_protocol', required: false },
    { key: 'remote_control', required: false },
  ],
};

// Конфигурация полей для групп внутри вкладок
const groupFieldsConfig = {
  critical: [
    { key: 'model', required: true },
    { key: 'type_id', required: true },
    { key: 'name', required: true },
  ],
  basicTech: [
    { key: 'brand_id', required: true },
    { key: 'series', required: false },
    { key: 'description', required: false },
  ],
  electrical: [
    { key: 'current_rating', required: false },
    { key: 'current_rating_unit_id', required: false },
    { key: 'voltage', required: false },
    { key: 'voltage_unit_id', required: false },
  ],
  construction: [
    { key: 'cross_section', required: false },
    { key: 'cross_section_unit_id', required: false },
    { key: 'thickness', required: false },
    { key: 'thickness_unit_id', required: false },
    { key: 'rated_diff_current', required: false },
    { key: 'rated_diff_current_unit_id', required: false },
    { key: 'quantity_per_pack', required: false },
    { key: 'quantity_per_pack_unit_id', required: false },
  ],
  safety: [
    { key: 'ip_rating', required: false },
    { key: 'mounting_type', required: false },
    { key: 'standards', required: false },
    { key: 'material', required: false },
  ],
  compatibility: [
    { key: 'compatible_models', required: false },
    { key: 'communication_protocol', required: false },
    { key: 'remote_control', required: false },
  ],
};

// Вычисляемые свойства для прогресса по вкладкам
const mainTabFields = computed(() => calculateTabProgress('main'));
const technicalTabFields = computed(() => calculateTabProgress('technical'));
const operationalTabFields = computed(() => calculateTabProgress('operational'));
const additionalTabFields = computed(() => calculateTabProgress('additional'));

// Вычисляемые свойства для прогресса по группам
const criticalFields = computed(() => calculateGroupProgress('critical'));
const basicTechFields = computed(() => calculateGroupProgress('basicTech'));
const electricalFields = computed(() => calculateGroupProgress('electrical'));
const constructionFields = computed(() => calculateGroupProgress('construction'));
const safetyFields = computed(() => calculateGroupProgress('safety'));
const compatibilityFields = computed(() => calculateGroupProgress('compatibility'));

// Функция расчета прогресса для вкладки
const calculateTabProgress = (tabName) => {
  const fields = tabFieldsConfig[tabName];
  return calculateProgress(fields);
};

// Функция расчета прогресса для группы
const calculateGroupProgress = (groupName) => {
  const fields = groupFieldsConfig[groupName];
  return calculateProgress(fields);
};

// Общая функция расчета прогресса
const calculateProgress = (fields) => {
  let filled = 0;
  let filledRequired = 0;
  let required = 0;

  fields.forEach(field => {
    const isFilled = isFieldFilled(form.value[field.key], field.key);
    if (field.required) {
      required++;
      if (isFilled) filledRequired++;
    }
    if (isFilled) filled++;
  });

  return {
    total: fields.length,
    filled,
    required,
    filledRequired
  };
};

// Автозаполнение информации о бренде
const autoFillBrandInfo = () => {
  const selectedBrand = brands.value.find(b => b.id === form.value.brand_id);
  if (selectedBrand) {
    form.value.description = selectedBrand.description || '';
  }
};

// Получение единиц измерения по категории
const getUnitsForCategory = (categoryName) => {
  const categoryId = categoryMap.value[categoryName];
  if (!categoryId) return measurementUnits.value;

  return measurementUnits.value.filter(
      unit => unit.measurement_category_id === categoryId
  );
};

// Загрузка необходимых данных
const loadRequiredData = async () => {
  try {
    await Promise.all([
      brandStore.fetchAll(),
      deviceTypeStore.fetchAll(),
      measurementUnitStore.fetchAll(),
      measurementCategoryStore.fetchAll()
    ]);

    brands.value = brandStore.brands;
    deviceTypes.value = deviceTypeStore.deviceTypes;
    console.log('deviceTypes.value ', deviceTypes.value);
    measurementUnits.value = measurementUnitStore.measurementUnits;
    measurementCategories.value = measurementCategoryStore.categories;

    // Создаем карту категорий по имени
    categoryMap.value = {};
    measurementCategories.value.forEach(category => {
      categoryMap.value[category.name] = category.id;
    });

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

// Обновление ширины окна
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  loadRequiredData();
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style lang="scss" scoped>
.accessory-form-container {
  margin: 2px;
  padding: 2px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 30px);
  background: #fff;
  border-radius: 4px;
  position: relative;
  font-size: 13px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding: 4px 8px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.form-header h2 {
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}

.back-button {
  padding: 6px 10px;
  height: auto;
  flex-shrink: 0;
}

.settings-button {
  padding: 6px 10px;
}

.scrollable-form {
  flex: 1;
  overflow-y: auto;
  padding: 2px 2px 10px;
  margin: 0 -5px;
  max-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .scrollable-form {
    max-height: calc(100vh - 280px);
  }
}

.tabs-style :deep(.el-tabs__header) {
  position: sticky;
  top: 0;
  z-index: 9;
  background: #fff;
}

.tabs-style :deep(.el-tabs__nav-wrap) {
  background: #fff;
}

@media (min-width: 992px) {
  .tabs-style :deep(.el-tabs__header) {
    width: 220px;
  }

  .tabs-style :deep(.el-tabs__content) {
    overflow-y: auto;
    height: calc(100vh - 150px);
  }

  .tabs-style :deep(.el-tab-pane) {
    padding: 0 15px;
  }

  .tabs-style :deep(.el-tabs__item) {
    font-weight: bold;
  }
}

.fields-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 0;
}

.field-item {
  min-width: 240px;
  flex: 1 1 0;
  max-width: 400px;
}

:deep(.el-form-item) {
  margin-bottom: 12px;
  flex: 1 0 auto;
  min-width: 240px;
}

:deep(.el-form-item__label) {
  padding-bottom: 2px !important;
  line-height: 1.3;
  font-size: 12px;
  font-weight: bold;
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

/* Подсветка обязательных полей */
.highlight-field :deep(.el-form-item__label) {
  color: #f56c6c;
  font-weight: bold;
}
.highlight-field :deep(.el-input__inner),
.highlight-field :deep(.el-select .el-input__inner) {
  border-color: #f56c6c;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.required-stars {
  display: inline-flex;
  align-items: center;
}

.progress-stars .el-icon {
  font-size: 0.9em;
}

.progress-indicator {
  font-size: 0.8em;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 0 4px;
  color: #666;
}

/* Контейнер для переключателя и текста */
.remote-control-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Контейнер для объединения поля ввода и единицы измерения */
.input-with-unit {
  display: flex;
  align-items: center;
  /*width: 100%;*/

  .field-data {
    flex: 1;
    margin-right: 8px;
    /*min-width: 120px;*/
  }

  .field-unit {
    width: 80px;
    flex-shrink: 0;
  }
}

.collapse-card {
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
  font-weight: bold;
}

:deep(.el-collapse-item__header) {
  background-color: #f8f9fa;
  padding: 0 8px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
}

:deep(.el-collapse-item__content) {
  padding: 0 8px 8px;
  overflow-y: auto;
  max-height: 400px;
}
</style>
