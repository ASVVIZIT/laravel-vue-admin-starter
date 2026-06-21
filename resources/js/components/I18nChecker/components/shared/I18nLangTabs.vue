<template>
  <div class="i18n-lang-tabs">
    <button
        v-for="(stats, lang) in languages"
        :key="lang"
        :class="['i18n-lang-tab', { 'i18n-lang-tab-active': modelValue === lang }]"
        @click="$emit('update:modelValue', lang)"
    >
      <span class="i18n-lang-flag">{{ getFlagEmoji(lang) }}</span>
      <span class="i18n-lang-name">{{ lang.toUpperCase() }}</span>
      <span class="i18n-lang-coverage" :class="{ 'i18n-lang-coverage-bad': stats.missing > 0 }">
        {{ stats.coverage || '0%' }}
      </span>
      <span class="i18n-lang-stats">
        <span class="i18n-lang-missing">−{{ stats.missing || 0 }}</span>
        <span class="i18n-lang-unused">~{{ stats.unused || 0 }}</span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { getFlagEmoji } from '@components/I18nChecker/config/languagesConfig.js';

defineProps({
  languages: {
    type: Object,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.i18n-lang-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 28px;
  min-height: 28px;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;

  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #c0c4cc; border-radius: 2px; }

  .i18n-lang-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    height: 22px;
    min-height: 22px;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 9px;

    &:hover {
      border-color: #b3d8ff;
      background: #ecf5ff;
    }

    &.i18n-lang-tab-active {
      background: #1890ff;
      border-color: #1890ff;
      color: #fff;

      .i18n-lang-coverage {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
      }

      .i18n-lang-stats {
        .i18n-lang-missing,
        .i18n-lang-unused {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .i18n-lang-flag { font-size: 10px; }
    .i18n-lang-name { font-weight: 600; font-size: 9px; }

    .i18n-lang-coverage {
      font-weight: 700;
      font-size: 9px;
      color: #52c41a;
      padding: 1px 3px;
      background: #f6ffed;
      border-radius: 2px;

      &.i18n-lang-coverage-bad {
        color: #ff4d4f;
        background: #fff1f0;
      }
    }

    .i18n-lang-stats {
      display: flex;
      gap: 2px;
      font-size: 8px;

      .i18n-lang-missing { color: #ff4d4f; }
      .i18n-lang-unused { color: #faad14; }
    }
  }
}
</style>
