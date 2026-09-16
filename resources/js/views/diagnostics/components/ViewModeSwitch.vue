<template>
  <div class="view-mode-switch" :class="{ 'is-vertical': modelValue === FIELD_LIST_CONFIG.VIEW_MODES.VERTICAL }">
    <!-- Скользящий фон: ездит ВЕРТИКАЛЬНО между словами -->
    <span class="switch-slider"></span>

    <button
        type="button"
        class="switch-option"
        :class="{ 'is-active': modelValue === FIELD_LIST_CONFIG.VIEW_MODES.HORIZONTAL }"
        @click="emit('update:modelValue', FIELD_LIST_CONFIG.VIEW_MODES.HORIZONTAL)"
    >
      {{ $t('diagnostics.fix.view_horizontal') }}
    </button>

    <button
        type="button"
        class="switch-option"
        :class="{ 'is-active': modelValue === FIELD_LIST_CONFIG.VIEW_MODES.VERTICAL }"
        @click="emit('update:modelValue', FIELD_LIST_CONFIG.VIEW_MODES.VERTICAL)"
    >
      {{ $t('diagnostics.fix.view_vertical') }}
    </button>
  </div>
</template>

<script setup>
import { FIELD_LIST_CONFIG } from '@/utils/diagnosticsActions'

defineProps({
  modelValue: {
    type: String,
    default: FIELD_LIST_CONFIG.DEFAULT_VIEW_MODE
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.view-mode-switch {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  user-select: none;

  // фон перелетает ВЕРТИКАЛЬНО (translateY)
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
    min-width: 118px;
    padding: 5px 14px;
    border: none;
    background: transparent;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    white-space: nowrap;
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

    // Mobile (<480px): компакт-режим, шрифт НЕ ниже 12px (WCAG AA)
    @media (max-width: 479px) {
      min-width: 104px;
      padding: 5px 8px;
      font-size: 12px;
    }
  }

  // ДОСТУПНОСТЬ: без анимаций при системной настройке reduced-motion (2026 must-have)
  @media (prefers-reduced-motion: reduce) {
    .switch-slider,
    .switch-option {
      transition: none;
    }
  }
}
</style>
