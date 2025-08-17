<template>
  <td @dblclick="toggleEdit" class="table-cell" :class="{ 'editable': !isEditing }">
    <template v-if="!isEditing">
      {{ displayValue }}
    </template>
    <template v-else>
      <!-- Текстовое поле -->
      <input
          v-if="column.type === 'text'"
          v-model="editValue"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          class="edit-input text-input"
      />

      <!-- Числовое поле -->
      <input
          v-else-if="column.type === 'number'"
          type="number"
          v-model.number="editValue"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          class="edit-input number-input"
      />

      <!-- Выпадающий список -->
      <select
          v-else-if="column.type === 'select'"
          v-model="editValue"
          @change="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          class="edit-input select-input"
      >
        <option value="" selected>Не выбрано</option>
        <option v-for="(option, index) in column.options" :key="index" :value="option">
          {{ option }}
        </option>
      </select>

      <!-- Справочник -->
      <select
          v-else-if="column.type === 'reference'"
          v-model="editValue"
          @change="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          class="edit-input reference-input"
          :disabled="loadingReference"
      >
        <option value="" selected>Не выбрано</option>
        <option
            v-for="item in referenceOptions"
            :key="item.id"
            :value="item.id"
        >
          {{ formatReferenceDisplay(item, column) }}
        </option>
      </select>

      <!-- Boolean -->
      <div
          v-else-if="column.type === 'boolean'"
          class="boolean-editor"
          @click.stop
      >
        <el-switch
            v-if="getBooleanSetting(column, 'displayType') === 'toggle'"
            v-model="editValue"
            :active-value="true"
            :inactive-value="false"
        />
        <el-checkbox
            v-else-if="getBooleanSetting(column, 'displayType') === 'checkbox'"
            v-model="editValue"
            :true-label="true"
            :false-label="false"
        />
        <div v-else-if="getBooleanSetting(column, 'displayType') === 'text'" class="text-boolean">
          <span v-if="editValue">{{ getBooleanSetting(column, 'trueLabel') || 'Да' }}</span>
          <span v-else>{{ getBooleanSetting(column, 'falseLabel') || 'Нет' }}</span>
        </div>
      </div>

      <!-- Дата -->
      <input
          v-else-if="column.type === 'date'"
          type="date"
          v-model="internalEditValue"
          @blur="saveChanges"
          @keyup.esc="cancelEdit"
          ref="inputRef"
          class="edit-input date-input"
      />
    </template>
  </td>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getBooleanSetting,
  formatReferenceDisplay,
  getExampleFormat,
  getAvailableKeys,
  getNestedValue,
  parseBooleanValue
} from '@/components/DynamicTable/utils/referenceUtils';

