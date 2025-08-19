<!-- resources/js/components/DynamicTable/TableCell.vue -->
<template>
  <!-- Корневой элемент изменен с <td> на <div> -->
  <div @dblclick="toggleEdit" class="table-cell-wrapper">
    <!-- Режим просмотра: отображаем вычисленное значение -->
    <template v-if="!isEditing">
      <span class="table-cell-display">{{ displayValue }}</span>
    </template>
    <!-- Режим редактирования: отображаем соответствующий элемент ввода -->
    <template v-else>
      <!-- Текстовое поле -->
      <input
          v-if="column.type === 'text'"
          ref="inputRef"
          :value="internalEditValue"
          @input="internalEditValue = $event.target.value"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--text"
      />

      <!-- Числовое поле -->
      <input
          v-else-if="column.type === 'number'"
          ref="inputRef"
          type="number"
          :value="internalEditValue"
          @input="internalEditValue = $event.target.valueAsNumber"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--number"
      />

      <!-- Выпадающий список -->
      <select
          v-else-if="column.type === 'select'"
          ref="inputRef"
          :value="internalEditValue"
          @change="internalEditValue = $event.target.value"
          @blur="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--select"
      >
        <option value="" selected>Не выбрано</option>
        <option v-for="(option, index) in column.options" :key="index" :value="option">
          {{ option }}
        </option>
      </select>

      <!-- Справочник -->
      <select
          v-else-if="column.type === 'reference'"
          ref="inputRef"
          :value="internalEditValue"
          @change="internalEditValue = $event.target.value"
          @blur="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--reference"
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
          class="cell-edit-boolean"
          @click.stop
      >
        <el-switch
            v-if="getBooleanSetting(column, 'displayType') === 'toggle'"
            v-model="internalEditValue"
            :active-value="true"
            :inactive-value="false"
        />
        <el-checkbox
            v-else-if="getBooleanSetting(column, 'displayType') === 'checkbox'"
            v-model="internalEditValue"
            :true-label="true"
            :false-label="false"
        />
        <div v-else-if="getBooleanSetting(column, 'displayType') === 'text'" class="text-boolean">
          <span v-if="internalEditValue">{{ getBooleanSetting(column, 'trueLabel') || 'Да' }}</span>
          <span v-else>{{ getBooleanSetting(column, 'falseLabel') || 'Нет' }}</span>
        </div>
      </div>

      <!-- Дата -->
      <input
          v-else-if="column.type === 'date'"
          ref="inputRef"
          type="date"
          :value="editValueInternal"
          @input="handleDateInput($event.target.value)"
          @blur="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--date"
      />

      <!-- Дата и время -->
      <el-date-picker
          v-else-if="column.type === 'datetime'"
          ref="inputRef"
          v-model="internalEditValue"
          type="datetime"
          :format="getDateTimeFormat(column)"
          :value-format="getDateTimeFormat(column)"
          @change="saveChanges"
          @keyup.esc="cancelEdit"
          class="cell-edit-input cell-edit-input--datetime"
          popper-class="table-cell-datepicker-popper"
      />
    </template>
  </div>
</template>

<script setup>
// Импорты необходимых библиотек и утилит
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Edit, Close, Refresh, Plus, Delete, Rank, MoreFilled,
  Loading, Setting
} from '@element-plus/icons-vue';
// Импортируем компонент для выбора справочника
import ReferenceSelector from './ReferenceSelector.vue';
// Используем относительные пути (./) вместо глобальных (@/)
import {
  formatReferenceDisplay,
  getExampleFormat,
  getAvailableKeys,
  getNestedValue
} from './utils/referenceUtils';
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from './utils/booleanUtils';
import {
  formatDateDisplay,
  formatDateExample,
  convertDateFormat,
  parseFlexibleDate // Импортируем новую функцию для гибкого парсинга дат
} from './utils/dateUtils';
import { referenceApi } from './api/referenceApi';

// Определение входных параметров компонента
const props = defineProps({
  // Значение ячейки
  value: [String, Number, Boolean, Object, null, undefined],
  // Конфигурация колонки (тип, настройки и т.д.)
  column: {
    type: Object,
    required: true
  },
  // Данные всей строки (может использоваться для ссылок на другие поля)
  rowData: {
    type: Object,
    required: true
  },
  // Флаг, указывающий, находится ли ячейка в режиме редактирования
  isEditing: {
    type: Boolean,
    default: false
  },
  // Значение для редактирования
  editValue: {
    default: null
  },
  // Данные справочника
  referenceData: {
    type: Array,
    default: () => []
  },
  // Флаг загрузки данных справочника
  loading: {
    type: Boolean,
    default: false
  }
});

