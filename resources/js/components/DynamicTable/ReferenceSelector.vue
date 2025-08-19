<template>
  <el-select
      v-model="selectedId"
      filterable
      remote
      reserve-keyword
      placeholder="Выберите из справочника"
      :remote-method="searchReferences"
      :loading="isLoading"
      @change="handleChange"
      @blur="handleBlur"
      ref="selectorRef"
      class="reference-selector"
  >
    <el-option
        v-for="item in filteredItems"
        :key="item.id"
        :label="formatDisplay(item)"
        :value="item.id"
    />
  </el-select>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  formatReferenceDisplay,
  getAvailableKeys,
  getNestedValue
} from './utils/referenceUtils';

const props = defineProps({
  modelValue: [Number, String, null],
  entityType: String,
  displayFormat: String,
  loadReferenceData: Function // Ожидаем функцию загрузки данных из родителя
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'loading']);

const selectedId = ref(props.modelValue);
const referenceItems = ref([]);
const isLoading = ref(false);
const searchQuery = ref(''); // Локальный поисковый запрос для фильтрации
const selectorRef = ref(null);
const loadAttempts = ref(0);
const MAX_LOAD_ATTEMPTS = 3;
const lastLoadedEntityType = ref(null);
const specificItemCache = ref(new Map()); // Кэш для конкретных элементов

// Фильтруем элементы по локальному поисковому запросу (для отображения в выпадающем списке)
const filteredItems = computed(() => {
  if (!searchQuery.value) return referenceItems.value;

  const query = searchQuery.value.toLowerCase();
  return referenceItems.value.filter(item => {
    const displayText = formatDisplay(item).toLowerCase();
    return displayText.includes(query);
  });
});

// Форматируем отображение элемента справочника
const formatDisplay = (item) => {
  if (!item) return '';
  // Используем props.displayFormat напрямую, так как он передается из родителя
  return formatReferenceDisplay(item, {
    type: 'reference',
    reference: {
      entityType: props.entityType,
      displayFormat: props.displayFormat
    }
  });
};

// Загрузка данных справочника с обработкой ошибок и повторными попытками
const fetchReferenceData = async (force = false, query = '') => {
  if (!props.entityType) {
    emit('loading', false);
    return;
  }

  // Проверяем, не загружаем ли мы уже этот тип справочника
  if (!force && props.entityType === lastLoadedEntityType.value && referenceItems.value.length > 0 && !query) {
    emit('loading', false);
    return;
  }

  // Проверяем, не превышено ли максимальное количество попыток
  if (loadAttempts.value >= MAX_LOAD_ATTEMPTS) {
    emit('loading', false);
    return;
  }

  isLoading.value = true;
  emit('loading', true);

  try {
    // Используем переданный метод для загрузки данных
    if (props.loadReferenceData && typeof props.loadReferenceData === 'function') {
      // Передаем поисковый запрос в функцию загрузки для remote search
      const data = await props.loadReferenceData(props.entityType, query);

      // Сохраняем данные
      referenceItems.value = Array.isArray(data) ? data : [];
      lastLoadedEntityType.value = props.entityType;
      loadAttempts.value = 0;

      // Загрузка конкретного элемента, если он не найден в списке
      if (props.modelValue && !referenceItems.value.some(item => item.id == props.modelValue)) {
        try {
          // Проверяем кэш
          if (specificItemCache.value.has(`${props.entityType}-${props.modelValue}`)) {
            const cachedItem = specificItemCache.value.get(`${props.entityType}-${props.modelValue}`);
            // Добавляем в список если еще не добавлен
            if (!referenceItems.value.some(item => item.id == cachedItem.id)) {
              referenceItems.value.push(cachedItem);
            }
          } else {
            // Загружаем конкретный элемент
            const specificItem = await loadSpecificItem(props.entityType, props.modelValue);
            if (specificItem) {
              // Кэшируем элемент
              specificItemCache.value.set(`${props.entityType}-${props.modelValue}`, specificItem);
              // Добавляем в список если еще не добавлен
              if (!referenceItems.value.some(item => item.id == specificItem.id)) {
                referenceItems.value.push(specificItem);
              }
            }
          }
        } catch (error) {
          console.error('Ошибка при загрузке конкретного элемента:', error);
        }
      }
    } else {
      throw new Error('Метод loadReferenceData не передан в компонент или не является функцией');
    }
  } catch (error) {
    console.error(`Ошибка загрузки данных справочника (${props.entityType}):`, error);
    loadAttempts.value++;

    // Повторная попытка через некоторое время
    if (loadAttempts.value < MAX_LOAD_ATTEMPTS) {
      setTimeout(() => {
        fetchReferenceData(force, query);
      }, 1000 * loadAttempts.value);
    } else {
      ElMessage.error(`Не удалось загрузить данные справочника "${props.entityType}"`);
    }
  } finally {
    isLoading.value = false;
    emit('loading', false);
  }
};

// Загрузка конкретного элемента по ID
const loadSpecificItem = async (entityType, id) => {
  // Проверяем, поддерживает ли функция loadReferenceData загрузку конкретного элемента
  // Это зависит от реализации в родительском компоненте
  // Например, можно передать объект с параметрами: { id: id }
  if (props.loadReferenceData && typeof props.loadReferenceData === 'function') {
    try {
      const data = await props.loadReferenceData(entityType, { id });
      if (Array.isArray(data) && data.length > 0) {
        return data[0]; // Предполагаем, что возвращается массив с одним элементом
      } else if (data && typeof data === 'object') {
        return data; // Или сразу объект
      }
    } catch (error) {
      console.error(`Ошибка загрузки конкретного элемента ${id} из справочника ${entityType}:`, error);
      throw error;
    }
  }
  return null;
};

// Поиск в справочнике (для remote-method Element Plus)
const searchReferences = async (query) => {
  // Сохраняем локальный поисковый запрос для фильтрации отображаемых опций
  searchQuery.value = query || '';

  // Для полноценной поддержки remote search, вызываем функцию загрузки с параметром query
  if (props.loadReferenceData) {
    await fetchReferenceData(false, query || '');
  }
};

// Обработка изменения выбора
const handleChange = (value) => {
  selectedId.value = value;
  emit('update:modelValue', value);
  emit('change', value);
};

// Обработка потери фокуса
const handleBlur = () => {
  emit('blur');
};

// Сигнализируем о начале загрузки
onMounted(() => {
  emit('loading', true);
  fetchReferenceData(); // Используем переименованную функцию
});

// Сигнализируем об окончании загрузки при размонтировании
onUnmounted(() => {
  emit('loading', false);
});

// Синхронизация с внешним значением
watch(() => props.modelValue, (newVal) => {
  selectedId.value = newVal;

  // Если новое значение не найдено в списке, пытаемся загрузить его
  if (newVal && !referenceItems.value.some(item => item.id == newVal)) {
    fetchReferenceData(true); // Принудительная перезагрузка для получения конкретного элемента
  }
});

// Синхронизация с типом справочника
watch(() => props.entityType, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadAttempts.value = 0;
    referenceItems.value = [];
    lastLoadedEntityType.value = null;
    searchQuery.value = ''; // Сбрасываем локальный поиск при смене типа
    specificItemCache.value.clear(); // Очищаем кэш при смене типа
    await fetchReferenceData(true); // Принудительная перезагрузка
  }
});
</script>

<style scoped>
.reference-selector {
  width: 100%;
}
</style>