const props = defineProps({
  value: [String, Number, Boolean, Object, null, undefined],
  column: {
    type: Object,
    required: true
  },
  rowData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update', 'reference-selected']);

// Состояние
const isEditing = ref(false);
const editValue = ref(null);
const internalEditValue = ref(null); // Внутреннее значение для input type="date"
const inputRef = ref(null);
const referenceOptions = ref([]);
const loadingReference = ref(false);

// Вычисляемые свойства
const displayValue = computed(() => {
  // Для reference
  if (props.column.type === 'reference' && props.value !== null && props.value !== undefined) {
    let id = null;

    // Определяем ID из разных возможных форматов
    if (typeof props.value === 'object' && props.value.id !== undefined) {
      id = props.value.id;
    } else if (typeof props.value === 'number' || typeof props.value === 'string') {
      id = props.value;
    }

    if (id === null) return 'Не выбрано';

    // Если данные справочника уже загружены, показываем отформатированное значение
    if (referenceOptions.value.length > 0) {
      const item = referenceOptions.value.find(opt => opt.id == id);
      if (item) {
        return formatReferenceDisplay(item, props.column);
      }
    }

    // Если данные справочника еще не загружены, показываем ID
    return `#${id}`;
  }

  // Для boolean
  if (props.column.type === 'boolean') {
    let boolValue;

    // Проверяем, является ли значение объектом (уже отформатированным)
    if (typeof props.value === 'object' && props.value.value !== undefined) {
      boolValue = props.value.value;
    } else {
      boolValue = parseBooleanValue(props.value);
    }

    if (boolValue === true) {
      return getBooleanSetting(props.column, 'trueLabel') || 'Да';
    } else if (boolValue === false) {
      return getBooleanSetting(props.column, 'falseLabel') || 'Нет';
    }
    return 'Не выбрано';
  }

  // Для date
  if (props.column.type === 'date' && props.value) {
    // Пытаемся распарсить строку
    try {
      const date = new Date(props.value);
      if (!isNaN(date.getTime())) {
        return formatDate(date, props.column.dateFormat || 'YYYY-MM-DD');
      }
    } catch (e) {
      console.error('Invalid date:', props.value);
    }

    return props.value;
  }

  // Для select
  if (props.column.type === 'select' && props.value !== null && props.value !== undefined) {
    if (Array.isArray(props.column.options) &&
        props.column.options.includes(props.value)) {
      return props.value;
    }
    return 'Недопустимое значение';
  }

  // Для остальных типов
  return props.value !== null && props.value !== undefined ? props.value : '—';
});

// Следим за изменениями значения
watch(() => props.value, (newVal) => {
  if (props.column.type === 'reference') {
    let id = null;

    if (typeof newVal === 'object' && newVal.id !== undefined) {
      id = newVal.id;
    } else if (typeof newVal === 'number' || typeof newVal === 'string') {
      id = newVal;
    }

    editValue.value = id;
  } else if (props.column.type === 'boolean') {
    editValue.value = parseBooleanValue(newVal);
  } else if (props.column.type === 'date') {
    if (newVal) {
      try {
        const date = new Date(newVal);
        if (!isNaN(date.getTime())) {
          // Для внутреннего редактирования используем ISO формат (YYYY-MM-DD)
          internalEditValue.value = date.toISOString().split('T')[0];
          editValue.value = date;
        } else {
          internalEditValue.value = null;
          editValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
        editValue.value = null;
      }
    } else {
      internalEditValue.value = null;
      editValue.value = null;
    }
  } else {
    editValue.value = newVal;
  }
}, { immediate: true });

// Загрузка данных справочника
const loadReferenceData = async () => {
  if (props.column.type !== 'reference' || !props.column.reference?.entityType) return;

  try {
    loadingReference.value = true;

    // В реальном приложении здесь будет запрос к API справочника
    // Для примера используем моковые данные
    await new Promise(resolve => setTimeout(resolve, 500));

    // Получаем моковые данные
    let mockData = [];
    switch (props.column.reference.entityType) {
      case 'accessory':
        mockData = [
          { id: 1, brand: { name: 'ABB' }, model: 'SH200', series: 'S200', name: 'ABB SH200' },
          { id: 2, brand: { name: 'Legrand' }, model: 'DX 3', series: 'DX3', name: 'Legrand DX 3' },
          { id: 3, brand: { name: 'IEK' }, model: 'VA47-29', series: 'VA47', name: 'IEK VA47-29' }
        ];
        break;
      case 'brand':
        mockData = [
          { id: 1, name: 'ABB', country: 'Швейцария' },
          { id: 2, name: 'Legrand', country: 'Франция' },
          { id: 3, name: 'IEK', country: 'Россия' }
        ];
        break;
      case 'device_type':
        mockData = [
          { id: 1, name: 'Автоматический выключатель', code: 'ACB' },
          { id: 2, name: 'УЗО', code: 'RCD' },
          { id: 3, name: 'Дифавтомат', code: 'RCBO' }
        ];
        break;
      default:
        mockData = [];
    }

    referenceOptions.value = mockData;

  } catch (err) {
    ElMessage.error('Ошибка загрузки справочника');
    console.error('Load reference error:', err);
  } finally {
    loadingReference.value = false;
  }
};

// Методы
const toggleEdit = () => {
  if (isEditing.value) return;

  // Для справочника загружаем данные при активации
  if (props.column.type === 'reference' && referenceOptions.value.length === 0) {
    loadReferenceData();
  }

  isEditing.value = true;

  // Устанавливаем значение для редактирования
  if (props.column.type === 'reference') {
    let id = null;

    if (typeof props.value === 'object' && props.value.id !== undefined) {
      id = props.value.id;
    } else if (typeof props.value === 'number' || typeof props.value === 'string') {
      id = props.value;
    }

    editValue.value = id;
  } else if (props.column.type === 'boolean') {
    editValue.value = parseBooleanValue(props.value);
  } else if (props.column.type === 'date') {
    if (props.value) {
      try {
        const date = new Date(props.value);
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date.toISOString().split('T')[0];
          editValue.value = date;
        } else {
          internalEditValue.value = null;
          editValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
        editValue.value = null;
      }
    } else {
      internalEditValue.value = null;
      editValue.value = null;
    }
  } else {
    editValue.value = props.value;
  }

  // Фокусируем поле ввода
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      if (inputRef.value.select) {
        inputRef.value.select();
      }
    }
  });
};

