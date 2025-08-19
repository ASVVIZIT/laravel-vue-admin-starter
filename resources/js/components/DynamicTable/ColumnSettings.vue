<template>
  <div class="column-settings">
    <h4>Настройки колонки: {{ column.label }}</h4>

    <el-form label-position="top" class="settings-form">
      <el-form-item label="Название колонки">
        <el-input
            v-model="localColumn.label"
            placeholder="Введите название колонки"
            @blur="emitUpdate"
        />
      </el-form-item>

      <el-form-item label="Тип колонки">
        <el-select
            v-model="localColumn.type"
            @change="handleColumnTypeChange"
            placeholder="Выберите тип колонки"
        >
          <el-option
              v-for="type in columnTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>

      <!-- Текстовые настройки -->
      <div v-if="localColumn.type === 'text'" class="text-settings">
        <el-form-item label="Тип данных">
          <el-select
              v-model="localColumn.dataType"
              placeholder="Выберите тип данных"
          >
            <el-option
                v-for="dataType in textDataTypes"
                :key="dataType.value"
                :label="dataType.label"
                :value="dataType.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Числовые настройки -->
      <div v-if="localColumn.type === 'number'" class="number-settings">
        <el-form-item label="Единица измерения">
          <el-input
              v-model="localColumn.unit"
              placeholder="Введите единицу измерения (кг, см, шт и т.д.)"
              @blur="emitUpdate"
          />
        </el-form-item>
      </div>

      <!-- Настройки выбора -->
      <div v-if="localColumn.type === 'select'" class="select-settings">
        <el-form-item label="Варианты выбора">
          <div class="options-list">
            <draggable
                v-model="localColumn.options"
                @end="emitUpdate"
                handle=".option-handle"
                ghost-class="drag-ghost"
                chosen-class="drag-chosen"
                drag-class="drag-class"
                item-key="index"
            >
              <template #item="{ element, index }">
                <div class="option-item">
                  <div class="option-handle">
                    <el-icon>
                      <Rank />
                    </el-icon>
                  </div>
                  <el-input
                      v-model="localColumn.options[index]"
                      @blur="emitUpdate"
                  />
                  <el-button
                      type="danger"
                      size="small"
                      circle
                      @click="removeOption(index)"
                  >
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </template>
            </draggable>

            <el-button
                type="primary"
                size="small"
                @click="addOption"
                class="add-option-btn"
            >
              <el-icon>
                <Plus />
              </el-icon>
              Добавить вариант
            </el-button>
          </div>
        </el-form-item>
      </div>

      <!-- Настройки даты -->
      <div v-if="localColumn.type === 'date' || localColumn.type === 'datetime'" class="date-settings">
        <el-form-item label="Формат даты">
          <el-select
              v-model="localColumn.dateFormat"
              placeholder="Выберите формат даты"
              @change="emitUpdate"
          >
            <el-option
                v-for="format in dateFormats"
                :key="format.value"
                :label="`${format.label} (${format.example})`"
                :value="format.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Настройки булева значения -->
      <div v-if="localColumn.type === 'boolean'" class="boolean-settings">
        <el-form-item label="Тип отображения">
          <el-radio-group
              v-model="localBooleanSettings.displayType"
              @change="handleBooleanSettingChange('displayType', $event)"
          >
            <el-radio label="toggle">Переключатель</el-radio>
            <el-radio label="checkbox">Чекбокс</el-radio>
            <el-radio label="text">Текст</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
            label="Подписи"
            v-if="localBooleanSettings.displayType === 'text'"
        >
          <div class="boolean-text-settings">
            <div class="text-input">
              <span>Да:</span>
              <el-input
                  v-model="localBooleanSettings.trueLabel"
                  @input="handleBooleanSettingChange('trueLabel', $event)"
                  size="small"
                  placeholder="Да"
              />
            </div>
            <div class="text-input">
              <span>Нет:</span>
              <el-input
                  v-model="localBooleanSettings.falseLabel"
                  @input="handleBooleanSettingChange('falseLabel', $event)"
                  size="small"
                  placeholder="Нет"
              />
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Настройки справочника -->
      <ReferenceColumnSettings
          v-if="localColumn.type === 'reference'"
          :column="localColumn"
          @update:column="handleReferenceUpdate"
      />
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';
import ReferenceColumnSettings from './ReferenceColumnSettings.vue';
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from './utils/booleanUtils';

// Типы колонок
const columnTypes = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'select', label: 'Выбор' },
  { value: 'date', label: 'Дата' },
  { value: 'datetime', label: 'Дата и время' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'reference', label: 'Справочник' }
];

