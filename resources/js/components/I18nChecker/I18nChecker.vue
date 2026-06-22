<template>
  <div class="i18n-checker">
    <div class="i18n-page-header">
      <div class="i18n-page-header-left">
        <h1 class="i18n-page-title">
          <I18nIcon name="i18n.title" />
          {{ $t('i18nChecker.title') || 'Проверка переводов i18n' }}
        </h1>
        <p class="i18n-page-subtitle">
          {{ $t('i18nChecker.subtitle') || 'Проверка и сканирование переводов' }}
        </p>
      </div>

      <div class="i18n-page-header-right">
        <el-button size="small" @click="showSettings = true">
          <I18nIcon name="settings" />
          {{ $t('i18nChecker.settings.open') || 'Настройки' }}
        </el-button>
      </div>
    </div>

    <div class="i18n-mode-switcher">
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'simple' }]"
          @click="switchMode('simple')"
      >
        <I18nIcon name="i18n.simpleMode" />
        <span>{{ $t('i18nChecker.simpleMode') || 'Простая проверка' }}</span>
      </button>
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'scanner' }]"
          @click="switchMode('scanner')"
      >
        <I18nIcon name="i18n.scannerMode" />
        <span>{{ $t('i18nChecker.scannerMode') || 'Сканер кода' }}</span>
      </button>
      <button
          :class="['i18n-mode-btn', { 'i18n-mode-active': currentMode === 'validator' }]"
          @click="switchMode('validator')"
      >
        <I18nIcon name="i18n.validatorMode" />
        <span>{{ $t('i18nChecker.validatorMode') || 'Проверка путей' }}</span>
      </button>
    </div>

    <div v-if="currentMode === 'simple'" class="i18n-mode-content">
      <I18nCheckerSimpleMode />
    </div>

    <div v-else-if="currentMode === 'scanner'" class="i18n-mode-content">
      <I18nScannerMode
          :loading="scannerLoading"
          :report="scannerReport"
          :error="scannerError"
          @scan="runScanner"
      />
    </div>

    <div v-else-if="currentMode === 'validator'" class="i18n-mode-content">
      <I18nValidatorMode
          :loading="validatorLoading"
          :report="validatorReport"
          :error="validatorError"
          @validate="runValidator"
      />
    </div>

    <I18nSettingsModal v-model="showSettings" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue';
import I18nCheckerSimpleMode from '@components/I18nChecker/components/I18nCheckerSimpleMode.vue';
import I18nScannerMode from '@components/I18nChecker/components/I18nScannerMode.vue';
import I18nValidatorMode from '@components/I18nChecker/components/I18nValidatorMode.vue';
import I18nSettingsModal from '@components/I18nChecker/components/settings/modals/I18nSettingsModal.vue';
import { useI18nChecker } from '@components/I18nChecker/composables/useI18nChecker.js';

const showSettings = ref(false);

const {
  currentMode,
  switchMode,
  scannerLoading,
  scannerReport,
  scannerError,
  runScanner,
  validatorLoading,
  validatorReport,
  validatorError,
  runValidator
} = useI18nChecker();
</script>

<style lang="scss" scoped>
.i18n-checker {
  padding: 4px;
  max-width: 1400px;
  margin: 0 auto;
}

.i18n-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
  gap: 16px;
}

.i18n-page-header-left {
  flex: 1;

  .i18n-page-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .i18n-page-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

.i18n-page-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.i18n-mode-switcher {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  padding: 4px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .i18n-mode-btn {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 10px;
    height: 30px;
    background: #f5f7fa;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    font-weight: 500;

    &:hover {
      background: #ecf5ff;
      border-color: #b3d8ff;
    }

    &.i18n-mode-active {
      background: #ecf5ff;
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

.i18n-mode-content {
  animation: i18n-fadeIn 0.3s ease;
}

@keyframes i18n-fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
