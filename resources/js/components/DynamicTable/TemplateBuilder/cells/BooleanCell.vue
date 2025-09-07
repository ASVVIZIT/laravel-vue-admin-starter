<!-- resources/js/components/DynamicTable/TemplateBuilder/cells/BooleanCell.vue -->
<template>
  <div @click="handleClick" class="boolean-cell">
    <span v-if="!isEditing" class="boolean-display">
      {{ displayValue }}
    </span>
    <div v-else class="boolean-editing">
      <el-switch
          v-if="getBooleanSetting(column, 'displayType') === 'toggle'"
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          :active-value="true"
          :inactive-value="false"
          size="small"
          class="cell-edit-input cell-edit-input--switch"
      />
      <el-checkbox
          v-else-if="getBooleanSetting(column, 'displayType') === 'checkbox'"
          ref="editInput"
          v-model="editValue"
          @change="handleUpdateValue"
          :true-label="true"
          :false-label="false"
          size="small"
          class="cell-edit-input cell-edit-input--checkbox"
      />
      <div
          v-else-if="getBooleanSetting(column, 'displayType') === 'text'"
          class="boolean-text-editing"
          @click="toggleTextValue"
      >
        <span>{{ editValue ? getBooleanSetting(column, 'trueLabel') || 'Да' : getBooleanSetting(column, 'falseLabel') || 'Нет' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import {
  getBooleanSetting,
  setBooleanSetting,
  parseBooleanValue
} from '@/components/DynamicTable/utils/booleanUtils';

const props = defineProps({
  value: { type: [String, Number, Boolean, Object], default: null },
  column: { type: Object, required: true },
  isEditing: { type: Boolean, default: false }
});

const emit = defineEmits(['update-value', 'start-edit']);

const editValue = ref(false);
const editInput = ref(null);

const displayValue = computed(() => {
  const boolValue = parseBooleanValue(props.value);
  if (boolValue === true) {
    return getBooleanSetting(props.column, 'trueLabel') || 'Да';
  } else if (boolValue === false) {
    return getBooleanSetting(props.column, 'falseLabel') || 'Нет';
  } else {
    return 'Не выбрано';
  }
});

const handleClick = () => {
  if (!props.isEditing) {
    emit('start-edit');
  }
};

const handleUpdateValue = (newValue) => {
  emit('update-value', newValue);
};

const toggleTextValue = () => {
  editValue.value = !editValue.value;
  handleUpdateValue(editValue.value);
};

const focusInput = () => {
  nextTick(() => {
    if (editInput.value && editInput.value.$el) {
      // Для switch и checkbox фокусировка происходит автоматически
      // Для текстового режима фокус не нужен
      const input = editInput.value.$el.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  });
};

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    editValue.value = parseBooleanValue(props.value) ?? false;
    focusInput();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.boolean-cell {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  padding: 0;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;

  .boolean-display {
    display: block;
    width: 100%;
    height: 100%;
    padding: 4px 8px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    vertical-align: middle;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .boolean-editing {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    padding: 0;
    box-sizing: border-box;
    border: 1px solid #409eff;
    border-radius: 0;
    background-color: #fff;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .cell-edit-input {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      border: none !important;
      outline: none !important;
      font-family: inherit !important;
      font-size: inherit !important;
      background-color: transparent !important;
      color: inherit !important;
      border-radius: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-switch) {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-switch__core {
          width: 40px !important;
          height: 20px !important;
          margin: 0 auto !important;
          border-radius: 10px !important;
          border: 1px solid #dcdfe6 !important;
          background-color: #dcdfe6 !important;
          position: relative !important;
          cursor: pointer !important;
          transition: border-color .3s,background-color .3s !important;
          vertical-align: middle !important;

          .el-switch__action {
            width: 16px !important;
            height: 16px !important;
            position: absolute !important;
            top: 1px !important;
            left: 1px !important;
            border-radius: 100% !important;
            background-color: #fff !important;
            transition: transform .3s !important;
            z-index: 1 !important;
          }
        }

        &.is-checked {
          .el-switch__core {
            border-color: #409eff !important;
            background-color: #409eff !important;

            .el-switch__action {
              transform: translateX(20px) !important;
            }
          }
        }
      }

      :deep(.el-checkbox) {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        border: none !important;
        outline: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-checkbox__input {
          white-space: nowrap;
          cursor: pointer;
          outline: none;
          display: inline-flex;
          position: relative;
          vertical-align: middle;

          .el-checkbox__inner {
            display: inline-block;
            position: relative;
            border: 1px solid #dcdfe6;
            border-radius: 2px;
            box-sizing: border-box;
            width: 14px;
            height: 14px;
            background-color: #fff;
            z-index: 1;
            transition: border-color .25s,background-color .25s;
            cursor: pointer;

            &:after {
              box-sizing: content-box;
              content: "";
              border: 1px solid #fff;
              border-left: 0;
              border-top: 0;
              height: 7px;
              left: 4px;
              position: absolute;
              top: 1px;
              transform: rotate(45deg) scaleY(0);
              width: 3px;
              transition: transform .15s ease-in .05s;
              transform-origin: center;
            }
          }

          &.is-checked {
            .el-checkbox__inner {
              background-color: #409eff;
              border-color: #409eff;

              &:after {
                transform: rotate(45deg) scaleY(1);
              }
            }
          }
        }

        .el-checkbox__label {
          font-size: 14px;
          padding-left: 10px;
        }
      }
    }

    .boolean-text-editing {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 4px 8px;
      box-sizing: border-box;
      font-size: 13px;
      font-weight: 500;
      color: #409eff;
      background-color: #ecf5ff;
      border: 1px solid #d9ecff;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: #d9ecff;
        border-color: #b3d8ff;
      }
    }
  }
}
</style>