// Типы данных для текста
const textDataTypes = [
  { value: 'string', label: 'Строка' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Телефон' },
  { value: 'url', label: 'URL' }
];

// Форматы даты
const dateFormats = [
  { value: 'YYYY-MM-DD', label: 'Год-Месяц-День', example: '2023-10-15' },
  { value: 'DD.MM.YYYY', label: 'День.Месяц.Год', example: '15.10.2023' },
  { value: 'MM/DD/YYYY', label: 'Месяц/День/Год', example: '10/15/2023' },
  { value: 'DD MMM YYYY', label: 'День Месяц Год', example: '15 Oct 2023' },
  { value: 'YYYY/MM/DD', label: 'Год/Месяц/День', example: '2023/10/15' },
  { value: 'DD-MM-YYYY', label: 'День-Месяц-Год', example: '15-10-2023' },
  { value: 'YYYY-MM-DD HH:mm', label: 'Год-Месяц-День Часы:Минуты', example: '2023-10-15 14:30' },
  { value: 'HH:mm', label: 'Часы:Минуты', example: '14:30' }
];

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:column']);

// Состояние
const localColumn = ref(JSON.parse(JSON.stringify(props.column)));

// Вычисляемое свойство для безопасного доступа к настройкам boolean
const localBooleanSettings = computed({
  get: () => {
    if (localColumn.value.type !== 'boolean') {
      return {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
    }

    return {
      displayType: getBooleanSetting(localColumn.value, 'displayType') || 'toggle',
      trueLabel: getBooleanSetting(localColumn.value, 'trueLabel') || 'Да',
      falseLabel: getBooleanSetting(localColumn.value, 'falseLabel') || 'Нет'
    };
  },
  set: (newSettings) => {
    if (localColumn.value.type !== 'boolean') {
      return;
    }

    // Создаем объект настроек
    const settings = {
      displayType: newSettings.displayType || 'toggle',
      trueLabel: newSettings.trueLabel || 'Да',
      falseLabel: newSettings.falseLabel || 'Нет'
    };

    // Устанавливаем настройки в колонку
    setBooleanSetting(localColumn.value, settings);
  }
});

// Методы
const handleColumnTypeChange = () => {
  // Инициализация специфичных полей для каждого типа
  switch (localColumn.value.type) {
    case 'reference':
      localColumn.value.reference = localColumn.value.reference || {
        entityType: '',
        displayFormat: ''
      };
      break;

    case 'boolean':
      localColumn.value.booleanSettings = localColumn.value.booleanSettings || {
        displayType: 'toggle',
        trueLabel: 'Да',
        falseLabel: 'Нет'
      };
      break;

    case 'date':
    case 'datetime':
      localColumn.value.dateFormat = localColumn.value.dateFormat ||
          (localColumn.value.type === 'datetime' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
      break;

    case 'select':
      localColumn.value.options = localColumn.value.options || [];
      break;

    case 'number':
      localColumn.value.unit = localColumn.value.unit || '';
      break;

    case 'text':
      localColumn.value.dataType = localColumn.value.dataType || 'string';
      break;
  }

  emitUpdate();
};

const addOption = () => {
  if (localColumn.value.type === 'select') {
    const newOption = `Вариант ${localColumn.value.options.length + 1}`;
    localColumn.value.options.push(newOption);
    emitUpdate();
  }
};

const removeOption = (index) => {
  if (localColumn.value.type === 'select') {
    localColumn.value.options.splice(index, 1);
    emitUpdate();
  }
};

const handleBooleanSettingChange = (setting, value) => {
  const newSettings = { ...localBooleanSettings.value };
  newSettings[setting] = value;

  // Создаем объект настроек
  const settings = {
    displayType: newSettings.displayType || 'toggle',
    trueLabel: newSettings.trueLabel || 'Да',
    falseLabel: newSettings.falseLabel || 'Нет'
  };

  // Устанавливаем настройки в колонку
  setBooleanSetting(localColumn.value, settings);
  emitUpdate();
};

const handleReferenceUpdate = (updatedColumn) => {
  localColumn.value = updatedColumn;
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:column', JSON.parse(JSON.stringify(localColumn.value)));
};

// Следим за изменениями колонки извне
watch(() => props.column, (newVal) => {
  localColumn.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });
</script>

<style lang="scss" scoped>
.column-settings {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;

h4 {
  margin-bottom: 15px;
  color: #303133;
}

.settings-form {
  max-width: 600px;

.options-list {
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

.option-handle {
  cursor: move;
  padding: 0 8px;
  color: #909399;

.el-icon {
  font-size: 16px;
}
}

.el-input {
  flex: 1;
  margin: 0 8px;
}
}

.add-option-btn {
  margin-top: 10px;
}
}

.boolean-text-settings {
  display: flex;
  gap: 15px;

.text-input {
  display: flex;
  align-items: center;
  gap: 5px;

span {
  width: 40px;
  font-weight: 500;
}
}
}
}
}
</style>
