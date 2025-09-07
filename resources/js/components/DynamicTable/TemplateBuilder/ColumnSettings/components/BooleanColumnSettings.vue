<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnSettings/components/BooleanColumnSettings.vue -->
<template>
  <div class="boolean-column-settings">
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

    <div v-if="localBooleanSettings.displayType === 'text'" class="boolean-text-settings">
      <el-form-item label="Тексты">
        <div class="text-inputs">
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
  </div>
</template>

<script setup>
/**
 * @component BooleanColumnSettings
 *
 * Компонент настроек для булевых колонок.
 * Позволяет выбрать тип отображения и настроить подписи.
 *
 * @props {Object} column - Объект колонки типа "boolean"
 *
 * @emits {Event} update:column - Событие обновления колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, computed, watch } from 'vue';
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from '@/components/DynamicTable/utils/booleanUtils';

const props = defineProps({
  /**
   * Объект колонки типа "boolean"
   * @type {Object}
   */
  column: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  /**
   * Событие обновления колонки
   * @param {Object} updatedColumn - Объект обновленной колонки
   */
  'update:column'
]);

const localColumn = ref({ ...props.column });

const localBooleanSettings = computed({
  get: () => {
    if (!localColumn.value || localColumn.value.type !== 'boolean') {
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
    if (!localColumn.value || localColumn.value.type !== 'boolean') {
      return;
    }
    const settings = {
      displayType: newSettings.displayType || 'toggle',
      trueLabel: newSettings.trueLabel || 'Да',
      falseLabel: newSettings.falseLabel || 'Нет'
    };
    setBooleanSetting(localColumn.value, settings);
    handleUpdate();
  }
});

const handleUpdate = () => {
  emit('update:column', JSON.parse(JSON.stringify(localColumn.value)));
};

const handleBooleanSettingChange = (setting, value) => {
  const newSettings = { ...localBooleanSettings.value };
  newSettings[setting] = value;
  localBooleanSettings.value = newSettings; // Это вызовет setter computed свойства
  // handleUpdate вызывается внутри setter
};

watch(() => props.column, (newVal) => {
  localColumn.value = { ...newVal };
}, { deep: true });
</script>

<style lang="scss" scoped>
.boolean-column-settings {
  .el-form-item {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      padding-bottom: 4px;
    }

    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .el-radio {
        margin-right: 0;
      }
    }
  }

  .boolean-text-settings {
    .text-inputs {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .text-input {
        display: flex;
        align-items: center;
        gap: 5px;

        span {
          width: 35px;
          font-weight: 500;
          font-size: 12px;
        }

        .el-input {
          flex: 1;

          :deep(.el-input__inner) {
            height: 24px;
            line-height: 24px;
            padding: 0 6px;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