// Определение событий, которые может эмитить компонент
const emit = defineEmits(['start-edit', 'stop-edit', 'update-value', 'reference-selected', 'loading']);

// === Состояние компонента ===
// Флаг, указывающий, находится ли ячейка в режиме редактирования
const isEditing = ref(false);
// Внутреннее состояние значения для редактирования (не зависит напрямую от props.value)
const internalEditValue = ref(null);
// Ссылка на DOM-элемент поля ввода для фокусировки
const inputRef = ref(null);
// Данные для выпадающих списков справочников
const referenceOptions = ref([]);
// Флаг загрузки данных справочника
const loadingReference = ref(false);


// Sets для отслеживания состояния загрузки справочников ===
const loadedReferences = ref(new Set());
const loadingReferences = ref(new Set());

// === Вычисляемые свойства ===

// Внутреннее значение даты для input type="date"
const editValueInternal = computed({
  get: () => {
    if (props.column.type === 'date' && internalEditValue.value) {
      try {
        // Используем parseFlexibleDate для более гибкого парсинга
        const date = parseFlexibleDate(internalEditValue.value);
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  set: (value) => {
    if (value) {
      try {
        const [year, month, day] = value.split('-');
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date;
        }
      } catch (e) {
        internalEditValue.value = null;
      }
    } else {
      internalEditValue.value = null;
    }
  }
});

// === ОБНОВЛЕННОЕ ВЫЧИСЛЯЕМОЕ СВОЙСТВО displayValue ===
const displayValue = computed(() => {
  let result = '—'; // Значение по умолчанию

  try {
    // Обработка типа "Справочник"
    if (props.column.type === 'reference') {
      // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 1: Обработка null/undefined props.value ===
      if (props.value === null || props.value === undefined) {
        console.log("[TableCell/displayValue] Reference value is null/undefined");
        result = 'Не выбрано';
        console.log("[TableCell/displayValue] Returning for reference (null/undef):", result);
        return result; // Важно: выходим early
      }

      let id = null;
      console.log("[TableCell/displayValue] Processing reference. Raw props.value:", props.value, typeof props.value);

      // Определяем ID из разных возможных форматов
      if (typeof props.value === 'object') {
        console.log("[TableCell/displayValue] props.value is an object");
        // Если это объект с полем id
        if (props.value.id !== undefined) {
          id = props.value.id;
          console.log("[TableCell/displayValue] Found id in .id:", id, typeof id);
        }
        // Если это объект с полем value
        else if (props.value.value !== undefined) {
          id = props.value.value;
          console.log("[TableCell/displayValue] Found id in .value:", id, typeof id);
        }
        // Если это объект, но без специальных полей, пытаемся использовать как ID
        else {
          id = props.value;
          console.log("[TableCell/displayValue] Using object as ID:", id, typeof id);
        }
      } else if (typeof props.value === 'number' || typeof props.value === 'string') {
        console.log("[TableCell/displayValue] props.value is a primitive (number/string)");
        id = props.value;
        console.log("[TableCell/displayValue] Using primitive as ID:", id, typeof id);
      } else {
        console.log("[TableCell/displayValue] props.value type not handled for reference:", typeof props.value, props.value);
        // Если тип не поддерживается, показываем сырую строку или '#value'
        result = props.value !== null && props.value !== undefined ? `#${props.value}` : 'Не выбрано';
        console.log("[TableCell/displayValue] Unrecognized type, returning raw/hash value:", result);
        return result; // Важно: выходим early
      }

      // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 2: Проверка id на null/empty после обработки ===
      if (id === null || id === '' || id === undefined) {
        result = 'Не выбрано';
        console.log("[TableCell/displayValue] ID is null/empty/undefined after processing, returning:", result);
      } else {
        console.log("[TableCell/displayValue] Final ID for reference lookup:", id, typeof id);
        // === ИНТЕГРАЦИЯ TABLECELL: Используем referenceData, переданное извне ===
        // Предполагаем, что referenceData передается как prop или через inject/provide
        // В TemplateBuilder.vue это будет referenceOptions.value[column.reference.entityType]
        const referenceDataArray = props.referenceData || []; // Используем props.referenceData
        console.log("[TableCell/displayValue] Using referenceData from props:", referenceDataArray.length, "items");

        // Если данные справочника уже загружены, показываем отформатированное значение
        if (referenceDataArray.length > 0) {
          console.log("[TableCell/displayValue] Reference data is loaded, searching for ID:", id);
          // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 3: Безопасный поиск и сравнение ===
          const item = referenceDataArray.find(opt => {
            // Сравниваем как строки, чтобы избежать проблем с типами (например, id=1 vs itemId="1")
            const match = String(opt.id) === String(id);
            console.log(`[TableCell/displayValue] Comparing opt.id (${opt.id}) with value id (${id}) -> ${match}`);
            return match;
          });

          if (item) {
            // === ИНТЕГРАЦИЯ TABLECELL: Используем props.column для formatReferenceDisplay ===
            result = formatReferenceDisplay(item, props.column); // Передаем props.column
            console.log("[TableCell/displayValue] Found item, formatted display value:", result);
          } else {
            result = `#${id} (не найдено)`;
            console.log("[TableCell/displayValue] Item not found in loaded options, returning:", result);
          }
        } else {
          // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ 4: Если данные справочника еще не загружены, показываем ID ===
          // Вместо "Загрузка..." или "Недоступно" показываем ID, как в предыдущем коде
          result = `#${id}`;
          console.log("[TableCell/displayValue] Reference data not loaded yet, returning ID:", result);

          // === ИНТЕГРАЦИЯ TABLECELL: Запускаем загрузку данных справочника ===
          // Предполагаем, что есть метод loadReferenceData, который вызывается из родителя
          // или доступен через inject/provide. Здесь просто эмитим событие.
          // В TemplateBuilder.vue это будет handled в TableCell @loading или напрямую.
          // Для упрощения, можно не делать этого здесь, а оставить родителю.
          // emit('load-reference', props.column.reference?.entityType);
        }
      }
    }
    // Обработка типа "Boolean"
    else if (props.column.type === 'boolean') {
      console.log("[TableCell/displayValue] Processing boolean...");
      const boolValue = parseBooleanValue(props.value);
      console.log("[TableCell/displayValue] Parsed boolean value:", boolValue);

      if (boolValue === true) {
        result = getBooleanSetting(props.column, 'trueLabel') || 'Да';
        console.log("[TableCell/displayValue] Value is true, returning:", result);
      } else if (boolValue === false) {
        result = getBooleanSetting(props.column, 'falseLabel') || 'Нет';
        console.log("[TableCell/displayValue] Value is false, returning:", result);
      } else {
        result = 'Не выбрано';
        console.log("[TableCell/displayValue] Value is null/undefined, returning:", result);
      }
    }
    // Обработка типа "Дата"
    else if (props.column.type === 'date' && props.value) {
      console.log("[TableCell/displayValue] Processing date...");
      try {
        // Используем parseFlexibleDate для более гибкого парсинга
        const date = parseFlexibleDate(props.value);
        if (!isNaN(date.getTime())) {
          result = formatDate(date, props.column.dateFormat || 'YYYY-MM-DD');
          console.log("[TableCell/displayValue] Formatted date value:", result);
        } else {
          throw new Error('Invalid Date');
        }
      } catch (e) {
        console.error('[TableCell/displayValue] Invalid date value:', props.value, e);
        result = props.value; // Показываем исходное значение, если не распарсилось
      }
    }
    // Обработка типа "Дата и время"
    else if (props.column.type === 'datetime' && props.value) {
      console.log("[TableCell/displayValue] Processing datetime...");
      try {
        // Используем parseFlexibleDate для более гибкого парсинга
        const date = parseFlexibleDate(props.value);
        if (!isNaN(date.getTime())) {
          result = formatDate(date, 'YYYY-MM-DD HH:mm'); // Используем фиксированный формат для datetime
          console.log("[TableCell/displayValue] Formatted datetime value:", result);
        } else {
          throw new Error('Invalid DateTime');
        }
      } catch (e) {
        console.error('[TableCell/displayValue] Invalid datetime value:', props.value, e);
        result = props.value; // Показываем исходное значение, если не распарсилось
      }
    }
    // Обработка типа "Выбор"
    else if (props.column.type === 'select' && props.value !== null && props.value !== undefined) {
      console.log("[TableCell/displayValue] Processing select...");
      console.log("[TableCell/displayValue] Column options:", props.column.options);
      console.log("[TableCell/displayValue] Value to check:", props.value, typeof props.value);
      if (Array.isArray(props.column.options) &&
          props.column.options.includes(props.value)) {
        result = props.value;
        console.log("[TableCell/displayValue] Value found in options, returning:", result);
      } else {
        result = 'Недопустимое значение';
        console.log("[TableCell/displayValue] Value NOT found in options, returning:", result);
        console.log("[TableCell/displayValue] Options array:", props.column.options);
        console.log("[TableCell/displayValue] Type of props.value:", typeof props.value);
        console.log("[TableCell/displayValue] Strict equality check results:", props.column.options.map(opt => `${opt} === ${props.value} ? ${opt === props.value}`));
        console.log("[TableCell/displayValue] Loose equality check results:", props.column.options.map(opt => `${opt} == ${props.value} ? ${opt == props.value}`));
      }
    }
    // Для остальных типов
    else {
      console.log("[TableCell/displayValue] Processing default type...");
      result = props.value !== null && props.value !== undefined ? props.value : '—';
      console.log("[TableCell/displayValue] Default value processing, returning:", result);
    }
  } catch (error) {
    console.error("[TableCell/displayValue] Error in displayValue computation:", error);
    result = `[Ошибка: ${error.message}]`;
  } finally {
    console.log("[TableCell/displayValue] Final result:", result);
  }

  return result;
});
// === КОНЕЦ ОБНОВЛЕННОГО displayValue ===

// === Следим за изменениями props.value ===
watch(() => props.value, (newVal) => {
  // При изменении входного значения обновляем внутреннее состояние

  // === Проверка на null/undefined в самом начале ===
  if (newVal === null || newVal === undefined) {
    // Если новое значение null/undefined, устанавливаем внутреннее значение в null
    if (props.column.type === 'reference') {
      internalEditValue.value = null;
    } else if (props.column.type === 'boolean') {
      internalEditValue.value = false; // или null, в зависимости от вашей логики
    } else if (props.column.type === 'date' || props.column.type === 'datetime') {
      internalEditValue.value = null;
    } else {
      internalEditValue.value = newVal; // null или undefined
    }
    return; // Прекращаем выполнение watch-обработчика
  }

  if (props.column.type === 'reference') {
    let id = null;

    // === Безопасный доступ к свойствам объекта ===
    // Проверяем тип newVal перед доступом к свойствам
    if (typeof newVal === 'object' && newVal !== null) { // Добавлена проверка newVal !== null
      if (newVal.id !== undefined) {
        id = newVal.id;
      } else if (newVal.value !== undefined) {
        id = newVal.value;
      } else {
        id = newVal; // Используем сам объект, если он не имеет id/value
      }
    } else if (typeof newVal === 'number' || typeof newVal === 'string') {
      id = newVal;
    }
    // === КОНЕЦ ИСПРАВЛЕНИЯ ===

    internalEditValue.value = id;
  } else if (props.column.type === 'boolean') {
    internalEditValue.value = parseBooleanValue(newVal) ?? false;
  } else if (props.column.type === 'date' || props.column.type === 'datetime') {
    if (newVal) {
      try {
        const date = parseFlexibleDate(newVal); // Используем parseFlexibleDate
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date;
        } else {
          internalEditValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
      }
    } else {
      internalEditValue.value = null;
    }
  } else {
    internalEditValue.value = newVal;
  }
}, { immediate: true });

// === Методы компонента ===

// Переключение режима редактирования
const toggleEdit = () => {
  console.log("[TableCell] toggleEdit called. Current isEditing:", isEditing.value);
  if (isEditing.value) {
    console.log("[TableCell] Already editing, returning.");
    return;
  }

  // Для справочника загружаем данные при активации
  if (props.column.type === 'reference' && referenceOptions.value.length === 0) {
    console.log("[TableCell] Reference column, loading data for edit...");
    loadReferenceData();
  }

  isEditing.value = true;
  console.log("[TableCell] isEditing set to true.");

  // Устанавливаем значение для редактирования
  if (props.column.type === 'reference') {
    let id = null;

    if (typeof props.value === 'object') {
      if (props.value.id !== undefined) {
        id = props.value.id;
      } else if (props.value.value !== undefined) {
        id = props.value.value;
      } else {
        id = props.value;
      }
    } else if (typeof props.value === 'number' || typeof props.value === 'string') {
      id = props.value;
    }

    internalEditValue.value = id;
  } else if (props.column.type === 'boolean') {
    internalEditValue.value = parseBooleanValue(props.value) ?? false;
  } else if (props.column.type === 'date' || props.column.type === 'datetime') {
    if (props.value) {
      try {
        // Используем parseFlexibleDate для более гибкого парсинга
        const date = parseFlexibleDate(props.value);
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date;
        } else {
          internalEditValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
      }
    } else {
      internalEditValue.value = null;
    }
  } else {
    internalEditValue.value = props.value;
  }

  // Фокусируем поле ввода
  nextTick(() => {
    if (inputRef.value) {
      // inputRef.value может быть HTMLElement или Vue Component instance
      let inputElement = inputRef.value;
      // Если это Vue компонент (например, el-date-picker), пытаемся получить внутренний input
      if (inputElement.$el) {
        inputElement = inputElement.$el.querySelector('input') || inputElement.$el;
      } else if (inputElement.$refs && inputElement.$refs.input) {
        // Для некоторых компонентов Element Plus
        inputElement = inputElement.$refs.input;
      }

      if (inputElement && inputElement.focus) {
        inputElement.focus();
        if (inputElement.select) {
          inputElement.select();
        }
      }
    }
  });

  console.log("[TableCell] Emitting 'start-edit'");
  emit('start-edit');
};

// Фокусируем поле ввода
const focusInput = () => {
  nextTick(() => {
    if (!inputRef.value) {
      console.warn("[focusInput] inputRef is null or undefined");
      return;
    }

    try {
      let inputElement = inputRef.value;

      // === Попытка получить нативный DOM-элемент input/select/textarea ===

      // Случай 1: inputRef.value - это нативный DOM-элемент (input, select, textarea)
      // Проверяем по наличию свойств typical для input элементов
      if (inputElement instanceof HTMLElement &&
          (inputElement.tagName === 'INPUT' ||
              inputElement.tagName === 'SELECT' ||
              inputElement.tagName === 'TEXTAREA' ||
              inputElement.focus)) {
        // Вероятно, это уже нужный нам элемент
        console.log("[focusInput] Native input element found directly");
      }
      // Случай 2: inputRef.value - это экземпляр Vue-компонента (например, el-input, el-select)
      else if (inputElement.$el) {
        console.log("[focusInput] Vue component instance detected ($el exists)");
        // $el - это корневой DOM-элемент компонента

        // Попробуем найти внутренний <input>, <select> или <textarea>
        if (inputElement.$el instanceof HTMLElement) {
          // Ищем input/select/textarea внутри $el
          inputElement = inputElement.$el.querySelector('input, select, textarea') || inputElement.$el;
          console.log("[focusInput] Found inner input/select/textarea or fell back to $el");
        } else {
          // Если $el не HTMLElement (редко, но мало ли), используем его напрямую
          inputElement = inputElement.$el;
          console.log("[focusInput] Using $el directly (might not be HTMLElement)");
        }
      }
      // Случай 3: inputRef.value - это объект с $refs (устаревший способ доступа к дочерним элементам)
      else if (inputElement.$refs && inputElement.$refs.input) {
        console.log("[focusInput] Accessing via $refs.input (legacy)");
        inputElement = inputElement.$refs.input;
      }
          // Случай 4: inputRef.value - это объект с внутренним свойством, содержащим элемент (например, для el-date-picker)
      // Попробуем общий подход: ищем среди свойств объекта что-то, похожее на HTMLElement
      else if (typeof inputElement === 'object') {
        console.log("[focusInput] Generic object, attempting deep search");
        let found = false;
        // Рекурсивный поиск может быть тяжелым, лучше ограничиться поверхностным
        for (const key in inputElement) {
          if (inputElement.hasOwnProperty(key)) {
            const potentialElement = inputElement[key];
            // Проверяем, является ли свойство HTMLElement или имеет $el
            if (potentialElement instanceof HTMLElement) {
              inputElement = potentialElement;
              found = true;
              console.log(`[focusInput] Found HTMLElement via property '${key}'`);
              break; // Нашли, прекращаем поиск
            } else if (potentialElement && potentialElement.$el && potentialElement.$el instanceof HTMLElement) {
              inputElement = potentialElement.$el;
              found = true;
              console.log(`[focusInput] Found component via property '${key}.$el'`);
              break; // Нашли, прекращаем поиск
            }
          }
        }
        if (!found) {
          // Если не нашли специфичный элемент, используем inputRef.value как есть
          // и надеемся, что он имеет методы focus/select или это HTMLElement
          console.log("[focusInput] Deep search unsuccessful, using inputRef.value as is");
          // inputElement остается равным inputRef.value
        }
      }
      // Случай 5: inputRef.value - примитив или другой тип
      else {
        console.log(`[focusInput] inputRef.value is of unexpected type: ${typeof inputElement}. Attempting to use as is.`);
        // inputElement остается равным inputRef.value
        // Вероятно, это ошибка в логике выше или неожиданный тип, но попробуем продолжить
      }

      // === Попытка сфокусироваться и выделить текст ===

      // Проверка 1: Является ли inputElement HTMLElement?
      if (inputElement instanceof HTMLElement) {
        // console.log("[focusInput] Final element is HTMLElement, attempting focus/select");
        if (typeof inputElement.focus === 'function') {
          inputElement.focus();
          // Попытка выделить текст, если метод select существует
          if (typeof inputElement.select === 'function') {
            // Небольшая задержка может помочь в некоторых случаях
            setTimeout(() => {
              try {
                inputElement.select();
              } catch (selectErr) {
                console.warn("[focusInput] Could not select text:", selectErr);
              }
            }, 0);
          } else {
            // console.log("[focusInput] select() method not available on element");
          }
        } else {
          console.warn("[focusInput] focus() method not available on HTMLElement");
          // Альтернатива: попробовать .click(), если это кнопка или элемент, реагирующий на клик?
          // if (typeof inputElement.click === 'function') inputElement.click();
        }
      }
      // Проверка 2: Является ли inputElement объектом с методом focus (например, компонент)?
      else if (inputElement && typeof inputElement.focus === 'function') {
        // console.log("[focusInput] Final element is an object with focus(), calling it");
        inputElement.focus();
        // Попытка вызвать select, если он есть
        if (typeof inputElement.select === 'function') {
          setTimeout(() => {
            try {
              inputElement.select();
            } catch (selectErr) {
              console.warn("[focusInput] Could not select text on object:", selectErr);
            }
          }, 0);
        }
      } else {
        console.warn("[focusInput] Could not determine how to focus on the final element:", inputElement);
        console.warn("[focusInput] Type:", typeof inputElement);
        console.warn("[focusInput] Instanceof HTMLElement:", inputElement instanceof HTMLElement);
        if (inputElement) {
          console.warn("[focusInput] Keys/Methods available:", Object.getOwnPropertyNames(inputElement).filter(name => typeof inputElement[name] === 'function'));
        }
      }

    } catch (error) {
      // Ловим любые ошибки, чтобы не "ломать" основной поток выполнения
      console.error("[focusInput] An error occurred during focusing logic:", error);
    }
  });
};

// Обработка ввода даты
const handleDateInput = (value) => {
  if (value) {
    try {
      const [year, month, day] = value.split('-');
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        internalEditValue.value = date;
      }
    } catch (e) {
      internalEditValue.value = null;
    }
  } else {
    internalEditValue.value = null;
  }
};

// Сохранение изменений
const saveChanges = () => {
  console.log("[TableCell] saveChanges called. Current editValue:", internalEditValue.value);
  let valueToSave = internalEditValue.value;

  // Для reference сохраняем ID как есть
  if (props.column.type === 'reference') {
    if (valueToSave === '' || valueToSave === null || valueToSave === undefined) {
      valueToSave = null;
    }
  }

  // Для boolean преобразуем в правильный тип
  if (props.column.type === 'boolean') {
    const parsedValue = parseBooleanValue(valueToSave);
    valueToSave = parsedValue !== null ? parsedValue : false;
  }

  // Для date и datetime преобразуем в стандартный формат для отправки на сервер
  if ((props.column.type === 'date' || props.column.type === 'datetime') && valueToSave) {
    if (valueToSave instanceof Date) {
      const year = valueToSave.getFullYear();
      const month = (valueToSave.getMonth() + 1).toString().padStart(2, '0');
      const day = valueToSave.getDate().toString().padStart(2, '0');

      if (props.column.type === 'datetime') {
        const hours = valueToSave.getHours().toString().padStart(2, '0');
        const minutes = valueToSave.getMinutes().toString().padStart(2, '0');
        valueToSave = `${year}-${month}-${day} ${hours}:${minutes}`;
      } else {
        valueToSave = `${year}-${month}-${day}`;
      }
    } else if (typeof valueToSave === 'string') {
      // Пытаемся распарсить строку в дату
      const date = parseFlexibleDate(valueToSave); // Используем parseFlexibleDate
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        if (props.column.type === 'datetime') {
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          valueToSave = `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          valueToSave = `${year}-${month}-${day}`;
        }
      }
    }
  }

  isEditing.value = false;
  console.log("[TableCell] Emitting 'update-value' with value:", valueToSave);
  emit('update-value', valueToSave);
};

// Отмена редактирования
const cancelEdit = () => {
  console.log("[TableCell] cancelEdit called.");
  isEditing.value = false;

  // Восстанавливаем исходное значение
  if (props.column.type === 'reference') {
    let id = null;

    if (typeof props.value === 'object') {
      if (props.value.id !== undefined) {
        id = props.value.id;
      } else if (props.value.value !== undefined) {
        id = props.value.value;
      } else {
        id = props.value;
      }
    } else if (typeof props.value === 'number' || typeof props.value === 'string') {
      id = props.value;
    }

    internalEditValue.value = id;
  } else if (props.column.type === 'boolean') {
    internalEditValue.value = parseBooleanValue(props.value) ?? false;
  } else if (props.column.type === 'date' || props.column.type === 'datetime') {
    if (props.value) {
      try {
        // Используем parseFlexibleDate для более гибкого парсинга
        const date = parseFlexibleDate(props.value);
        if (!isNaN(date.getTime())) {
          internalEditValue.value = date;
        } else {
          internalEditValue.value = null;
        }
      } catch (e) {
        internalEditValue.value = null;
      }
    } else {
      internalEditValue.value = null;
    }
  } else {
    internalEditValue.value = props.value;
  }

  console.log("[TableCell] Emitting 'stop-edit'");
  emit('stop-edit');
};

// === Методы для работы со справочниками ===

/**
 * Загрузка данных справочника
 * @param {string} entityType - Название модели в snake_case (например, 'accessory', 'brand')
 */
const loadReferenceData = async (entityType) => {
  // 1. Проверяем, что колонка типа 'reference' и задан entityType
  if (props.column.type !== 'reference' || !props.column.reference?.entityType) {
    console.log("[TableCell] Not a reference column or no entityType, skipping load.");
    return;
  }

  // 2. Получаем cleanEntityType
  const cleanEntityType = props.column.reference.entityType.replace(/\/$/, '');
  console.log(`[TableCell] Loading reference data for type: ${cleanEntityType}`);

  // 3. Проверяем, не загружен ли уже и не загружается ли
  if (loadedReferences.value.has(cleanEntityType) || loadingReferences.value.has(cleanEntityType)) {
    console.log(`[TableCell] Reference data for ${cleanEntityType} already loaded/loading.`);
    return;
  }

  try {
    // 4. Устанавливаем состояние загрузки
    loadingReferences.value.add(cleanEntityType);
    loadingReference.value = true;
    emit('loading', true);

    console.log(`[TableCell] Starting reference data load for ${cleanEntityType}...`);

    // 5. Выполняем асинхронный запрос к API через referenceApi
    const response = await referenceApi.getData(cleanEntityType);
    console.log(`[TableCell] Reference data loaded for ${cleanEntityType}:`, response.data?.length, 'items');

    // 6. Сохраняем данные
    referenceOptions.value = response.data || [];
    loadedReferences.value.add(cleanEntityType);
    console.log(`[TableCell] referenceOptions updated for ${cleanEntityType}.`);

  } catch (error) {
    console.error(`[TableCell] Ошибка загрузки данных справочника (${cleanEntityType}):`, error);
    ElMessage.error('Ошибка загрузки справочника');

    // 7. Даже при ошибке помечаем как загруженный, чтобы не пытаться загружать повторно
    loadedReferences.value.add(cleanEntityType);

  } finally {
    // 8. Сбрасываем состояние загрузки
    loadingReferences.value.delete(cleanEntityType);
    loadingReference.value = false;
    emit('loading', false);
    console.log(`[TableCell] Finished reference data load attempt for ${cleanEntityType}.`);
  }
};

// === Вспомогательные функции ===

// Форматирование даты
const formatDate = (date, format) => {
  if (!date) return '';

  // Если это строка, преобразуем в объект Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Проверяем валидность даты
  if (isNaN(dateObj.getTime())) return date;

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD MMM YYYY':
      return `${day} ${monthNames[dateObj.getMonth()]} ${year}`;
    case 'DD MMMM YYYY':
      return `${day} ${monthNamesFull[dateObj.getMonth()]} ${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

// Получение формата для datetime picker
const getDateTimeFormat = (column) => {
  if (column.type === 'datetime') {
    return 'YYYY-MM-DD HH:mm';
  }
  return 'YYYY-MM-DD';
};
// === Конец компонента ===
</script>

<style lang="scss" scoped>
/* ==== Основные стили для wrapper и display ==== */
.table-cell-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  padding: 4px 8px; /* Переносим padding сюда */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .table-cell-display {
    /* display: block; width: 100%; height: 100%; padding: ...; */
    /* Заменяем на более простое */
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background-color: #f5f7fa;
  }
}

/* ==== Стили для редактируемых полей ==== */
/* Основной контейнер для редактируемого поля */
.cell-edit-input,
.cell-edit-boolean {
  /* Абсолютное позиционирование относительно .table-cell-wrapper */
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;  /* Занимает всю ширину ячейки */
  height: 100% !important; /* Занимает всю высоту ячейки */
  margin: 0 !important; /* Убираем возможные margin */
  padding: 4px 8px !important; /* Внутренние отступы */
  box-sizing: border-box !important; /* Включаем padding/border в размеры */
  border: 1px solid #409eff !important; /* Добавляем явную рамку для видимости */
  outline: none !important;
  font-family: inherit !important; /* Наследуем шрифт */
  font-size: inherit !important; /* Наследуем размер шрифта */
  background-color: #fff !important; /* Фон */
  color: inherit !important; /* Цвет текста */
  z-index: 1000 !important; /* Высокий z-index для отображения поверх */
  /* Убираем все border-radius */
  border-radius: 0 !important;


  /* Стили для конкретных типов полей */
  &.cell-edit-input--text,
  &.cell-edit-input--number,
  &.cell-edit-input--date {
    /* Для простых input полей */
    /* padding и box-sizing уже заданы выше */
  }

  &.cell-edit-input--select,
  &.cell-edit-input--reference {
    /* Для select полей */
    /* padding и box-sizing уже заданы выше */
    /* Убираем padding слева/справа, так как у select есть свои внутренние отступы */
    /* padding: 0 4px !important; */ /* Попробуем оставить общий padding */
  }

  &.cell-edit-input--datetime {
    /* Для el-date-picker */
    /* padding и box-sizing уже заданы выше */
    /* Убираем padding, так как el-date-picker сам его имеет */
    /* padding: 0 !important; */ /* Попробуем оставить общий padding */
  }


  /* Очень важные стили для Element Plus компонентов */
  /* Мы пытаемся стилизовать ВСЕ внутренности */
  /* :deep не всегда работает корректно в scoped стилях, поэтому используем !important */
  :deep(*) {
    width: 100% !important;
    height: 100% !important;
    min-width: unset !important;
    min-height: unset !important;
    max-width: 100% !important;
    max-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important; /* Будем использовать padding у родителя */
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    border-radius: 0 !important;
  }

  /* Стили для input внутри */
  :deep(input),
  :deep(select),
  :deep(textarea),
  :deep(.el-input__inner),
  :deep(.el-input-number__inner),
  :deep(.el-date-editor__inner),
  :deep(.el-select__inner) {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important; /* padding у родителя */
    margin: 0 !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    font-family: inherit !important;
    font-size: inherit !important;
    background-color: transparent !important; /* Наследуем фон от родителя */
    color: inherit !important;
  }

  /* Стили для select внутри .cell-edit-input */
  :deep(.el-select) {
    width: 100% !important;
    height: 100% !important;
    .el-input__wrapper {
      width: 100% !important;
      height: 100% !important;
      box-shadow: none !important;
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      .el-input__inner {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important; /* padding у родителя */
        border: none !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
        background-color: transparent !important;
        color: inherit !important;
      }
    }
  }

  /* Стили для date-picker внутри .cell-edit-input */
  :deep(.el-date-editor) {
    width: 100% !important;
    height: 100% !important;
    .el-input__wrapper {
      width: 100% !important;
      height: 100% !important;
      box-shadow: none !important;
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      .el-input__inner {
        width: 100% !important;
        height: 100% !important;
        padding: 0 !important; /* padding у родителя */
        border: none !important;
        box-shadow: none !important;
        box-sizing: border-box !important;
        background-color: transparent !important;
        color: inherit !important;
      }
    }
  }
}

.cell-edit-boolean {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important; /* Центрируем по горизонтали и вертикали */
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important; /* padding у родителя */
  box-sizing: border-box !important;
  border: 1px solid #409eff !important; /* Добавляем явную рамку для видимости */
  background-color: #fff !important;
  z-index: 1000 !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;

  .text-boolean {
    cursor: pointer;
    padding: 2px 4px;
    width: 100%;
    text-align: center; /* Центрируем текст внутри */

    span {
      font-size: 13px;
    }
  }
}
/* ==== Конец стилей для редактируемых полей ==== */
</style>