const saveChanges = () => {
  let valueToSave = editValue.value;

  // Для reference сохраняем ID
  if (props.column.type === 'reference') {
    if (valueToSave === '') {
      valueToSave = null;
    } else {
      valueToSave = valueToSave ? Number(valueToSave) : null;
    }
  }

  // Для boolean преобразуем в правильный тип
  if (props.column.type === 'boolean') {
    valueToSave = Boolean(valueToSave);
  }

  // Для date преобразуем в стандартный формат для отправки на сервер
  if (props.column.type === 'date' && valueToSave) {
    if (valueToSave instanceof Date) {
      const year = valueToSave.getFullYear();
      const month = (valueToSave.getMonth() + 1).toString().padStart(2, '0');
      const day = valueToSave.getDate().toString().padStart(2, '0');
      valueToSave = `${year}-${month}-${day}`;
    } else if (typeof valueToSave === 'string') {
      // Пытаемся распарсить строку в дату
      const date = new Date(valueToSave);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        valueToSave = `${year}-${month}-${day}`;
      }
      // Если не удалось распарсить, оставляем как есть (но это вызовет ошибку)
    }
  }

  isEditing.value = false;
  emit('update', valueToSave);
};

const cancelEdit = () => {
  isEditing.value = false;

  // Восстанавливаем исходное значение
  if (props.column.type === 'reference') {
    let id = null;

    if (typeof props.value === 'object' && props.value.id !== undefined) {
      id = props.value.id;
    } else if (typeof props.value === 'number' || typeof props.value === 'string') {
      id = props.value;
    }

    editValue.value = id;
  } else if (props.column.type === 'boolean') {
    editValue.value = parseBooleanValue(props.value);
  } else if (props.column.type === 'date') {
    if (props.value) {
      try {
        const date = new Date(props.value);
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date.toISOString().split('T')[0];
          editValue.value = date;
        } else {
          internalEditValue.value = null;
          editValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
        editValue.value = null;
      }
    } else {
      internalEditValue.value = null;
      editValue.value = null;
    }
  } else {
    editValue.value = props.value;
  }
};

// Хуки
onMounted(() => {
  // Загружаем данные справочника при необходимости
  if (props.column.type === 'reference' && props.value && referenceOptions.value.length === 0) {
    loadReferenceData();
  }
});

// Вспомогательная функция для форматирования даты
const formatDate = (date, format) => {
  if (!date) return '';

  // Если это строка, преобразуем в объект Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Проверяем валидность даты
  if (isNaN(dateObj.getTime())) return date;

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD MMM YYYY':
      return `${day} ${monthNames[dateObj.getMonth()]} ${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
};
</script>

<style lang="scss" scoped>
.table-cell {
  padding: 4px 8px;
  border: 1px solid #ebeef5;
  text-align: left;
  transition: all 0.2s ease;

  &.editable {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .edit-input {
    width: 100%;
    padding: 2px 4px;
    border: 1px solid #409EFF;
    border-radius: 2px;
    outline: none;

    &.text-input {
      height: 24px;
    }

    &.number-input {
      height: 24px;
    }

    &.select-input, &.reference-input {
      height: 26px;
    }

    &.date-input {
      height: 24px;
    }
  }

  .boolean-editor {
    display: flex;
    align-items: center;
    height: 100%;

    .text-boolean {
      cursor: pointer;
      padding: 2px 4px;

      span {
        font-size: 13px;
      }
    }
  }
}
</style>
