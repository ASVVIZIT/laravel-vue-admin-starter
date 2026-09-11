<template>
  <div class="view-mode-switch" :class="{ 'is-vertical': modelValue === 'vertical' }">
    <!-- Скользящий фон: ездит ВЕРТИКАЛЬНО между словами -->
    <span class="switch-slider"></span>

    <button
        type="button"
        class="switch-option"
        :class="{ 'is-active': modelValue === 'horizontal' }"
        @click="emit('update:modelValue', 'horizontal')"
    >
      {{ $t('diagnostics.fix.view_horizontal') }}
    </button>

    <button
        type="button"
        class="switch-option"
        :class="{ 'is-active': modelValue === 'vertical' }"
        @click="emit('update:modelValue', 'vertical')"
    >
      {{ $t('diagnostics.fix.view_vertical') }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  // 'horizontal' | 'vertical'
  modelValue: {
    type: String,
    default: 'vertical'
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.view-mode-switch {
  position: relative;
  display: inline-flex;
  flex-direction: column;        // 🔥 слова друг под другом
  align-items: stretch;
  border: 1px solid #dcdfe6;     // рамка вокруг обоих слов
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  user-select: none;

  // 🔥 фон перелетает ВЕРТИКАЛЬНО (translateY)
  .switch-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: #e6a23c;
    border-radius: 3px;
    transition: transform 0.25s ease;
    transform: translateY(0);
  }

  &.is-vertical .switch-slider {
    transform: translateY(100%);
  }

  .switch-option {
    position: relative;
    z-index: 1;
    min-width: 118px;            // 🔥 шире — первое слово влезает целиком
    padding: 5px 14px;
    border: none;
    background: transparent;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    white-space: nowrap;         // слово никогда не переносится
    color: #909399;
    cursor: pointer;
    transition: color 0.25s ease;

    &.is-active {
      color: #fff;
      font-weight: 600;
    }

    &:hover:not(.is-active) {
      color: #606266;
    }
  }
}
</style>
